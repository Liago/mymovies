'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface RatingItem {
	id: number;
	media_type: 'movie' | 'tv';
	title: string;
	poster: string | null;
	rating: number;
}

interface RatingsContextType {
	ratings: RatingItem[];
	rateMedia: (id: number, media_type: 'movie' | 'tv', rating: number, title: string, poster: string | null) => Promise<void>;
	deleteRating: (id: number, media_type: 'movie' | 'tv') => Promise<void>;
	getRating: (id: number, media_type: 'movie' | 'tv') => number | null;
	isLoading: boolean;
}

const RatingsContext = createContext<RatingsContextType | undefined>(undefined);

export function RatingsProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [ratings, setRatings] = useState<RatingItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadRatings = async () => {
			setIsLoading(true);

			if (user) {
				try {
					const response = await fetch('/api/ratings');
					if (response.ok) {
						const data = await response.json();
						setRatings(data);
					}
				} catch (error) {
					console.error('Error loading ratings:', error);
				}
			} else {
				const stored = localStorage.getItem('cine_ratings');
				if (stored) {
					try {
						setRatings(JSON.parse(stored));
					} catch (e) {
						console.error('Error parsing ratings:', e);
					}
				}
			}

			setIsLoading(false);
		};

		loadRatings();
	}, [user]);

	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem('cine_ratings', JSON.stringify(ratings));
		}
	}, [ratings, user, isLoading]);

	const rateMedia = useCallback(async (id: number, media_type: 'movie' | 'tv', rating: number, title: string, poster: string | null) => {
		const newRating: RatingItem = { id, media_type, rating, title, poster };

		setRatings(prev => {
			const filtered = prev.filter(r => !(r.id === id && r.media_type === media_type));
			return [...filtered, newRating];
		});

		if (user) {
			try {
				await fetch('/api/ratings', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newRating)
				});
			} catch (error) {
				console.error('Error rating media:', error);
			}
		}
	}, [user]);

	const deleteRating = useCallback(async (id: number, media_type: 'movie' | 'tv') => {
		setRatings(prev => prev.filter(r => !(r.id === id && r.media_type === media_type)));

		if (user) {
			try {
				await fetch(`/api/ratings?id=${id}&type=${media_type}`, {
					method: 'DELETE'
				});
			} catch (error) {
				console.error('Error deleting rating:', error);
			}
		}
	}, [user]);

	const getRating = useCallback((id: number, media_type: 'movie' | 'tv') => {
		const item = ratings.find(r => r.id === id && r.media_type === media_type);
		return item?.rating ?? null;
	}, [ratings]);

	return (
		<RatingsContext.Provider value={{ ratings, rateMedia, deleteRating, getRating, isLoading }}>
			{children}
		</RatingsContext.Provider>
	);
}

export function useRatings() {
	const context = useContext(RatingsContext);
	if (!context) {
		throw new Error('useRatings must be used within RatingsProvider');
	}
	return context;
}
