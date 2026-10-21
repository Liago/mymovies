'use server';

import { fetchLatestEpisode, fetchSnapshot } from '@/lib/watchlist-alerts-server';
import { availabilityKey } from '@/lib/availability';
import type { AiredEpisode, AlertSubject, SnapshotResult } from '@/lib/watchlist-alerts';

const SNAPSHOT_BATCH_LIMIT = 40;

/** Fotografie complete dei provider, per gli avvisi della watchlist salvata sul dispositivo (ospiti). */
export async function fetchAvailabilitySnapshots(subjects: AlertSubject[]): Promise<Record<string, SnapshotResult>> {
	if (!Array.isArray(subjects)) return {};

	const unique = new Map<string, AlertSubject>();
	for (const subject of subjects) {
		if (unique.size >= SNAPSHOT_BATCH_LIMIT) break;
		const id = Number(subject?.id);
		if (!Number.isInteger(id) || id <= 0) continue;
		if (subject.type !== 'movie' && subject.type !== 'tv') continue;
		unique.set(availabilityKey(subject.type, id), { id, type: subject.type });
	}

	const entries = await Promise.all(
		Array.from(unique.entries()).map(async ([key, subject]) => [key, await fetchSnapshot(subject.id, subject.type)] as const)
	);

	return Object.fromEntries(entries);
}

export interface LatestEpisodeResult {
	episode: AiredEpisode | null;
	provider: string | null;
}

/** Ultimo episodio andato in onda delle serie seguite, per gli avvisi degli ospiti. */
export async function fetchLatestEpisodes(showIds: number[]): Promise<Record<number, LatestEpisodeResult>> {
	if (!Array.isArray(showIds)) return {};

	const ids = [...new Set(showIds.map(Number).filter((id) => Number.isInteger(id) && id > 0))].slice(0, SNAPSHOT_BATCH_LIMIT);
	const entries = await Promise.all(
		ids.map(async (id) => {
			const latest = await fetchLatestEpisode(id);
			return latest ? ([id, { episode: latest.episode, provider: latest.provider }] as const) : null;
		})
	);

	return Object.fromEntries(entries.filter((e) => e !== null));
}
