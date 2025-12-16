/**
 * RSS Feed Management Utility
 * Uses localStorage to store user's RSS feed subscriptions
 */

export interface RSSFeed {
	id: string;
	name: string;
	url: string;
	description?: string;
	addedAt: string;
	category?: string;
}

const RSS_FEEDS_KEY = 'cinescope_rss_feeds';

// Predefined cinema news feeds
export const POPULAR_CINEMA_FEEDS = [
	{
		name: 'Variety - Film News',
		url: 'https://variety.com/v/film/feed/',
		description: 'Latest film news from Variety',
		category: 'News'
	},
	{
		name: 'The Hollywood Reporter',
		url: 'https://www.hollywoodreporter.com/feed/',
		description: 'Entertainment industry news',
		category: 'News'
	},
	{
		name: 'IndieWire',
		url: 'https://www.indiewire.com/feed/',
		description: 'Independent film news',
		category: 'News'
	},
	{
		name: 'Screen Rant',
		url: 'https://screenrant.com/feed/',
		description: 'Movie and TV news',
		category: 'News'
	},
	{
		name: 'Collider',
		url: 'https://collider.com/feed/',
		description: 'Entertainment news and reviews',
		category: 'News'
	},
	{
		name: 'FilmWeb (IT)',
		url: 'https://www.filmweb.it/feed/',
		description: 'Notizie cinema italiane',
		category: 'Italian News'
	},
	{
		name: 'Cinematographe (IT)',
		url: 'https://www.cinematographe.it/feed/',
		description: 'News e recensioni cinema',
		category: 'Italian News'
	}
];

/**
 * Get all RSS feeds from localStorage
 */
export function getRSSFeeds(): RSSFeed[] {
	if (typeof window === 'undefined') return [];

	try {
		const feeds = localStorage.getItem(RSS_FEEDS_KEY);
		return feeds ? JSON.parse(feeds) : [];
	} catch (error) {
		console.error('Error reading RSS feeds from localStorage:', error);
		return [];
	}
}

/**
 * Add a new RSS feed
 */
export function addRSSFeed(feed: Omit<RSSFeed, 'id' | 'addedAt'>): RSSFeed {
	const feeds = getRSSFeeds();

	// Check if feed already exists
	const existingFeed = feeds.find(f => f.url === feed.url);
	if (existingFeed) {
		throw new Error('This RSS feed already exists');
	}

	const newFeed: RSSFeed = {
		...feed,
		id: crypto.randomUUID(),
		addedAt: new Date().toISOString()
	};

	const updatedFeeds = [...feeds, newFeed];
	localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(updatedFeeds));

	return newFeed;
}

/**
 * Remove an RSS feed by ID
 */
export function removeRSSFeed(id: string): void {
	const feeds = getRSSFeeds();
	const updatedFeeds = feeds.filter(f => f.id !== id);
	localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(updatedFeeds));
}

/**
 * Update an RSS feed
 */
export function updateRSSFeed(id: string, updates: Partial<Omit<RSSFeed, 'id' | 'addedAt'>>): RSSFeed | null {
	const feeds = getRSSFeeds();
	const feedIndex = feeds.findIndex(f => f.id === id);

	if (feedIndex === -1) {
		return null;
	}

	const updatedFeed = {
		...feeds[feedIndex],
		...updates
	};

	feeds[feedIndex] = updatedFeed;
	localStorage.setItem(RSS_FEEDS_KEY, JSON.stringify(feeds));

	return updatedFeed;
}

/**
 * Check if a feed URL is already subscribed
 */
export function isFeedSubscribed(url: string): boolean {
	const feeds = getRSSFeeds();
	return feeds.some(f => f.url === url);
}

/**
 * Clear all RSS feeds
 */
export function clearAllRSSFeeds(): void {
	localStorage.removeItem(RSS_FEEDS_KEY);
}
