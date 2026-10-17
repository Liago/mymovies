/**
 * Calcolo dei progressi di visione di una serie, condiviso da Home, Serie e
 * Tracker. Funzioni pure: nessuna dipendenza da server o browser.
 */

/** Episodi già andati in onda di una stagione regolare (stagione 0 esclusa). */
export interface AiredSeason {
	season: number;
	count: number;
}

/** Dati TMDB minimi per seguire una serie. */
export interface ShowProgressInfo {
	id: number;
	name: string;
	poster: string | null;
	backdrop: string | null;
	status: string | null;
	seasons: AiredSeason[];
	totalAired: number;
	/** Durata media di un episodio in minuti. */
	runtime: number | null;
	/** Primo servizio streaming in Italia (o la rete di messa in onda). */
	provider: string | null;
	nextAirDate: string | null;
}

export interface EpisodeRef {
	season: number;
	episode: number;
}

export interface ShowProgress {
	watched: number;
	total: number;
	next: EpisodeRef | null;
	pct: number;
	started: boolean;
	completed: boolean;
}

interface SeasonSummary {
	seasonNumber: number;
	episodeCount: number;
}

/**
 * Riduce l'elenco stagioni TMDB ai soli episodi usciti, usando l'ultimo
 * episodio trasmesso come confine (le stagioni annunciate non contano).
 */
export function buildAiredSeasons(
	seasons: SeasonSummary[],
	lastEpisodeToAir: EpisodeRef | null | undefined
): AiredSeason[] {
	const regular = seasons.filter((s) => s.seasonNumber > 0).sort((a, b) => a.seasonNumber - b.seasonNumber);
	if (!lastEpisodeToAir) return [];
	return regular
		.filter((s) => s.seasonNumber <= lastEpisodeToAir.season)
		.map((s) => ({
			season: s.seasonNumber,
			count: s.seasonNumber === lastEpisodeToAir.season ? lastEpisodeToAir.episode : s.episodeCount,
		}))
		.filter((s) => s.count > 0);
}

export function computeProgress(
	seasons: AiredSeason[],
	isWatched: (season: number, episode: number) => boolean
): ShowProgress {
	let watched = 0;
	let total = 0;
	let next: EpisodeRef | null = null;

	for (const { season, count } of seasons) {
		for (let episode = 1; episode <= count; episode++) {
			total++;
			if (isWatched(season, episode)) watched++;
			else if (!next) next = { season, episode };
		}
	}

	return {
		watched,
		total,
		next,
		pct: total ? Math.round((watched / total) * 100) : 0,
		started: watched > 0,
		completed: total > 0 && watched >= total,
	};
}
