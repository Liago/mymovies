'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { useAuth } from './AuthContext';

// Key format: "tvId:seasonNumber:episodeNumber"
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
	getWatchedCount: (tvId: number) => number;
	markSeasonWatched: (tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[], showMeta?: { name: string, poster: string | null }) => void;
	markSeasonUnwatched: (tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[]) => void;
	trackShow: (tvId: number, showMeta: { name: string, poster: string | null }) => void;
	untrackShow: (tvId: number) => void;
	isTracked: (tvId: number) => boolean;
	isLoading: boolean;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

const EMPTY_EPISODES = new Set<EpisodeKey>();

/** Come `fetch`, ma considera un errore anche le risposte HTTP non 2xx (es. 401, 500). */
async function send(url: string, init?: RequestInit) {
	const response = await fetch(url, init);
	if (!response.ok) throw new Error(`${init?.method ?? 'GET'} ${url} failed: ${response.status}`);
	return response;
}
const EMPTY_SHOWS = new Map<number, ShowMetadata>();

export function TrackerProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [watchedEpisodes, setWatchedEpisodes] = useState<Set<EpisodeKey>>(new Set());
	const [watchedShows, setWatchedShows] = useState<Map<number, ShowMetadata>>(new Map());
	const [isLoading, setIsLoading] = useState(true);

	// Load tracker data on mount or auth change
	useEffect(() => {
		const loadTracker = async () => {
			setIsLoading(true);

			if (user) {
				// Fetch from API (Supabase)
				try {
					const response = await fetch('/api/tracker');
					if (response.ok) {
						const data = await response.json();
						setWatchedShows(new Map(
							(data.watchedShows || []).map((s: ShowMetadata) => [s.id, s])
						));
						setWatchedEpisodes(new Set(data.watchedEpisodes || []));
					} else {
						console.error('Failed to fetch tracker data:', response.status, await response.text());
					}
				} catch (error) {
					console.error('Error loading tracker:', error);
				}
			} else {
				// Guest mode: load from localStorage
				const storedEpisodes = localStorage.getItem('cine_tracker_watched');
				const storedShows = localStorage.getItem('cine_tracker_shows');

				if (storedEpisodes) {
					try {
						const parsed = JSON.parse(storedEpisodes);
						if (Array.isArray(parsed)) setWatchedEpisodes(new Set(parsed));
					} catch (e) {
						console.error('Failed to parse watched episodes', e);
					}
				}

				if (storedShows) {
					try {
						const parsed = JSON.parse(storedShows);
						if (Array.isArray(parsed)) {
							setWatchedShows(new Map(parsed.map((item: any) => [item.id, item])));
						}
					} catch (e) {
						console.error('Failed to parse watched shows', e);
					}
				}
			}

			setIsLoading(false);
		};

		loadTracker();
	}, [user]);

	// Re-fetch from server when page becomes visible (cross-device sync)
	useEffect(() => {
		if (!user) return;

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				fetch('/api/tracker')
					.then(res => res.ok ? res.json() : null)
					.then(data => {
						if (data) {
							setWatchedShows(new Map(
								(data.watchedShows || []).map((s: ShowMetadata) => [s.id, s])
							));
							setWatchedEpisodes(new Set(data.watchedEpisodes || []));
						}
					})
					.catch(console.error);
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [user]);

	// Save to localStorage for guests
	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem('cine_tracker_watched', JSON.stringify(Array.from(watchedEpisodes)));
		}
	}, [watchedEpisodes, user, isLoading]);

	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem('cine_tracker_shows', JSON.stringify(Array.from(watchedShows.values())));
		}
	}, [watchedShows, user, isLoading]);

	const trackShow = useCallback(async (tvId: number, showMeta: { name: string, poster: string | null }) => {
		// Optimistic update
		setWatchedShows(prev => {
			const newMap = new Map(prev);
			newMap.set(tvId, {
				id: tvId,
				name: showMeta.name,
				poster: showMeta.poster,
				lastUpdated: Date.now()
			});
			return newMap;
		});

		if (user) {
			try {
				await send('/api/tracker', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ showId: tvId, name: showMeta.name, poster: showMeta.poster })
				});
			} catch (error) {
				console.error('Error tracking show:', error);
				// Revert on error
				setWatchedShows(prev => {
					const newMap = new Map(prev);
					newMap.delete(tvId);
					return newMap;
				});
			}
		}
	}, [user]);

	const untrackShow = useCallback(async (tvId: number) => {
		const previousShow = watchedShows.get(tvId);

		// Optimistic update
		setWatchedShows(prev => {
			const newMap = new Map(prev);
			newMap.delete(tvId);
			return newMap;
		});

		if (user) {
			try {
				await send(`/api/tracker?showId=${tvId}`, { method: 'DELETE' });
			} catch (error) {
				console.error('Error untracking show:', error);
				// Revert on error
				if (previousShow) {
					setWatchedShows(prev => {
						const newMap = new Map(prev);
						newMap.set(tvId, previousShow);
						return newMap;
					});
				}
			}
		}
	}, [user, watchedShows]);

	const toggleWatched = useCallback(async (tvId: number, seasonNumber: number, episodeNumber: number, showMeta?: { name: string, poster: string | null }) => {
		const key = `${tvId}:${seasonNumber}:${episodeNumber}`;
		const wasWatched = watchedEpisodes.has(key);
		const isWatchedNow = !wasWatched;

		// Optimistic update
		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			if (wasWatched) {
				newSet.delete(key);
			} else {
				newSet.add(key);
			}
			return newSet;
		});

		if (!wasWatched && showMeta) {
			setWatchedShows(prev => {
				const newMap = new Map(prev);
				newMap.set(tvId, {
					id: tvId,
					name: showMeta.name,
					poster: showMeta.poster,
					lastUpdated: Date.now()
				});
				return newMap;
			});
		}

		if (user) {
			try {
				await send('/api/tracker/episodes', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						showId: tvId,
						season: seasonNumber,
						episode: episodeNumber,
						isWatched: isWatchedNow,
						showMeta
					})
				});
			} catch (error) {
				console.error('Error toggling episode:', error);
				// Revert on error
				setWatchedEpisodes(prev => {
					const newSet = new Set(prev);
					if (wasWatched) {
						newSet.add(key);
					} else {
						newSet.delete(key);
					}
					return newSet;
				});
			}
		}
	}, [watchedEpisodes, user]);

	const isWatched = useCallback((tvId: number, seasonNumber: number, episodeNumber: number) => {
		return watchedEpisodes.has(`${tvId}:${seasonNumber}:${episodeNumber}`);
	}, [watchedEpisodes]);

	const getWatchedCount = useCallback((tvId: number) => {
		const prefix = `${tvId}:`;
		let count = 0;
		for (const key of watchedEpisodes) {
			if (key.startsWith(prefix)) count++;
		}
		return count;
	}, [watchedEpisodes]);

	const isTracked = useCallback((tvId: number) => {
		return watchedShows.has(tvId);
	}, [watchedShows]);

	const markSeasonWatched = useCallback(async (tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[], showMeta?: { name: string, poster: string | null }) => {
		// Solo gli episodi non ancora visti, per poterli annullare in caso di errore
		const added = episodes
			.map(ep => `${tvId}:${seasonNumber}:${ep.episodeNumber}`)
			.filter(key => !watchedEpisodes.has(key));

		// Optimistic update
		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			added.forEach(key => newSet.add(key));
			return newSet;
		});

		if (showMeta) {
			setWatchedShows(prev => {
				const newMap = new Map(prev);
				newMap.set(tvId, {
					id: tvId,
					name: showMeta.name,
					poster: showMeta.poster,
					lastUpdated: Date.now()
				});
				return newMap;
			});
		}

		if (user) {
			try {
				await send('/api/tracker/episodes', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						showId: tvId,
						season: seasonNumber,
						episodes: episodes.map(e => e.episodeNumber),
						showMeta
					})
				});
			} catch (error) {
				console.error('Error marking season as watched:', error);
				// Revert on error: gli episodi non sono stati salvati
				setWatchedEpisodes(prev => {
					const newSet = new Set(prev);
					added.forEach(key => newSet.delete(key));
					return newSet;
				});
			}
		}
	}, [user, watchedEpisodes]);

	const markSeasonUnwatched = useCallback(async (tvId: number, seasonNumber: number, episodes: { episodeNumber: number }[]) => {
		const removed = episodes
			.map(ep => `${tvId}:${seasonNumber}:${ep.episodeNumber}`)
			.filter(key => watchedEpisodes.has(key));

		// Optimistic update
		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			removed.forEach(key => newSet.delete(key));
			return newSet;
		});

		if (user) {
			try {
				const episodeNums = episodes.map(e => e.episodeNumber).join(',');
				await send(`/api/tracker/episodes?showId=${tvId}&season=${seasonNumber}&episodes=${episodeNums}`, {
					method: 'DELETE'
				});
			} catch (error) {
				console.error('Error unmarking season:', error);
				// Revert on error
				setWatchedEpisodes(prev => {
					const newSet = new Set(prev);
					removed.forEach(key => newSet.add(key));
					return newSet;
				});
			}
		}
	}, [user, watchedEpisodes]);

	return (
		<TrackerContext.Provider value={{
			watchedEpisodes,
			watchedShows,
			toggleWatched,
			isWatched,
			getWatchedCount,
			markSeasonWatched,
			markSeasonUnwatched,
			trackShow,
			untrackShow,
			isTracked,
			isLoading
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
	// Durante l'idratazione restituisce lo stato iniziale (come sul server):
	// i provider leggono localStorage/API prima che le pagine in Suspense si idratino.
	const hydrated = useMounted();
	return useMemo(
		() =>
			hydrated
				? context
				: {
					...context,
					watchedEpisodes: EMPTY_EPISODES,
					watchedShows: EMPTY_SHOWS,
					isWatched: () => false,
					getWatchedCount: () => 0,
					isTracked: () => false,
					isLoading: true,
				},
		[hydrated, context]
	);
}
