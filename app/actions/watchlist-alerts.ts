'use server';

import { fetchSnapshot } from '@/lib/watchlist-alerts-server';
import { availabilityKey } from '@/lib/availability';
import type { AlertSubject, SnapshotResult } from '@/lib/watchlist-alerts';

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
