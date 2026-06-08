// Shared helpers for TV show status filtering.
//
// A show is considered "ended" when TMDB reports its status as terminated
// (either "Ended" or "Canceled"). The "ended to finish" filter shows ended
// series that the user has NOT fully watched yet — once every episode has
// been seen, a terminated show is considered complete and is hidden.

export const ENDED_STATUSES = ['Ended', 'Canceled', 'Cancelled'];

// Statuses that mean more content (a new season) is still coming.
export const RETURNING_STATUSES = ['Returning Series', 'In Production', 'Planned'];

export function isEndedStatus(status?: string | null): boolean {
	return !!status && ENDED_STATUSES.includes(status);
}

export function isReturningStatus(status?: string | null): boolean {
	return !!status && RETURNING_STATUSES.includes(status);
}

export function isFullyWatched(watched: number, total?: number | null): boolean {
	return total != null && total > 0 && watched >= total;
}

/**
 * Returns true when a show should appear in the "ended series to finish" view:
 * it is terminated but the user still has episodes left to watch.
 */
export function isEndedToFinish(
	status: string | null | undefined,
	watched: number,
	total: number | null | undefined
): boolean {
	return isEndedStatus(status) && !isFullyWatched(watched, total);
}

/**
 * Returns true when a show should appear in the "waiting for a new season"
 * view: the show is still returning but no next episode is scheduled on
 * TMDB, so the current season has finished airing and nothing concrete is
 * coming soon.
 */
export function isWaitingForNewSeason(
	status: string | null | undefined,
	hasUpcomingEpisode: boolean | null | undefined
): boolean {
	return isReturningStatus(status) && !hasUpcomingEpisode;
}

/**
 * Returns true when a show should appear in the "ongoing & renewed" view:
 * the show is returning AND TMDB has a `next_episode_to_air` scheduled,
 * meaning more content is concretely on the way (mid-season or imminent
 * release). Independent of whether the user is caught up.
 */
export function isOngoingRenewed(
	status: string | null | undefined,
	hasUpcomingEpisode: boolean | null | undefined
): boolean {
	return isReturningStatus(status) && !!hasUpcomingEpisode;
}

export type SeriesFilterMode = 'all' | 'ended' | 'returning' | 'ongoing';
