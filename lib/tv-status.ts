// Shared helpers for TV show status filtering.
//
// A show is considered "ended" when TMDB reports its status as terminated
// (either "Ended" or "Canceled"). The "ended to finish" filter shows ended
// series that the user has NOT fully watched yet — once every episode has
// been seen, a terminated show is considered complete and is hidden.

export const ENDED_STATUSES = ['Ended', 'Canceled', 'Cancelled'];

export function isEndedStatus(status?: string | null): boolean {
	return !!status && ENDED_STATUSES.includes(status);
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
