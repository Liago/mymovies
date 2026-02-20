'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import {
	syncLocalTracker,
	getTrackerData,
	toggleWatchedEpisode,
	bulkMarkWatched,
	bulkMarkUnwatched,
	toggleTrackShow as apiToggleTrackShow
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
	trackShow: (tvId: number, showMeta: { name: string, poster: string | null }) => void;
	untrackShow: (tvId: number) => void;
	isTracked: (tvId: number) => boolean;
	refreshFromServer: () => Promise<void>;
}

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

const PENDING_SHOWS_KEY = 'cine_tracker_pending_shows';
const PENDING_EPISODES_KEY = 'cine_tracker_pending_episodes';

/**
 * Retry a server action up to maxRetries times with exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
	let lastError: Error | undefined;
	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err instanceof Error ? err : new Error(String(err));
			if (attempt < maxRetries) {
				await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
			}
		}
	}
	throw lastError;
}

export function TrackerProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [watchedEpisodes, setWatchedEpisodes] = useState<Set<EpisodeKey>>(new Set());
	const [watchedShows, setWatchedShows] = useState<Map<number, ShowMetadata>>(new Map());
	const [isInitialized, setIsInitialized] = useState(false);
	const initRef = useRef(0);

	// Fetch tracker data from server (reusable)
	const fetchFromServer = useCallback(async (userId: number) => {
		const { watchedEpisodes: dbEpisodes, watchedShows: dbShows } = await withRetry(
			() => getTrackerData(userId)
		);
		setWatchedEpisodes(new Set(dbEpisodes));
		setWatchedShows(new Map(dbShows.map(s => [s.id, s])));
	}, []);

	// Public method to force a refresh from the server
	const refreshFromServer = useCallback(async () => {
		if (user) {
			await fetchFromServer(user.id);
		}
	}, [user, fetchFromServer]);

	// Save pending tracked show to localStorage (fallback for logged-in users)
	const savePendingShow = useCallback((tvId: number, meta: ShowMetadata, action: 'track' | 'untrack') => {
		try {
			const stored = localStorage.getItem(PENDING_SHOWS_KEY);
			const pending: Array<{ show: ShowMetadata; action: string }> = stored ? JSON.parse(stored) : [];
			// Remove any existing entry for this show
			const filtered = pending.filter(p => p.show.id !== tvId);
			filtered.push({ show: meta, action });
			localStorage.setItem(PENDING_SHOWS_KEY, JSON.stringify(filtered));
		} catch (e) {
			console.error('Failed to save pending show', e);
		}
	}, []);

	const removePendingShow = useCallback((tvId: number) => {
		try {
			const stored = localStorage.getItem(PENDING_SHOWS_KEY);
			if (stored) {
				const pending = JSON.parse(stored);
				const filtered = pending.filter((p: any) => p.show.id !== tvId);
				if (filtered.length > 0) {
					localStorage.setItem(PENDING_SHOWS_KEY, JSON.stringify(filtered));
				} else {
					localStorage.removeItem(PENDING_SHOWS_KEY);
				}
			}
		} catch (e) {
			console.error('Failed to remove pending show', e);
		}
	}, []);

	// Flush any pending writes from localStorage to the server
	const flushPendingWrites = useCallback(async (userId: number) => {
		try {
			const storedShows = localStorage.getItem(PENDING_SHOWS_KEY);
			if (storedShows) {
				const pending: Array<{ show: ShowMetadata; action: string }> = JSON.parse(storedShows);
				for (const entry of pending) {
					try {
						if (entry.action === 'track') {
							await apiToggleTrackShow(userId, entry.show.id, true, {
								name: entry.show.name,
								poster: entry.show.poster
							});
						} else {
							await apiToggleTrackShow(userId, entry.show.id, false);
						}
					} catch (err) {
						console.error('Failed to flush pending show write:', err);
						// Keep it pending for next init
						return;
					}
				}
				localStorage.removeItem(PENDING_SHOWS_KEY);
			}
		} catch (e) {
			console.error('Failed to flush pending writes', e);
		}
	}, []);

	// Load from localStorage or DB on mount/auth change
	useEffect(() => {
		// Reset initialization state when user changes
		setIsInitialized(false);
		const currentInit = ++initRef.current;

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
				try {
					// Sync local guest data to DB if exists
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

					// Flush any pending writes from previous failed saves
					await flushPendingWrites(user.id);

					// Bail if a newer init has started (user changed again)
					if (currentInit !== initRef.current) return;

					// Fetch from DB
					await fetchFromServer(user.id);
				} catch (err) {
					console.error('Error initializing tracker from DB:', err);
					// Fall back to local data if available, otherwise empty
					if (localEpisodes.size > 0 || localShows.size > 0) {
						setWatchedEpisodes(localEpisodes);
						setWatchedShows(localShows);
					}
				}
			} else {
				// Guest mode
				setWatchedEpisodes(localEpisodes);
				setWatchedShows(localShows);
			}

			if (currentInit === initRef.current) {
				setIsInitialized(true);
			}
		};

		initTracker();
	}, [user, fetchFromServer, flushPendingWrites]);

	// Re-fetch from server when the page becomes visible again (handles cross-device sync)
	useEffect(() => {
		if (!user || !isInitialized) return;

		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible') {
				fetchFromServer(user.id).catch(console.error);
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
	}, [user, isInitialized, fetchFromServer]);

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
		const isPreviouslyWatched = watchedEpisodes.has(key);
		const isWatched = !isPreviouslyWatched;

		setWatchedEpisodes(prev => {
			const newSet = new Set(prev);
			if (newSet.has(key)) {
				newSet.delete(key);
			} else {
				newSet.add(key);
				updateShowMetadata(tvId, showMeta);
			}
			return newSet;
		});

		if (user) {
			withRetry(() => toggleWatchedEpisode(user.id, tvId, seasonNumber, episodeNumber, isWatched, showMeta))
				.catch(err => console.error('Failed to sync episode toggle after retries:', err));
		}
	}, [watchedEpisodes, user, updateShowMetadata]);

	const isWatched = useCallback((tvId: number, seasonNumber: number, episodeNumber: number) => {
		const key = `${tvId}:${seasonNumber}:${episodeNumber}`;
		return watchedEpisodes.has(key);
	}, [watchedEpisodes]);

	const isTracked = useCallback((tvId: number) => {
		return watchedShows.has(tvId);
	}, [watchedShows]);

	const trackShow = useCallback((tvId: number, showMeta: { name: string, poster: string | null }) => {
		const meta: ShowMetadata = {
			id: tvId,
			name: showMeta.name,
			poster: showMeta.poster,
			lastUpdated: Date.now()
		};

		// Optimistic update
		updateShowMetadata(tvId, showMeta);

		if (user) {
			// Save as pending in case the server write fails
			savePendingShow(tvId, meta, 'track');

			withRetry(() => apiToggleTrackShow(user.id, tvId, true, showMeta))
				.then(() => {
					// Server write succeeded, remove from pending
					removePendingShow(tvId);
				})
				.catch(err => {
					console.error('Failed to sync track show after retries:', err);
					// Pending write stays in localStorage for next init
				});
		}
	}, [updateShowMetadata, user, savePendingShow, removePendingShow]);

	const untrackShow = useCallback((tvId: number) => {
		// Capture the show metadata before removing (for pending writes if needed)
		const previousShow = watchedShows.get(tvId);

		setWatchedShows(prev => {
			const newMap = new Map(prev);
			newMap.delete(tvId);
			return newMap;
		});

		if (user) {
			if (previousShow) {
				savePendingShow(tvId, previousShow, 'untrack');
			}

			withRetry(() => apiToggleTrackShow(user.id, tvId, false))
				.then(() => {
					removePendingShow(tvId);
				})
				.catch(err => {
					console.error('Failed to sync untrack show after retries:', err);
				});
		}
	}, [user, watchedShows, savePendingShow, removePendingShow]);

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
			withRetry(() => bulkMarkWatched(
				user.id,
				episodes.map(e => ({ showId: tvId, season: seasonNumber, episode: e.episodeNumber })),
				showMeta ? { id: tvId, ...showMeta } : undefined
			)).catch(err => console.error('Failed to sync season watched after retries:', err));
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
			withRetry(() => bulkMarkUnwatched(
				user.id,
				episodes.map(e => ({ showId: tvId, season: seasonNumber, episode: e.episodeNumber }))
			)).catch(err => console.error('Failed to sync season unwatched after retries:', err));
		}
	}, [user]);

	return (
		<TrackerContext.Provider value={{
			watchedEpisodes,
			watchedShows,
			toggleWatched,
			isWatched,
			markSeasonWatched,
			markSeasonUnwatched,
			trackShow,
			untrackShow,
			isTracked,
			refreshFromServer
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
