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
 * view: the user has watched every aired episode and the show is still
 * returning (a new season is expected).
 */
export function isWaitingForNewSeason(
	status: string | null | undefined,
	watched: number,
	total: number | null | undefined
): boolean {
	return isReturningStatus(status) && isFullyWatched(watched, total);
}

/**
 * Returns true when a show should appear in the "ongoing & renewed" view:
 * it has already been renewed for more episodes/seasons (a "returning
 * series") and the user still has aired episodes left to catch up on.
 */
export function isOngoingRenewed(
	status: string | null | undefined,
	watched: number,
	total: number | null | undefined
): boolean {
	return isReturningStatus(status) && !isFullyWatched(watched, total);
}

export type SeriesFilterMode = 'all' | 'ended' | 'returning' | 'ongoing';
