import type { WatchProvider, WatchProviderData } from '@/lib/tmdb';

export type AvailabilityMediaType = 'movie' | 'tv';

export interface AvailabilityProvider {
	id: number;
	name: string;
	logoPath: string;
}

/**
 * Compact summary of where a title can be watched in the user's region,
 * small enough to be shipped to every card on a page.
 */
export interface MediaAvailability {
	/** Subscription, free or ad-supported streaming (flatrate / free / ads). */
	stream: AvailabilityProvider[];
	rent: AvailabilityProvider[];
	buy: AvailabilityProvider[];
}

export interface AvailabilityRequest {
	id: number;
	type: AvailabilityMediaType;
}

export function availabilityKey(type: AvailabilityMediaType, id: number | string): string {
	return `${type}:${id}`;
}

function toRefs(buckets: (WatchProvider[] | undefined)[], limit: number): AvailabilityProvider[] {
	const seen = new Map<number, AvailabilityProvider>();
	const all = buckets
		.flatMap((bucket) => bucket ?? [])
		.sort((a, b) => a.display_priority - b.display_priority);
	for (const p of all) {
		if (seen.size >= limit) break;
		if (!seen.has(p.provider_id)) {
			seen.set(p.provider_id, { id: p.provider_id, name: p.provider_name, logoPath: p.logo_path });
		}
	}
	return Array.from(seen.values());
}

/** Reduces the full TMDB/JustWatch payload to the few providers a card can display. */
export function summarizeAvailability(data: WatchProviderData | null): MediaAvailability | null {
	if (!data) return null;
	const summary: MediaAvailability = {
		stream: toRefs([data.flatrate, data.free, data.ads], 3),
		rent: toRefs([data.rent], 3),
		buy: toRefs([data.buy], 3),
	};
	if (!summary.stream.length && !summary.rent.length && !summary.buy.length) return null;
	return summary;
}
