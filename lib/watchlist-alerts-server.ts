import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { getMovieWatchProviders, getTVWatchProviders } from '@/lib/tmdb';
import { WATCH_REGION } from '@/lib/services';
import type { AvailabilityMediaType } from '@/lib/availability';
import {
	ALERT_CHECK_INTERVAL_MS,
	buildSnapshot,
	diffAvailability,
	mergeChanges,
	type AlertChange,
	type AlertKind,
	type AvailabilitySnapshot,
	type NotifiedProviders,
	type SnapshotResult,
	type WatchlistAlert,
} from '@/lib/watchlist-alerts';

const CONCURRENCY = 6;
/** Limite di titoli per controllo avviato dall'app (il cron non ha limiti). */
export const INTERACTIVE_CHECK_LIMIT = 60;

interface WatchlistRow {
	media_id: number;
	media_type: AvailabilityMediaType;
	title: string;
	poster_path: string | null;
}

interface AvailabilityRow {
	media_id: number;
	media_type: AvailabilityMediaType;
	snapshot: AvailabilitySnapshot;
	notified: NotifiedProviders;
	checked_at: string;
}

export interface AlertRow {
	id: number;
	media_id: number;
	media_type: AvailabilityMediaType;
	title: string;
	poster_path: string | null;
	kinds: AlertKind[];
	providers: AlertChange['providers'];
	link: string | null;
	created_at: string;
	read_at: string | null;
}

export function toWatchlistAlert(row: AlertRow): WatchlistAlert {
	return {
		id: String(row.id),
		mediaId: row.media_id,
		mediaType: row.media_type,
		title: row.title,
		poster: row.poster_path,
		kinds: row.kinds,
		providers: row.providers ?? {},
		link: row.link,
		createdAt: row.created_at,
		read: row.read_at !== null,
	};
}

const regionLanguage = `it-${WATCH_REGION}`;

export async function fetchSnapshot(id: number, type: AvailabilityMediaType): Promise<SnapshotResult> {
	const data = type === 'tv' ? await getTVWatchProviders(id, regionLanguage) : await getMovieWatchProviders(id, regionLanguage);
	return buildSnapshot(data);
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
	const results: R[] = new Array(items.length);
	let next = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await fn(items[index]);
		}
	});
	await Promise.all(workers);
	return results;
}

const itemKey = (type: string, id: number) => `${type}:${id}`;

/**
 * Controlla la disponibilità dei titoli in watchlist di un utente e registra
 * gli avvisi per le novità. Restituisce solo gli avvisi creati o aggiornati ora.
 */
export async function checkWatchlistAvailability(
	supabase: SupabaseClient,
	userId: number,
	options: { limit?: number; force?: boolean } = {}
): Promise<WatchlistAlert[]> {
	const [{ data: watchlist, error: watchlistError }, { data: states, error: statesError }] = await Promise.all([
		supabase.from('watchlist').select('media_id, media_type, title, poster_path').eq('user_id', userId),
		supabase.from('watchlist_availability').select('media_id, media_type, snapshot, notified, checked_at').eq('user_id', userId),
	]);
	if (watchlistError) throw watchlistError;
	if (statesError) throw statesError;

	const items = (watchlist ?? []) as WatchlistRow[];
	const stateByKey = new Map<string, AvailabilityRow>(
		((states ?? []) as AvailabilityRow[]).map((s) => [itemKey(s.media_type, s.media_id), s])
	);

	// Pulizia delle fotografie di titoli usciti dalla watchlist
	const inWatchlist = new Set(items.map((i) => itemKey(i.media_type, i.media_id)));
	const stale = [...stateByKey.values()].filter((s) => !inWatchlist.has(itemKey(s.media_type, s.media_id)));
	for (const s of stale) {
		await supabase.from('watchlist_availability').delete().match({ user_id: userId, media_id: s.media_id, media_type: s.media_type });
	}

	// Prima i titoli mai controllati, poi quelli controllati da più tempo
	const now = Date.now();
	const due = items
		.map((item) => ({ item, state: stateByKey.get(itemKey(item.media_type, item.media_id)) }))
		.filter(({ state }) => options.force || !state || now - new Date(state.checked_at).getTime() >= ALERT_CHECK_INTERVAL_MS)
		.sort((a, b) => (a.state ? new Date(a.state.checked_at).getTime() : 0) - (b.state ? new Date(b.state.checked_at).getTime() : 0))
		.slice(0, options.limit ?? Infinity);

	if (!due.length) return [];

	const checked = await mapWithConcurrency(due, CONCURRENCY, async ({ item, state }) => {
		const { snapshot, link } = await fetchSnapshot(item.media_id, item.media_type);
		const { change, notified } = diffAvailability(state?.snapshot ?? null, state?.notified ?? null, snapshot);
		return { item, snapshot, link, change, notified };
	});

	const checkedAt = new Date().toISOString();
	const { error: upsertError } = await supabase.from('watchlist_availability').upsert(
		checked.map(({ item, snapshot, notified }) => ({
			user_id: userId,
			media_id: item.media_id,
			media_type: item.media_type,
			snapshot,
			notified,
			checked_at: checkedAt,
		})),
		{ onConflict: 'user_id,media_id,media_type' }
	);
	if (upsertError) throw upsertError;

	const created: WatchlistAlert[] = [];
	for (const { item, link, change } of checked) {
		if (!change) continue;

		// Un avviso non letto dello stesso titolo viene aggiornato invece di duplicarlo
		const { data: unread } = await supabase
			.from('watchlist_alerts')
			.select('*')
			.match({ user_id: userId, media_id: item.media_id, media_type: item.media_type })
			.is('read_at', null)
			.order('created_at', { ascending: false })
			.limit(1)
			.maybeSingle();

		const merged = unread ? mergeChanges({ kinds: unread.kinds, providers: unread.providers ?? {} }, change) : change;
		const record = {
			user_id: userId,
			media_id: item.media_id,
			media_type: item.media_type,
			title: item.title,
			poster_path: item.poster_path,
			kinds: merged.kinds,
			providers: merged.providers,
			link,
			created_at: checkedAt,
		};

		const { data: saved, error } = unread
			? await supabase.from('watchlist_alerts').update(record).eq('id', unread.id).select('*').single()
			: await supabase.from('watchlist_alerts').insert(record).select('*').single();
		if (error) {
			console.error('Error saving watchlist alert:', error);
			continue;
		}
		created.push(toWatchlistAlert(saved as AlertRow));
	}

	return created;
}
