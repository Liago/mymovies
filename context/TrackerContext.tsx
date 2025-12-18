'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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
	const [watchedEpisodes, setWatchedEpisodes] = useState<Set<EpisodeKey>>(new Set());
	const [watchedShows, setWatchedShows] = useState<Map<number, ShowMetadata>>(new Map());
	const [isInitialized, setIsInitialized] = useState(false);

	// Load from localStorage on mount
	useEffect(() => {
		const storedEpisodes = localStorage.getItem('cine_tracker_watched');
		const storedShows = localStorage.getItem('cine_tracker_shows');

		if (storedEpisodes) {
			try {
				const parsed = JSON.parse(storedEpisodes);
				if (Array.isArray(parsed)) {
					setWatchedEpisodes(new Set(parsed));
				}
			} catch (e) {
				console.error('Failed to parse watched episodes', e);
			}
		}

		if (storedShows) {
			try {
				const parsed = JSON.parse(storedShows);
				if (Array.isArray(parsed)) {
					// Convert array of entries back to Map
					setWatchedShows(new Map(parsed.map((item: any) => [item.id, item])));
				}
			} catch (e) {
				console.error('Failed to parse watched shows', e);
			}
		}

		setIsInitialized(true);
	}, []);

	// Save to localStorage whenever state changes
	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem('cine_tracker_watched', JSON.stringify(Array.from(watchedEpisodes)));
		}
	}, [watchedEpisodes, isInitialized]);

	useEffect(() => {
		if (isInitialized) {
			localStorage.setItem('cine_tracker_shows', JSON.stringify(Array.from(watchedShows.values())));
		}
	}, [watchedShows, isInitialized]);

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
	}, [updateShowMetadata]);

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
	}, [updateShowMetadata]);

	const markSeasonUnwatched = useCallback((tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[]) => {
		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			episodes.forEach(ep => {
				newSet.delete(`${tvId}:${seasonNumber}:${ep.episodeNumber}`);
			});
			return newSet;
		});
	}, []);

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
