'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { fetchEpisodeInfo, fetchShowsProgress } from '@/app/actions';
import { useTracker } from '@/context/TrackerContext';
import { computeProgress, type ShowProgressInfo } from '@/lib/progress';
import type { EpisodeInfo } from '@/lib/tmdb-shows';

// Cache di modulo condivisa da Home, Serie e Tracker: ogni serie viene
// interrogata una sola volta per sessione.
const showCache = new Map<number, ShowProgressInfo | null>();
const showInFlight = new Set<number>();
const episodeCache = new Map<string, EpisodeInfo | null>();
const episodeInFlight = new Set<string>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
	version++;
	listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

const getVersion = () => version;

async function loadShows(ids: number[]) {
	const missing = ids.filter((id) => !showCache.has(id) && !showInFlight.has(id));
	if (!missing.length) return;
	missing.forEach((id) => showInFlight.add(id));
	try {
		const results = await fetchShowsProgress(missing);
		const byId = new Map(results.map((r) => [r.id, r]));
		missing.forEach((id) => showCache.set(id, byId.get(id) ?? null));
	} catch (e) {
		console.error('Error loading show progress:', e);
	} finally {
		missing.forEach((id) => showInFlight.delete(id));
		emit();
	}
}

/** Dati TMDB (stagioni uscite, durata, servizio) delle serie indicate. */
export function useShowsProgress(ids: number[]) {
	const v = useSyncExternalStore(subscribe, getVersion, getVersion);
	const key = ids.join(',');

	useEffect(() => {
		if (key) loadShows(key.split(',').map(Number));
	}, [key]);

	return useMemo(() => {
		const infos = new Map<number, ShowProgressInfo>();
		let loading = false;
		for (const id of ids) {
			const info = showCache.get(id);
			if (info) infos.set(id, info);
			else if (!showCache.has(id)) loading = true;
		}
		return { infos, loading };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, v]);
}

/** Titolo e immagine di un episodio (caricati su richiesta e messi in cache). */
export function useEpisodeInfo(showId: number, season?: number | null, episode?: number | null): EpisodeInfo | null {
	const v = useSyncExternalStore(subscribe, getVersion, getVersion);
	const key = season && episode ? `${showId}:${season}:${episode}` : '';

	useEffect(() => {
		if (!key || episodeCache.has(key) || episodeInFlight.has(key)) return;
		episodeInFlight.add(key);
		fetchEpisodeInfo(showId, season as number, episode as number)
			.then((info) => episodeCache.set(key, info))
			.catch(() => episodeCache.set(key, null))
			.finally(() => {
				episodeInFlight.delete(key);
				emit();
			});
	}, [key, showId, season, episode]);

	return useMemo(
		() => (key ? episodeCache.get(key) ?? null : null),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[key, v]
	);
}

/** Serie seguite (dal tracker) con dati TMDB e progressi calcolati. */
export function useTrackedProgress() {
	const { watchedShows, watchedEpisodes, isLoading } = useTracker();

	const shows = useMemo(
		() => Array.from(watchedShows.values()).sort((a, b) => b.lastUpdated - a.lastUpdated),
		[watchedShows]
	);
	const ids = useMemo(() => shows.map((s) => s.id), [shows]);
	const { infos, loading } = useShowsProgress(ids);

	const items = useMemo(
		() =>
			shows.map((show) => {
				const info = infos.get(show.id) ?? null;
				const progress = info
					? computeProgress(info.seasons, (s, e) => watchedEpisodes.has(`${show.id}:${s}:${e}`))
					: null;
				return { show, info, progress };
			}),
		[shows, infos, watchedEpisodes]
	);

	return { items, loading: isLoading || loading, isEmpty: !isLoading && shows.length === 0 };
}

export type TrackedItem = ReturnType<typeof useTrackedProgress>['items'][number];
