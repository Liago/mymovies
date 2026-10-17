import { buildAiredSeasons, type ShowProgressInfo } from './progress';
import { STREAMING_SERVICES, WATCH_REGION } from './services';
import type { WatchProvider } from './tmdb';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/';

function regionOf(language: string): string {
	return language.split('-')[1] || WATCH_REGION;
}

/** Nome breve del provider: per i servizi principali usa la dicitura del design. */
function providerLabel(id: number, fallback: string): string {
	return STREAMING_SERVICES.find((s) => s.providerId === id)?.name ?? fallback;
}

interface TmdbEpisode {
	season_number: number;
	episode_number: number;
	name: string;
	air_date: string | null;
	still_path?: string | null;
	runtime?: number | null;
}

/** Campi usati del dettaglio serie TMDB. */
interface TmdbTVDetails {
	name: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	status?: string | null;
	seasons?: { season_number: number; episode_count?: number }[];
	last_episode_to_air?: TmdbEpisode | null;
	next_episode_to_air?: TmdbEpisode | null;
	episode_run_time?: number[];
	networks?: { name: string }[];
}

async function tvDetails(id: number, language: string): Promise<TmdbTVDetails | null> {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=${language}`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}

/** Primo servizio in abbonamento per la serie nella regione dell'utente. */
async function tvProvider(id: number, language: string): Promise<string | null> {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(`${BASE_URL}/tv/${id}/watch/providers?api_key=${TMDB_API_KEY}`, {
			next: { revalidate: 21600 },
		});
		if (!res.ok) return null;
		const data = await res.json();
		const country = data.results?.[regionOf(language)];
		const all: WatchProvider[] = [...(country?.flatrate || []), ...(country?.free || []), ...(country?.ads || [])];
		const p = all.sort((a, b) => a.display_priority - b.display_priority)[0];
		return p ? providerLabel(p.provider_id, p.provider_name) : null;
	} catch {
		return null;
	}
}

export async function getShowProgressInfo(id: number, language: string = 'it-IT'): Promise<ShowProgressInfo | null> {
	const [data, provider] = await Promise.all([tvDetails(id, language), tvProvider(id, language)]);
	if (!data) return null;

	const last = data.last_episode_to_air
		? { season: data.last_episode_to_air.season_number, episode: data.last_episode_to_air.episode_number }
		: null;
	const seasons = buildAiredSeasons(
		(data.seasons || []).map((s) => ({ seasonNumber: s.season_number, episodeCount: s.episode_count || 0 })),
		last
	);

	return {
		id,
		name: data.name,
		poster: data.poster_path ? `${IMG}w500${data.poster_path}` : null,
		backdrop: data.backdrop_path ? `${IMG}w780${data.backdrop_path}` : null,
		status: data.status ?? null,
		seasons,
		totalAired: seasons.reduce((sum, s) => sum + s.count, 0),
		runtime: data.episode_run_time?.[0] || data.last_episode_to_air?.runtime || null,
		provider: provider ?? data.networks?.[0]?.name ?? null,
		nextAirDate: data.next_episode_to_air?.air_date ?? null,
	};
}

export interface EpisodeInfo {
	showId: number;
	season: number;
	episode: number;
	name: string;
	still: string | null;
	runtime: number | null;
	airDate: string | null;
}

export async function getEpisodeInfo(
	showId: number,
	season: number,
	episode: number,
	language: string = 'it-IT'
): Promise<EpisodeInfo | null> {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(
			`${BASE_URL}/tv/${showId}/season/${season}/episode/${episode}?api_key=${TMDB_API_KEY}&language=${language}`,
			{ next: { revalidate: 86400 } }
		);
		if (!res.ok) return null;
		const data = await res.json();
		return {
			showId,
			season,
			episode,
			name: data.name || `Episodio ${episode}`,
			still: data.still_path ? `${IMG}w780${data.still_path}` : null,
			runtime: data.runtime || null,
			airDate: data.air_date || null,
		};
	} catch {
		return null;
	}
}

export interface CalendarEpisode {
	showId: number;
	showName: string;
	showPoster: string | null;
	still: string | null;
	season: number;
	episode: number;
	name: string;
	airDate: string;
	provider: string | null;
}

export interface CalendarResult {
	/** Episodi con data di uscita nell'intervallo richiesto. */
	inRange: CalendarEpisode[];
	/** Prossimi episodi annunciati dopo l'intervallo. */
	later: CalendarEpisode[];
}

/**
 * Episodi delle serie seguite usciti/in uscita tra `from` e `to` (YYYY-MM-DD,
 * estremi inclusi). Controlla la stagione dell'ultimo e del prossimo episodio,
 * così anche le uscite in blocco (binge drop) compaiono tutte.
 */
export async function getCalendarEpisodes(
	showIds: number[],
	from: string,
	to: string,
	language: string = 'it-IT'
): Promise<CalendarResult> {
	if (!TMDB_API_KEY || showIds.length === 0) return { inRange: [], later: [] };

	const perShow = await Promise.all(
		showIds.slice(0, 60).map(async (id) => {
			const [data, provider] = await Promise.all([tvDetails(id, language), tvProvider(id, language)]);
			if (!data) return { inRange: [] as CalendarEpisode[], later: [] as CalendarEpisode[] };

			const base = {
				showId: id,
				showName: data.name,
				showPoster: data.poster_path ? `${IMG}w300${data.poster_path}` : null,
				provider: provider ?? data.networks?.[0]?.name ?? null,
			};
			const backdrop = data.backdrop_path ? `${IMG}w300${data.backdrop_path}` : null;

			const seasonNumbers = new Set<number>();
			if (data.last_episode_to_air?.season_number) seasonNumbers.add(data.last_episode_to_air.season_number);
			if (data.next_episode_to_air?.season_number) seasonNumbers.add(data.next_episode_to_air.season_number);

			const inRange: CalendarEpisode[] = [];
			await Promise.all(
				Array.from(seasonNumbers).map(async (season) => {
					try {
						const res = await fetch(
							`${BASE_URL}/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}&language=${language}`,
							{ next: { revalidate: 3600 } }
						);
						if (!res.ok) return;
						const s: { episodes?: TmdbEpisode[] } = await res.json();
						for (const ep of s.episodes || []) {
							if (!ep.air_date || ep.air_date < from || ep.air_date > to) continue;
							inRange.push({
								...base,
								still: ep.still_path ? `${IMG}w300${ep.still_path}` : backdrop,
								season: ep.season_number,
								episode: ep.episode_number,
								name: ep.name,
								airDate: ep.air_date,
							});
						}
					} catch {
						/* stagione non disponibile: si ignora */
					}
				})
			);

			const later: CalendarEpisode[] = [];
			const next = data.next_episode_to_air;
			if (next?.air_date && next.air_date > to) {
				later.push({
					...base,
					still: next.still_path ? `${IMG}w300${next.still_path}` : backdrop,
					season: next.season_number,
					episode: next.episode_number,
					name: next.name,
					airDate: next.air_date,
				});
			}

			return { inRange, later };
		})
	);

	const byDate = (a: CalendarEpisode, b: CalendarEpisode) =>
		a.airDate.localeCompare(b.airDate) || a.showName.localeCompare(b.showName) || a.episode - b.episode;

	return {
		inRange: perShow.flatMap((r) => r.inRange).sort(byDate),
		later: perShow.flatMap((r) => r.later).sort(byDate),
	};
}
