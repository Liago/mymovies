'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import {
	syncLocalTracker,
	getTrackerData,
	toggleWatchedEpisode,
	bulkMarkWatched,
	bulkMarkUnwatched
} from '@/app/actions/user-data';

// Key format: "tvId:seasonNumber:episodeNumber"
// Example: "1399:1:1"
type EpisodeKey = string;

interface ShowMetadata {
	id: number;
	name: string;
	poster: string | null;
	lastUpdated: number;
}

interface TrackerContextType {
	watchedEpisodes: Set<EpisodeKey>;
	watchedShows: Map<number, ShowMetadata>;
	toggleWatched: (tvId: number, seasonNumber: number, episodeNumber: number, showMeta?: { name: string, poster: string | null }) => void;
	isWatched: (tvId: number, seasonNumber: number, episodeNumber: number) => boolean;
	markSeasonWatched: (tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[], showMeta?: { name: string, poster: string | null }) => void;
	markSeasonUnwatched: (tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[]) => void;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [watchedEpisodes, setWatchedEpisodes] = useState<Set<EpisodeKey>>(new Set());
	const [watchedShows, setWatchedShows] = useState<Map<number, ShowMetadata>>(new Map());
	const [isInitialized, setIsInitialized] = useState(false);

	// Load from localStorage or DB on mount/auth change
	useEffect(() => {
		const initTracker = async () => {
			// Always check local storage first for any pending data or guest data
			const storedEpisodes = localStorage.getItem('cine_tracker_watched');
			const storedShows = localStorage.getItem('cine_tracker_shows');

			let localEpisodes = new Set<string>();
			let localShows = new Map<number, ShowMetadata>();

			if (storedEpisodes) {
				try {
					const parsed = JSON.parse(storedEpisodes);
					if (Array.isArray(parsed)) localEpisodes = new Set(parsed);
				} catch (e) {
					console.error('Failed to parse watched episodes', e);
				}
			}

			if (storedShows) {
				try {
					const parsed = JSON.parse(storedShows);
					if (Array.isArray(parsed)) {
						localShows = new Map(parsed.map((item: any) => [item.id, item]));
					}
				} catch (e) {
					console.error('Failed to parse watched shows', e);
				}
			}

			if (user) {
				// Sync local to DB if exists
				if (localEpisodes.size > 0 || localShows.size > 0) {
					await syncLocalTracker(
						user.id,
						Array.from(localEpisodes),
						Array.from(localShows.values())
					);
					// Clear local after sync
					localStorage.removeItem('cine_tracker_watched');
					localStorage.removeItem('cine_tracker_shows');
				}

				// Fetch from DB
				const { watchedEpisodes: dbEpisodes, watchedShows: dbShows } = await getTrackerData(user.id);

				setWatchedEpisodes(new Set(dbEpisodes));
				setWatchedShows(new Map(dbShows.map(s => [s.id, s])));
			} else {
				// Guest mode
				setWatchedEpisodes(localEpisodes);
				setWatchedShows(localShows);
			}

			setIsInitialized(true);
		};

		initTracker();
	}, [user]);

	// Save to localStorage whenever state changes
	// Save to localStorage whenever state changes (ONLY IF GUEST)
	useEffect(() => {
		if (isInitialized && !user) {
			localStorage.setItem('cine_tracker_watched', JSON.stringify(Array.from(watchedEpisodes)));
		}
	}, [watchedEpisodes, isInitialized, user]);

	useEffect(() => {
		if (isInitialized && !user) {
			localStorage.setItem('cine_tracker_shows', JSON.stringify(Array.from(watchedShows.values())));
		}
	}, [watchedShows, isInitialized, user]);

	const updateShowMetadata = useCallback((tvId: number, meta?: { name: string, poster: string | null }) => {
		if (meta) {
			setWatchedShows(prev => {
				const newMap = new Map(prev);
				newMap.set(tvId, {
					id: tvId,
					name: meta.name,
					poster: meta.poster,
					lastUpdated: Date.now()
				});
				return newMap;
			});
		}
	}, []);

	const toggleWatched = useCallback((tvId: number, seasonNumber: number, episodeNumber: number, showMeta?: { name: string, poster: string | null }) => {
		const key = `${tvId}:${seasonNumber}:${episodeNumber}`;
		// Determine intended state based on current state
		const isPreviouslyWatched = watchedEpisodes.has(key);
		const isWatched = !isPreviouslyWatched;

		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			if (newSet.has(key)) {
				newSet.delete(key);
			} else {
				newSet.add(key);
				// Update show metadata when marking as watched
				updateShowMetadata(tvId, showMeta);
			}
			return newSet;
		});

		if (user) {
			toggleWatchedEpisode(user.id, tvId, seasonNumber, episodeNumber, isWatched, showMeta).catch(console.error);
		}
	}, [watchedEpisodes, user, updateShowMetadata]);

	const isWatched = useCallback((tvId: number, seasonNumber: number, episodeNumber: number) => {
		const key = `${tvId}:${seasonNumber}:${episodeNumber}`;
		return watchedEpisodes.has(key);
	}, [watchedEpisodes]);

	const markSeasonWatched = useCallback((tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[], showMeta?: { name: string, poster: string | null }) => {
		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			episodes.forEach(ep => {
				newSet.add(`${tvId}:${seasonNumber}:${ep.episodeNumber}`);
			});
			return newSet;
		});
		updateShowMetadata(tvId, showMeta);

		if (user) {
			bulkMarkWatched(
				user.id,
				episodes.map(e => ({ showId: tvId, season: seasonNumber, episode: e.episodeNumber })),
				showMeta ? { id: tvId, ...showMeta } : undefined
			).catch(console.error);
		}
	}, [user, updateShowMetadata]);

	const markSeasonUnwatched = useCallback((tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[]) => {
		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			episodes.forEach(ep => {
				newSet.delete(`${tvId}:${seasonNumber}:${ep.episodeNumber}`);
			});
			return newSet;
		});

		if (user) {
			bulkMarkUnwatched(
				user.id,
				episodes.map(e => ({ showId: tvId, season: seasonNumber, episode: e.episodeNumber }))
			).catch(console.error);
		}
	}, [user]);

	return (
		<TrackerContext.Provider value={{
			watchedEpisodes,
			watchedShows,
			toggleWatched,
			isWatched,
			markSeasonWatched,
			markSeasonUnwatched
		}}>
			{children}
		</TrackerContext.Provider>
	);
}

export function useTracker() {
	const context = useContext(TrackerContext);
	if (context === undefined) {
		throw new Error('useTracker must be used within a TrackerProvider');
	}
	return context;
}
