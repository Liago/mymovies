import 'server-only';

import type { SupabaseClient } from '@supabase/supabase-js';
import { getMovieWatchProviders, getTVWatchProviders } from '@/lib/tmdb';
import { getLatestAiredEpisode } from '@/lib/tmdb-shows';
import { WATCH_REGION } from '@/lib/services';
import type { AvailabilityMediaType } from '@/lib/availability';
import {
	ALERT_CHECK_INTERVAL_MS,
	EPISODE_CHECK_INTERVAL_MS,
	buildSnapshot,
	diffAvailability,
	diffEpisodes,
	mergeChanges,
	mergeEpisodes,
	type AlertChange,
	type AlertKind,
	type AlertSource,
	type AvailabilitySnapshot,
	type EpisodeAlertInfo,
	type EpisodeRef,
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

interface TrackedShowRow {
	show_id: number;
	name: string;
	poster_path: string | null;
}

interface AiringRow {
	show_id: number;
	last_season: number | null;
	last_episode: number | null;
	checked_at: string;
}

export interface AlertRow {
	id: number;
	source: AlertSource;
	media_id: number;
	media_type: AvailabilityMediaType;
	title: string;
	poster_path: string | null;
	kinds: AlertKind[];
	providers: AlertChange['providers'];
	episode: EpisodeAlertInfo | null;
	link: string | null;
	created_at: string;
	read_at: string | null;
}

export function toWatchlistAlert(row: AlertRow): WatchlistAlert {
	return {
		id: String(row.id),
		source: row.source ?? 'availability',
		mediaId: row.media_id,
		mediaType: row.media_type,
		title: row.title,
		poster: row.poster_path,
		kinds: row.kinds ?? [],
		providers: row.providers ?? {},
		episode: row.episode ?? null,
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

export async function fetchLatestEpisode(showId: number) {
	return getLatestAiredEpisode(showId, regionLanguage);
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

const isDue = (checkedAt: string | undefined, interval: number, now: number) =>
	!checkedAt || now - new Date(checkedAt).getTime() >= interval;

const checkedTime = (checkedAt: string | undefined) => (checkedAt ? new Date(checkedAt).getTime() : 0);

interface AlertInput {
	source: AlertSource;
	mediaId: number;
	mediaType: AvailabilityMediaType;
	title: string;
	poster: string | null;
	link: string | null;
	change: AlertChange | null;
	episode: EpisodeAlertInfo | null;
}

/** Salva un avviso; se ne esiste uno non letto dello stesso titolo e tipo lo aggiorna invece di duplicarlo. */
async function saveAlert(supabase: SupabaseClient, userId: number, input: AlertInput, createdAt: string): Promise<WatchlistAlert | null> {
	const { data: unread } = await supabase
		.from('watchlist_alerts')
		.select('*')
		.match({ user_id: userId, media_id: input.mediaId, media_type: input.mediaType, source: input.source })
		.is('read_at', null)
		.order('created_at', { ascending: false })
		.limit(1)
		.maybeSingle();

	const previous = unread as AlertRow | null;
	const change = input.change && previous ? mergeChanges({ kinds: previous.kinds, providers: previous.providers ?? {} }, input.change) : input.change;
	const episode = input.episode && previous?.episode ? mergeEpisodes(previous.episode, input.episode) : input.episode;

	const record = {
		user_id: userId,
		source: input.source,
		media_id: input.mediaId,
		media_type: input.mediaType,
		title: input.title,
		poster_path: input.poster,
		kinds: change?.kinds ?? [],
		providers: change?.providers ?? {},
		episode,
		link: input.link,
		created_at: createdAt,
	};

	const { data: saved, error } = previous
		? await supabase.from('watchlist_alerts').update(record).eq('id', previous.id).select('*').single()
		: await supabase.from('watchlist_alerts').insert(record).select('*').single();
	if (error) {
		console.error('Error saving alert:', error);
		return null;
	}
	return toWatchlistAlert(saved as AlertRow);
}

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
		.filter(({ state }) => options.force || isDue(state?.checked_at, ALERT_CHECK_INTERVAL_MS, now))
		.sort((a, b) => checkedTime(a.state?.checked_at) - checkedTime(b.state?.checked_at))
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
		const saved = await saveAlert(
			supabase,
			userId,
			{
				source: 'availability',
				mediaId: item.media_id,
				mediaType: item.media_type,
				title: item.title,
				poster: item.poster_path,
				link,
				change,
				episode: null,
			},
			checkedAt
		);
		if (saved) created.push(saved);
	}

	return created;
}

/**
 * Controlla le serie seguite nel Tracker e registra un avviso per ogni nuovo
 * episodio andato in onda (esclusi quelli già segnati come visti).
 */
export async function checkTrackedEpisodes(
	supabase: SupabaseClient,
	userId: number,
	options: { limit?: number; force?: boolean } = {}
): Promise<WatchlistAlert[]> {
	const [{ data: shows, error: showsError }, { data: states, error: statesError }] = await Promise.all([
		supabase.from('tracked_shows').select('show_id, name, poster_path').eq('user_id', userId),
		supabase.from('tracked_show_airing').select('show_id, last_season, last_episode, checked_at').eq('user_id', userId),
	]);
	if (showsError) throw showsError;
	if (statesError) throw statesError;

	const tracked = (shows ?? []) as TrackedShowRow[];
	const stateById = new Map<number, AiringRow>(((states ?? []) as AiringRow[]).map((s) => [s.show_id, s]));

	// Pulizia delle serie non più seguite
	const trackedIds = new Set(tracked.map((s) => s.show_id));
	const stale = [...stateById.keys()].filter((id) => !trackedIds.has(id));
	if (stale.length) {
		await supabase.from('tracked_show_airing').delete().eq('user_id', userId).in('show_id', stale);
	}

	const now = Date.now();
	const due = tracked
		.map((show) => ({ show, state: stateById.get(show.show_id) }))
		.filter(({ state }) => options.force || isDue(state?.checked_at, EPISODE_CHECK_INTERVAL_MS, now))
		.sort((a, b) => checkedTime(a.state?.checked_at) - checkedTime(b.state?.checked_at))
		.slice(0, options.limit ?? Infinity);

	if (!due.length) return [];

	const checked = await mapWithConcurrency(due, CONCURRENCY, async ({ show, state }) => {
		const latest = await fetchLatestEpisode(show.show_id);
		// Serie già controllata ma ancora senza episodi: la prima puntata conta come novità
		const previous: EpisodeRef | null = state
			? state.last_season !== null && state.last_episode !== null
				? { season: state.last_season, episode: state.last_episode }
				: { season: 0, episode: 0 }
			: null;
		return { show, state, latest, diff: diffEpisodes(previous, latest?.episode ?? null) };
	});

	const checkedAt = new Date().toISOString();
	// Se TMDB non risponde si conserva l'ultimo episodio noto, e la base non viene creata
	const { error: upsertError } = await supabase.from('tracked_show_airing').upsert(
		checked.filter(({ state, latest }) => latest || state).map(({ show, state, latest }) => ({
			user_id: userId,
			show_id: show.show_id,
			last_season: latest ? latest.episode?.season ?? null : state?.last_season ?? null,
			last_episode: latest ? latest.episode?.episode ?? null : state?.last_episode ?? null,
			checked_at: checkedAt,
		})),
		{ onConflict: 'user_id,show_id' }
	);
	if (upsertError) throw upsertError;

	const withNews = checked.filter((c) => c.diff && c.latest?.episode);
	if (!withNews.length) return [];

	// Niente avviso per un episodio già segnato come visto (es. visto altrove)
	const { data: watched } = await supabase
		.from('watched_episodes')
		.select('show_id, season_number, episode_number')
		.eq('user_id', userId)
		.in('show_id', withNews.map((c) => c.show.show_id));
	const watchedKeys = new Set(
		((watched ?? []) as { show_id: number; season_number: number; episode_number: number }[]).map(
			(w) => `${w.show_id}:${w.season_number}:${w.episode_number}`
		)
	);

	const created: WatchlistAlert[] = [];
	for (const { show, latest, diff } of withNews) {
		const episode = latest!.episode!;
		if (watchedKeys.has(`${show.show_id}:${episode.season}:${episode.episode}`)) continue;

		const saved = await saveAlert(
			supabase,
			userId,
			{
				source: 'episode',
				mediaId: show.show_id,
				mediaType: 'tv',
				title: show.name || latest!.name,
				poster: show.poster_path ?? latest!.poster,
				link: null,
				change: null,
				episode: { ...episode, newCount: diff!.newCount, provider: latest!.provider },
			},
			checkedAt
		);
		if (saved) created.push(saved);
	}

	return created;
}

/** Tutti i controlli per un utente: disponibilità della watchlist e nuovi episodi. */
export async function checkUserAlerts(
	supabase: SupabaseClient,
	userId: number,
	options: { limit?: number; force?: boolean } = {}
): Promise<WatchlistAlert[]> {
	const [availability, episodes] = await Promise.all([
		checkWatchlistAvailability(supabase, userId, options),
		checkTrackedEpisodes(supabase, userId, options),
	]);
	return [...episodes, ...availability];
}
