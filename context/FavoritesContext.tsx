'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface FavoriteItem {
	id: number;
	media_type: 'movie' | 'tv';
	title: string;
	poster: string | null;
}

interface FavoritesContextType {
	favorites: FavoriteItem[];
	addFavorite: (item: FavoriteItem) => Promise<void>;
	removeFavorite: (id: number, media_type: 'movie' | 'tv') => Promise<void>;
	isFavorite: (id: number, media_type: 'movie' | 'tv') => boolean;
	isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load favorites on mount or auth change
	useEffect(() => {
		const loadFavorites = async () => {
			setIsLoading(true);

			if (user) {
				// Fetch from Supabase
				try {
					const response = await fetch('/api/favorites');
					if (response.ok) {
						const data = await response.json();
						setFavorites(data);
					}
				} catch (error) {
					console.error('Error loading favorites:', error);
				}
			} else {
				// Load from localStorage for guests
				const stored = localStorage.getItem('cine_favorites');
				if (stored) {
					try {
						setFavorites(JSON.parse(stored));
					} catch (e) {
						console.error('Error parsing favorites:', e);
					}
				}
			}

			setIsLoading(false);
		};

		loadFavorites();
	}, [user]);

	// Save to localStorage for guests
	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem('cine_favorites', JSON.stringify(favorites));
		}
	}, [favorites, user, isLoading]);

	const addFavorite = useCallback(async (item: FavoriteItem) => {
		// Optimistic update
		setFavorites(prev => [...prev, item]);

		if (user) {
			// Save to DB via API
			try {
				await fetch('/api/favorites', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(item)
				});
			} catch (error) {
				console.error('Error adding favorite:', error);
				// Revert on error
				setFavorites(prev => prev.filter(f => !(f.id === item.id && f.media_type === item.media_type)));
			}
		}
	}, [user]);

	const removeFavorite = useCallback(async (id: number, media_type: 'movie' | 'tv') => {
		// Optimistic update
		setFavorites(prev => prev.filter(f => !(f.id === id && f.media_type === media_type)));

		if (user) {
			try {
				await fetch(`/api/favorites?id=${id}&type=${media_type}`, {
					method: 'DELETE'
				});
			} catch (error) {
				console.error('Error removing favorite:', error);
			}
		}
	}, [user]);

	const isFavorite = useCallback((id: number, media_type: 'movie' | 'tv') => {
		return favorites.some(f => f.id === id && f.media_type === media_type);
	}, [favorites]);

	return (
		<FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, isLoading }}>
			{children}
		</FavoritesContext.Provider>
	);
}

export function useFavorites() {
	const context = useContext(FavoritesContext);
	if (!context) {
		throw new Error('useFavorites must be used within FavoritesProvider');
	}
	return context;
}
