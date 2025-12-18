'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface WatchlistItem {
	id: number;
	media_type: 'movie' | 'tv';
	title: string;
	poster: string | null;
}

interface WatchlistContextType {
	watchlist: WatchlistItem[];
	addToWatchlist: (item: WatchlistItem) => Promise<void>;
	removeFromWatchlist: (id: number, media_type: 'movie' | 'tv') => Promise<void>;
	isInWatchlist: (id: number, media_type: 'movie' | 'tv') => boolean;
	isLoading: boolean;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(undefined);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadWatchlist = async () => {
			setIsLoading(true);

			if (user) {
				try {
					const response = await fetch('/api/watchlist');
					if (response.ok) {
						const data = await response.json();
						setWatchlist(data);
					}
				} catch (error) {
					console.error('Error loading watchlist:', error);
				}
			} else {
				const stored = localStorage.getItem('cine_watchlist');
				if (stored) {
					try {
						setWatchlist(JSON.parse(stored));
					} catch (e) {
						console.error('Error parsing watchlist:', e);
					}
				}
			}

			setIsLoading(false);
		};

		loadWatchlist();
	}, [user]);

	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem('cine_watchlist', JSON.stringify(watchlist));
		}
	}, [watchlist, user, isLoading]);

	const addToWatchlist = useCallback(async (item: WatchlistItem) => {
		setWatchlist(prev => [...prev, item]);

		if (user) {
			try {
				await fetch('/api/watchlist', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(item)
				});
			} catch (error) {
				console.error('Error adding to watchlist:', error);
				setWatchlist(prev => prev.filter(w => !(w.id === item.id && w.media_type === item.media_type)));
			}
		}
	}, [user]);

	const removeFromWatchlist = useCallback(async (id: number, media_type: 'movie' | 'tv') => {
		setWatchlist(prev => prev.filter(w => !(w.id === id && w.media_type === media_type)));

		if (user) {
			try {
				await fetch(`/api/watchlist?id=${id}&type=${media_type}`, {
					method: 'DELETE'
				});
			} catch (error) {
				console.error('Error removing from watchlist:', error);
			}
		}
	}, [user]);

	const isInWatchlist = useCallback((id: number, media_type: 'movie' | 'tv') => {
		return watchlist.some(w => w.id === id && w.media_type === media_type);
	}, [watchlist]);

	return (
		<WatchlistContext.Provider value={{ watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist, isLoading }}>
			{children}
		</WatchlistContext.Provider>
	);
}

export function useWatchlist() {
	const context = useContext(WatchlistContext);
	if (!context) {
		throw new Error('useWatchlist must be used within WatchlistProvider');
	}
	return context;
}
