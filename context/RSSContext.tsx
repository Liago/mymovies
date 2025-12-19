'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { POPULAR_CINEMA_FEEDS } from '@/lib/rss-feeds';

export interface RSSFeed {
	id: string; // UUID or generated
	name: string;
	url: string;
	description?: string;
	category?: string;
	added_at?: string;
}

interface RSSContextType {
	feeds: RSSFeed[];
	addFeed: (feed: Omit<RSSFeed, 'id' | 'added_at'>) => Promise<void>;
	removeFeed: (id: string) => Promise<void>;
	isLoading: boolean;
	isSubscribed: (url: string) => boolean;
}

const RSSContext = createContext<RSSContextType | undefined>(undefined);

export function RSSProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [feeds, setFeeds] = useState<RSSFeed[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load feeds
	useEffect(() => {
		const loadFeeds = async () => {
			console.log('[RSSContext] Loading feeds, user:', user?.id);
			setIsLoading(true);

			if (user) {
				try {
					console.log('[RSSContext] Fetching from API...');
					const response = await fetch('/api/rss-feeds');
					console.log('[RSSContext] API response status:', response.status);
					if (response.ok) {
						const data = await response.json();
						console.log('[RSSContext] Loaded feeds:', data.length);
						setFeeds(data);
					} else {
						const errorText = await response.text();
						console.error('[RSSContext] API error:', response.status, errorText);
					}
				} catch (error) {
					console.error('[RSSContext] Fetch error:', error);
				}
			} else {
				console.log('[RSSContext] Guest mode - loading from localStorage');
				const stored = localStorage.getItem('cinescope_rss_feeds');
				if (stored) {
					try {
						// Map old localStorage format to new interface if needed
						// old has addedAt, new has added_at. Let's start clean or handle both.
						const parsed = JSON.parse(stored);
						setFeeds(parsed.map((f: any) => ({
							...f,
							added_at: f.addedAt || f.added_at
						})));
					} catch (e) {
						console.error('Error parsing RSS feeds:', e);
					}
				} else {
					// Initialize with defaults if empty for guests? 
					// No, usually start empty or maybe popular ones
				}
			}

			setIsLoading(false);
		};

		loadFeeds();
	}, [user]);

	// Sync local
	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem('cinescope_rss_feeds', JSON.stringify(feeds));
		}
	}, [feeds, user, isLoading]);

	const addFeed = useCallback(async (feed: Omit<RSSFeed, 'id' | 'added_at'>) => {
		const newFeed = {
			...feed,
			id: crypto.randomUUID(),
			added_at: new Date().toISOString()
		};

		setFeeds(prev => [...prev, newFeed]);

		if (user) {
			try {
				await fetch('/api/rss-feeds', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(newFeed)
				});
			} catch (error) {
				console.error('Error adding RSS feed:', error);
				setFeeds(prev => prev.filter(f => f.url !== feed.url));
			}
		}
	}, [user]);

	const removeFeed = useCallback(async (id: string) => {
		setFeeds(prev => prev.filter(f => f.id !== id));

		if (user) {
			try {
				await fetch(`/api/rss-feeds?id=${id}`, {
					method: 'DELETE'
				});
			} catch (error) {
				console.error('Error removing RSS feed:', error);
			}
		}
	}, [user]);

	const isSubscribed = useCallback((url: string) => {
		return feeds.some(f => f.url === url);
	}, [feeds]);

	return (
		<RSSContext.Provider value={{ feeds, addFeed, removeFeed, isLoading, isSubscribed }}>
			{children}
		</RSSContext.Provider>
	);
}

export function useRSS() {
	const context = useContext(RSSContext);
	if (!context) {
		throw new Error('useRSS must be used within RSSProvider');
	}
	return context;
}
