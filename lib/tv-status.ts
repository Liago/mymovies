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
 * Returns true when a show should appear in the "currently watching" view:
 * at least one episode has already aired and the user still has episodes left
 * to watch, whatever the show's TMDB status is. Shows whose episode count is
 * unknown are kept in, since we cannot prove they are complete; shows that
 * have not premiered yet are excluded — there is nothing to watch.
 */
export function isWatching(
	watched: number,
	total: number | null | undefined,
	hasAired: boolean | null | undefined
): boolean {
	return hasAired !== false && !isFullyWatched(watched, total);
}

/**
 * Returns true when a show should appear in the "upcoming" view: it is
 * followed (or listed) but no episode has aired yet, so there is nothing to
 * watch — only a premiere to wait for. Shows with unknown airing info are
 * left out, since we cannot claim they are unreleased.
 */
export function isUpcoming(hasAired: boolean | null | undefined): boolean {
	return hasAired === false;
}

/**
 * Formats a TMDB `first_air_date` (YYYY-MM-DD) as a short premiere label —
 * "5 nov 2026" in Italian, "Nov 5, 2026" in English — for shows whose
 * premiere is still ahead of us. Returns null for missing, unparsable or
 * already-past dates, so callers can skip the badge without extra checks.
 */
export function formatUpcomingPremiere(
	firstAirDate: string | null | undefined,
	locale: string
): string | null {
	if (!firstAirDate) return null;

	const premiere = Date.parse(firstAirDate);
	if (Number.isNaN(premiere) || premiere <= Date.now()) return null;

	return new Date(premiere).toLocaleDateString(locale, {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});
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
 * coming soon. Shows that have never aired belong to the "upcoming" view
 * instead — there is no previous season to have waited through.
 */
export function isWaitingForNewSeason(
	status: string | null | undefined,
	hasUpcomingEpisode: boolean | null | undefined,
	hasAired?: boolean | null
): boolean {
	return isReturningStatus(status) && !hasUpcomingEpisode && !isUpcoming(hasAired);
}

/**
 * Returns true when a show should appear in the "ongoing & renewed" view:
 * the show is returning AND TMDB has a `next_episode_to_air` scheduled,
 * meaning more content is concretely on the way (mid-season or imminent
 * release). Independent of whether the user is caught up. Shows whose very
 * first episode is the scheduled one are "upcoming", not ongoing.
 */
export function isOngoingRenewed(
	status: string | null | undefined,
	hasUpcomingEpisode: boolean | null | undefined,
	hasAired?: boolean | null
): boolean {
	return isReturningStatus(status) && !!hasUpcomingEpisode && !isUpcoming(hasAired);
}

export type SeriesFilterMode = 'watching' | 'all' | 'ended' | 'returning' | 'ongoing' | 'upcoming';
