'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { syncUserProfile } from '@/app/actions/user-data';

interface TMDBUserData {
	id: number;
	username: string;
	name: string;
	avatar: {
		gravatar: { hash: string };
		tmdb: { avatar_path: string | null };
	};
}

interface AuthContextType {
	isLoggedIn: boolean;
	user: TMDBUserData | null;
	avatarUrl: string | null;
	isLoading: boolean;
	hasMounted: boolean;
	login: () => Promise<void>;
	logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCookie(name: string): string | null {
	if (typeof document === 'undefined') return null;

	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) {
		const cookieValue = parts.pop()?.split(';').shift();
		return cookieValue ? decodeURIComponent(cookieValue) : null;
	}
	return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<TMDBUserData | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasMounted, setHasMounted] = useState(false);

	// Check for existing session on mount - only run on client
	useEffect(() => {
		setHasMounted(true);

		const checkAuth = () => {
			try {
				const userCookie = getCookie('tmdb_user');
				if (userCookie) {
					const userData = JSON.parse(userCookie);
					setUser(userData);
				}
			} catch (error) {
				console.error('Error parsing user cookie:', error);
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, []);

	// Comprehensive sync when user logs in
	useEffect(() => {
		if (user) {
			const performSync = async () => {
				try {
					const sessionId = getCookie('tmdb_session');
					if (!sessionId) return;

					// 1. Sync profile
					await syncUserProfile({
						id: user.id,
						username: user.username,
						name: user.name,
						avatar_url: user.avatar.tmdb.avatar_path
							? `https://image.tmdb.org/t/p/w200${user.avatar.tmdb.avatar_path}`
							: user.avatar.gravatar.hash
								? `https://www.gravatar.com/avatar/${user.avatar.gravatar.hash}`
								: null
					});

					// 2. Import all sync functions
					const {
						syncFavoritesFromTMDB,
						syncWatchlistFromTMDB,
						syncRatingsFromTMDB,
						syncLocalFavorites,
						syncLocalWatchlist,
						syncLocalRatings,
						syncLocalTracker,
						pushLocalToTMDB
					} = await import('@/app/actions/user-data');

					// 3. Fetch FROM TMDB and save to Supabase (TMDB is source of truth)
					await Promise.all([
						syncFavoritesFromTMDB(user.id, sessionId),
						syncWatchlistFromTMDB(user.id, sessionId),
						syncRatingsFromTMDB(user.id, sessionId)
					]);

					// 4. Merge local guest data to Supabase
					const localFavorites = localStorage.getItem('cine_favorites');
					const localWatchlist = localStorage.getItem('cine_watchlist');
					const localTrackerEpisodes = localStorage.getItem('cine_tracker_watched');
					const localTrackerShows = localStorage.getItem('cine_tracker_shows');
					const localRatings = localStorage.getItem('cine_ratings');

					if (localFavorites) {
						const parsed = JSON.parse(localFavorites);
						await syncLocalFavorites(user.id, parsed);
					}

					if (localWatchlist) {
						const parsed = JSON.parse(localWatchlist);
						await syncLocalWatchlist(user.id, parsed);
					}

					if (localRatings) {
						const parsed = JSON.parse(localRatings);
						await syncLocalRatings(user.id, parsed);
					}

					// Sync tracker data
					if (localTrackerEpisodes || localTrackerShows) {
						const episodes: string[] = [];
						const shows: any[] = [];
						
						if (localTrackerEpisodes) {
							try {
								const parsed = JSON.parse(localTrackerEpisodes);
								if (Array.isArray(parsed)) episodes.push(...parsed);
							} catch (e) {
								console.error('Failed to parse tracker episodes', e);
							}
						}
						
						if (localTrackerShows) {
							try {
								const parsed = JSON.parse(localTrackerShows);
								if (Array.isArray(parsed)) shows.push(...parsed);
							} catch (e) {
								console.error('Failed to parse tracker shows', e);
							}
						}
						
						if (episodes.length > 0 || shows.length > 0) {
							await syncLocalTracker(user.id, episodes, shows);
						}
					}

					// 5. Push local+new items TO TMDB (bidirectional sync)
					await pushLocalToTMDB(user.id, sessionId);

					// 6. Clear guest localStorage
					localStorage.removeItem('cine_favorites');
					localStorage.removeItem('cine_watchlist');
					localStorage.removeItem('cine_ratings');
					localStorage.removeItem('cine_tracker_watched');
					localStorage.removeItem('cine_tracker_shows');

				} catch (err) {
					console.error('Sync error:', err);
				}
			};

			performSync();
		}
	}, [user]);

	const login = useCallback(async () => {
		try {
			setIsLoading(true);

			// Call our API to get the authorization URL
			const response = await fetch('/api/auth/tmdb');
			const data = await response.json();

			if (data.authUrl) {
				// Redirect to TMDB for authorization
				window.location.href = data.authUrl;
			} else {
				console.error('Failed to get auth URL:', data.error);
				setIsLoading(false);
			}
		} catch (error) {
			console.error('Login error:', error);
			setIsLoading(false);
		}
	}, []);

	const logout = useCallback(async () => {
		try {
			setIsLoading(true);

			await fetch('/api/auth/tmdb/logout', { method: 'POST' });

			setUser(null);
		} catch (error) {
			console.error('Logout error:', error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const avatarUrl = user ? (() => {
		if (user.avatar.tmdb.avatar_path) {
			return `https://image.tmdb.org/t/p/w200${user.avatar.tmdb.avatar_path}`;
		}
		if (user.avatar.gravatar.hash) {
			return `https://www.gravatar.com/avatar/${user.avatar.gravatar.hash}`;
		}
		return null;
	})() : null;

	return (
		<AuthContext.Provider
			value={{
				isLoggedIn: !!user,
				user,
				avatarUrl,
				isLoading,
				hasMounted,
				login,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}

