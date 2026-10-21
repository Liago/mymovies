import type { WatchProvider, WatchProviderData } from '@/lib/tmdb';
import type { AvailabilityMediaType, AvailabilityProvider } from '@/lib/availability';
import { episodeCode } from '@/lib/format';

/**
 * Logica (isomorfa) degli avvisi: disponibilità dei titoli in watchlist e
 * nuovi episodi andati in onda delle serie seguite.
 *
 * Disponibilità.
 *
 * Per ogni titolo si conserva una "fotografia" dei provider per categoria
 * e l'insieme dei provider già segnalati. Un avviso nasce solo quando:
 * - una categoria passa da vuota a disponibile (es. arriva il noleggio);
 * - in streaming compare un servizio mai segnalato prima per quel titolo.
 * La prima fotografia fa da base (nessun avviso: il titolo era già così quando
 * è entrato in watchlist) e i provider che spariscono e ricompaiono, frequenti
 * nei dati JustWatch, non generano doppioni.
 */

export type AlertKind = 'stream' | 'rent' | 'buy';

export const ALERT_KINDS: AlertKind[] = ['stream', 'rent', 'buy'];

/** Ogni quanto un titolo può essere ricontrollato. */
export const ALERT_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;

/** Ogni quanto una serie seguita può essere ricontrollata per i nuovi episodi. */
export const EPISODE_CHECK_INTERVAL_MS = 3 * 60 * 60 * 1000;

export type AlertSource = 'availability' | 'episode';

export type AvailabilitySnapshot = Record<AlertKind, AvailabilityProvider[]>;

/** Id dei provider già segnalati (o presenti nella fotografia di base), per categoria. */
export type NotifiedProviders = Record<AlertKind, number[]>;

export interface AlertChange {
	/** Categorie coinvolte, in ordine di importanza (streaming prima). */
	kinds: AlertKind[];
	/** Solo i provider nuovi, per categoria. */
	providers: Partial<Record<AlertKind, AvailabilityProvider[]>>;
}

export interface EpisodeRef {
	season: number;
	episode: number;
}

export interface AiredEpisode extends EpisodeRef {
	name: string;
	airDate: string | null;
}

/** Dettaglio di un avviso "nuovo episodio": l'ultimo uscito e quanti ne sono usciti dall'ultimo controllo. */
export interface EpisodeAlertInfo extends AiredEpisode {
	newCount: number;
	provider: string | null;
}

export interface WatchlistAlert extends AlertChange {
	id: string;
	source: AlertSource;
	episode: EpisodeAlertInfo | null;
	mediaId: number;
	mediaType: AvailabilityMediaType;
	title: string;
	poster: string | null;
	link: string | null;
	createdAt: string;
	read: boolean;
}

export interface AlertSubject {
	id: number;
	type: AvailabilityMediaType;
}

export interface SnapshotResult {
	snapshot: AvailabilitySnapshot;
	link: string | null;
}

export function emptySnapshot(): AvailabilitySnapshot {
	return { stream: [], rent: [], buy: [] };
}

function toProviders(buckets: (WatchProvider[] | undefined)[]): AvailabilityProvider[] {
	const seen = new Map<number, AvailabilityProvider>();
	const all = buckets
		.flatMap((bucket) => bucket ?? [])
		.sort((a, b) => a.display_priority - b.display_priority);
	for (const p of all) {
		if (!seen.has(p.provider_id)) {
			seen.set(p.provider_id, { id: p.provider_id, name: p.provider_name, logoPath: p.logo_path });
		}
	}
	return Array.from(seen.values());
}

/** Fotografia completa dei provider (streaming = abbonamento, gratis e con pubblicità). */
export function buildSnapshot(data: WatchProviderData | null): SnapshotResult {
	if (!data) return { snapshot: emptySnapshot(), link: null };
	return {
		snapshot: {
			stream: toProviders([data.flatrate, data.free, data.ads]),
			rent: toProviders([data.rent]),
			buy: toProviders([data.buy]),
		},
		link: data.link || null,
	};
}

export function notifiedFromSnapshot(snapshot: AvailabilitySnapshot): NotifiedProviders {
	return {
		stream: snapshot.stream.map((p) => p.id),
		rent: snapshot.rent.map((p) => p.id),
		buy: snapshot.buy.map((p) => p.id),
	};
}

/**
 * Confronta la fotografia precedente con quella attuale.
 * Restituisce l'eventuale avviso e l'insieme aggiornato dei provider segnalati.
 */
export function diffAvailability(
	previous: AvailabilitySnapshot | null,
	notified: NotifiedProviders | null,
	current: AvailabilitySnapshot
): { change: AlertChange | null; notified: NotifiedProviders } {
	// Prima fotografia: fa da base, nessun avviso.
	if (!previous || !notified) {
		return { change: null, notified: notifiedFromSnapshot(current) };
	}

	const nextNotified: NotifiedProviders = {
		stream: [...notified.stream],
		rent: [...notified.rent],
		buy: [...notified.buy],
	};
	const change: AlertChange = { kinds: [], providers: {} };

	for (const kind of ALERT_KINDS) {
		const known = new Set(notified[kind]);
		const fresh = current[kind].filter((p) => !known.has(p.id));
		if (!fresh.length) continue;

		nextNotified[kind].push(...fresh.map((p) => p.id));

		const becameAvailable = previous[kind].length === 0;
		// Noleggio e acquisto: basta sapere che sono arrivati, non ogni nuovo negozio.
		if (kind === 'stream' || becameAvailable) {
			change.kinds.push(kind);
			change.providers[kind] = fresh;
		}
	}

	return { change: change.kinds.length ? change : null, notified: nextNotified };
}

/** Unisce un nuovo cambiamento a un avviso non ancora letto dello stesso titolo. */
export function mergeChanges(base: AlertChange, extra: AlertChange): AlertChange {
	const providers: AlertChange['providers'] = { ...base.providers };
	for (const kind of extra.kinds) {
		const merged = new Map<number, AvailabilityProvider>();
		for (const p of [...(providers[kind] ?? []), ...(extra.providers[kind] ?? [])]) merged.set(p.id, p);
		providers[kind] = Array.from(merged.values());
	}
	return {
		kinds: ALERT_KINDS.filter((k) => base.kinds.includes(k) || extra.kinds.includes(k)),
		providers,
	};
}

function joinNames(providers: AvailabilityProvider[] | undefined, max = 2): string {
	const names = (providers ?? []).map((p) => p.name);
	if (names.length <= max) return names.join(' e ');
	return `${names.slice(0, max).join(', ')} e altri ${names.length - max}`;
}

function compareEpisodes(a: EpisodeRef, b: EpisodeRef): number {
	return a.season - b.season || a.episode - b.episode;
}

/**
 * Nuovi episodi andati in onda rispetto all'ultimo registrato.
 * Il primo controllo (nessun episodio registrato) fa da base: nessun avviso.
 */
export function diffEpisodes(previous: EpisodeRef | null, latest: AiredEpisode | null): { newCount: number } | null {
	if (!previous || !latest || compareEpisodes(latest, previous) <= 0) return null;
	// Nella stessa stagione si contano gli episodi; con una nuova stagione quelli usciti finora
	const newCount = latest.season === previous.season ? latest.episode - previous.episode : latest.episode;
	return { newCount: Math.max(1, newCount) };
}

/** Unisce un nuovo episodio a un avviso non ancora letto della stessa serie. */
export function mergeEpisodes(base: EpisodeAlertInfo, extra: EpisodeAlertInfo): EpisodeAlertInfo {
	const latest = compareEpisodes(extra, base) >= 0 ? extra : base;
	return { ...latest, newCount: base.newCount + extra.newCount, provider: extra.provider ?? base.provider };
}

/** Testo breve di un nuovo episodio, es. "Nuovo episodio S2 · E5 «Titolo» su Netflix". */
export function describeEpisode(info: EpisodeAlertInfo): string {
	const code = episodeCode(info.season, info.episode);
	const name = info.name && !/^(episodio|episode) \d+$/i.test(info.name) ? ` «${info.name}»` : '';
	const where = info.provider ? ` su ${info.provider}` : '';
	return info.newCount > 1
		? `${info.newCount} nuovi episodi, l'ultimo ${code}${name}${where}`
		: `Nuovo episodio ${code}${name}${where}`;
}

/** Testo breve di un avviso di qualsiasi tipo. */
export function describeAlert(alert: Pick<WatchlistAlert, 'source' | 'episode' | 'kinds' | 'providers'>): string {
	if (alert.source === 'episode' && alert.episode) return describeEpisode(alert.episode);
	return describeAvailability(alert);
}

/** Testo breve della disponibilità, es. "Ora in streaming su Netflix · a noleggio su Apple TV". */
export function describeAvailability(alert: AlertChange): string {
	const parts: string[] = [];
	for (const kind of alert.kinds) {
		const names = joinNames(alert.providers[kind]);
		const label =
			kind === 'stream' ? `in streaming su ${names}` : kind === 'rent' ? `a noleggio su ${names}` : `in vendita su ${names}`;
		parts.push(parts.length ? label : `Ora ${label}`);
	}
	return parts.join(' · ');
}
