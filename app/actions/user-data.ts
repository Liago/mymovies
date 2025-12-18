'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { HistoryItem } from '@/context/HistoryContext';

// Types matching the context state
interface ShowMetadata {
	id: number;
	name: string;
	poster: string | null;
	lastUpdated: number;
}

export async function syncUserProfile(user: {
	id: number;
	username: string;
	name: string;
	avatar_url: string | null;
}) {
	const supabase = createAdminClient();

	const { error } = await supabase
		.from('profiles')
		.upsert({
			tmdb_id: user.id,
			username: user.username,
			avatar_url: user.avatar_url,
		}, { onConflict: 'tmdb_id' });

	if (error) {
		console.error('Error syncing user profile:', error);
		throw new Error('Failed to sync user profile');
	}
}

export async function syncLocalHistory(tmdbId: number, history: HistoryItem[]) {
	const supabase = createAdminClient();

	if (history.length === 0) return;

	const records = history.map(item => ({
		user_id: tmdbId,
		item_id: item.id,
		title: item.title,
		poster_path: item.poster,
		media_type: item.type,
		watched_at: new Date(item.timestamp).toISOString()
	}));

	const { error } = await supabase
		.from('history')
		.upsert(records, { onConflict: 'user_id, item_id', ignoreDuplicates: true });

	if (error) {
		console.error('Error syncing history:', error);
	}
}

export async function getHistory(tmdbId: number): Promise<HistoryItem[]> {
	const supabase = createAdminClient();

	const { data, error } = await supabase
		.from('history')
		.select('*')
		.eq('user_id', tmdbId)
		.order('watched_at', { ascending: false });

	if (error) {
		console.error('Error fetching history:', error);
		return [];
	}

	return data.map((row: any) => ({
		id: row.item_id,
		title: row.title,
		poster: row.poster_path,
		type: row.media_type as 'movie' | 'tv',
		timestamp: new Date(row.watched_at).getTime()
	}));
}

export async function addToHistory(tmdbId: number, item: HistoryItem) {
	const supabase = createAdminClient();

	const { error } = await supabase
		.from('history')
		.insert({
			user_id: tmdbId,
			item_id: item.id,
			title: item.title,
			poster_path: item.poster,
			media_type: item.type,
			watched_at: new Date(item.timestamp).toISOString()
		});

	if (error) console.error('Error adding to history:', error);
}

export async function clearHistory(tmdbId: number) {
	const supabase = createAdminClient();
	await supabase.from('history').delete().eq('user_id', tmdbId);
}

// --- Tracker Actions ---

export async function syncLocalTracker(
	tmdbId: number,
	watchedEpisodes: string[], // "tvId:s:e"
	watchedShows: ShowMetadata[]
) {
	const supabase = createAdminClient();

	// 1. Sync Shows
	if (watchedShows.length > 0) {
		const showRecords = watchedShows.map(s => ({
			user_id: tmdbId,
			show_id: s.id,
			name: s.name,
			poster_path: s.poster,
			last_updated: new Date(s.lastUpdated).toISOString()
		}));

		// Upsert shows
		await supabase.from('tracked_shows').upsert(showRecords, { onConflict: 'user_id, show_id' });
	}

	// 2. Sync Episodes
	if (watchedEpisodes.length > 0) {
		const episodeRecords = watchedEpisodes.map(key => {
			const [showId, season, episode] = key.split(':').map(Number);
			return {
				user_id: tmdbId,
				show_id: showId,
				season_number: season,
				episode_number: episode
			};
		});

		// Upsert episodes
		await supabase.from('watched_episodes').upsert(episodeRecords, { onConflict: 'user_id, show_id, season_number, episode_number', ignoreDuplicates: true });
	}
}

// --- TMDB Sync Functions ---

/**
 * Sync favorites FROM TMDB → Supabase
 */
export async function syncFavoritesFromTMDB(tmdbId: number, sessionId: string) {
	const { getFavorites } = await import('@/lib/tmdb-user');
	const supabase = createAdminClient();

	try {
		// Fetch from TMDB (movies + tv)
		const [moviesData, tvData] = await Promise.all([
			getFavorites(tmdbId, sessionId, 'movies', 1),
			getFavorites(tmdbId, sessionId, 'tv', 1)
		]);

		const favorites = [
			...moviesData.results.map((item: any) => ({
				user_id: tmdbId,
				media_id: item.id,
				media_type: 'movie' as const,
				title: item.title,
				poster_path: item.poster
			})),
			...tvData.results.map((item: any) => ({
				user_id: tmdbId,
				media_id: item.id,
				media_type: 'tv' as const,
				title: item.title,
				poster_path: item.poster
			}))
		];

		if (favorites.length > 0) {
			await supabase.from('favorites').upsert(favorites, { onConflict: 'user_id, media_id, media_type' });
		}
	} catch (error) {
		console.error('Error syncing favorites from TMDB:', error);
	}
}

/**
 * Sync watchlist FROM TMDB → Supabase
 */
export async function syncWatchlistFromTMDB(tmdbId: number, sessionId: string) {
	const { getWatchlist } = await import('@/lib/tmdb-user');
	const supabase = createAdminClient();

	try {
		const [moviesData, tvData] = await Promise.all([
			getWatchlist(tmdbId, sessionId, 'movies', 1),
			getWatchlist(tmdbId, sessionId, 'tv', 1)
		]);

		const watchlist = [
			...moviesData.results.map((item: any) => ({
				user_id: tmdbId,
				media_id: item.id,
				media_type: 'movie' as const,
				title: item.title,
				poster_path: item.poster
			})),
			...tvData.results.map((item: any) => ({
				user_id: tmdbId,
				media_id: item.id,
				media_type: 'tv' as const,
				title: item.title,
				poster_path: item.poster
			}))
		];

		if (watchlist.length > 0) {
			await supabase.from('watchlist').upsert(watchlist, { onConflict: 'user_id, media_id, media_type' });
		}
	} catch (error) {
		console.error('Error syncing watchlist from TMDB:', error);
	}
}

/**
 * Sync ratings FROM TMDB → Supabase
 */
export async function syncRatingsFromTMDB(tmdbId: number, sessionId: string) {
	const { getRatedMedia } = await import('@/lib/tmdb-user');
	const supabase = createAdminClient();

	try {
		const [moviesData, tvData] = await Promise.all([
			getRatedMedia(tmdbId, sessionId, 'movies', 1),
			getRatedMedia(tmdbId, sessionId, 'tv', 1)
		]);

		const ratings = [
			...moviesData.results.map((item: any) => ({
				user_id: tmdbId,
				media_id: item.id,
				media_type: 'movie' as const,
				title: item.title,
				poster_path: item.poster,
				rating: item.userRating
			})),
			...tvData.results.map((item: any) => ({
				user_id: tmdbId,
				media_id: item.id,
				media_type: 'tv' as const,
				title: item.title,
				poster_path: item.poster,
				rating: item.userRating
			}))
		];

		if (ratings.length > 0) {
			await supabase.from('ratings').upsert(ratings, { onConflict: 'user_id, media_id, media_type' });
		}
	} catch (error) {
		console.error('Error syncing ratings from TMDB:', error);
	}
}

/**
 * Sync local guest favorites TO database
 */
export async function syncLocalFavorites(tmdbId: number, favorites: any[]) {
	const supabase = createAdminClient();

	if (favorites.length === 0) return;

	const records = favorites.map(f => ({
		user_id: tmdbId,
		media_id: f.id,
		media_type: f.media_type,
		title: f.title,
		poster_path: f.poster
	}));

	await supabase.from('favorites').upsert(records, { onConflict: 'user_id, media_id, media_type', ignoreDuplicates: true });
}

/**
 * Sync local guest watchlist TO database
 */
export async function syncLocalWatchlist(tmdbId: number, watchlist: any[]) {
	const supabase = createAdminClient();

	if (watchlist.length === 0) return;

	const records = watchlist.map(w => ({
		user_id: tmdbId,
		media_id: w.id,
		media_type: w.media_type,
		title: w.title,
		poster_path: w.poster
	}));

	await supabase.from('watchlist').upsert(records, { onConflict: 'user_id, media_id, media_type', ignoreDuplicates: true });
}

/**
 * Sync local guest ratings TO database
 */
export async function syncLocalRatings(tmdbId: number, ratings: any[]) {
	const supabase = createAdminClient();

	if (ratings.length === 0) return;

	const records = ratings.map(r => ({
		user_id: tmdbId,
		media_id: r.id,
		media_type: r.media_type,
		title: r.title,
		poster_path: r.poster,
		rating: r.rating
	}));

	await supabase.from('ratings').upsert(records, { onConflict: 'user_id, media_id, media_type', ignoreDuplicates: true });
}

/**
 * Push local items TO TMDB (items that don't exist on TMDB yet)
 */
export async function pushLocalToTMDB(tmdbId: number, sessionId: string) {
	const { markAsFavorite, addToWatchlist, rateMedia } = await import('@/lib/tmdb-user');
	const supabase = createAdminClient();

	try {
		// Get all items from DB
		const [{ data: favorites }, { data: watchlist }, { data: ratings }] = await Promise.all([
			supabase.from('favorites').select('*').eq('user_id', tmdbId),
			supabase.from('watchlist').select('*').eq('user_id', tmdbId),
			supabase.from('ratings').select('*').eq('user_id', tmdbId)
		]);

		// Push favorites to TMDB
		if (favorites) {
			for (const fav of favorites) {
				await markAsFavorite(tmdbId, sessionId, fav.media_type, fav.media_id, true).catch(console.error);
			}
		}

		// Push watchlist to TMDB
		if (watchlist) {
			for (const item of watchlist) {
				await addToWatchlist(tmdbId, sessionId, item.media_type, item.media_id, true).catch(console.error);
			}
		}

		// Push ratings to TMDB
		if (ratings) {
			for (const rating of ratings) {
				await rateMedia(sessionId, rating.media_type, rating.media_id, parseFloat(rating.rating)).catch(console.error);
			}
		}
	} catch (error) {
		console.error('Error pushing to TMDB:', error);
	}
}


export async function getTrackerData(tmdbId: number) {
	const supabase = createAdminClient();

	const { data: shows } = await supabase.from('tracked_shows').select('*').eq('user_id', tmdbId);
	const { data: episodes } = await supabase.from('watched_episodes').select('*').eq('user_id', tmdbId);

	const parsedShows = new Map<number, ShowMetadata>();
	shows?.forEach((s: any) => {
		parsedShows.set(s.show_id, {
			id: s.show_id,
			name: s.name,
			poster: s.poster_path,
			lastUpdated: new Date(s.last_updated).getTime()
		});
	});

	const parsedEpisodes = new Set<string>();
	episodes?.forEach((e: any) => {
		parsedEpisodes.add(`${e.show_id}:${e.season_number}:${e.episode_number}`);
	});

	return {
		watchedShows: Array.from(parsedShows.values()), // Return array for client to Map-ify
		watchedEpisodes: Array.from(parsedEpisodes)
	};
}

export async function toggleWatchedEpisode(
	tmdbId: number,
	showId: number,
	season: number,
	episode: number,
	isWatched: boolean,
	showMeta?: { name: string, poster: string | null }
) {
	const supabase = createAdminClient();

	if (isWatched) {
		// Add episode
		await supabase.from('watched_episodes').upsert({
			user_id: tmdbId,
			show_id: showId,
			season_number: season,
			episode_number: episode
		}, { onConflict: 'user_id, show_id, season_number, episode_number' });

		// Update show meta
		if (showMeta) {
			await supabase.from('tracked_shows').upsert({
				user_id: tmdbId,
				show_id: showId,
				name: showMeta.name,
				poster_path: showMeta.poster,
				last_updated: new Date().toISOString()
			}, { onConflict: 'user_id, show_id' });
		}
	} else {
		// Remove episode
		await supabase.from('watched_episodes').delete().match({
			user_id: tmdbId,
			show_id: showId,
			season_number: season,
			episode_number: episode
		});
	}
}

export async function bulkMarkWatched(
	tmdbId: number,
	episodes: { showId: number; season: number; episode: number }[],
	showMeta?: { id: number; name: string; poster: string | null }
) {
	const supabase = createAdminClient();

	if (episodes.length === 0) return;

	const records = episodes.map((e) => ({
		user_id: tmdbId,
		show_id: e.showId,
		season_number: e.season,
		episode_number: e.episode,
	}));

	await supabase
		.from('watched_episodes')
		.upsert(records, { onConflict: 'user_id, show_id, season_number, episode_number' });

	if (showMeta) {
		await supabase.from('tracked_shows').upsert(
			{
				user_id: tmdbId,
				show_id: showMeta.id,
				name: showMeta.name,
				poster_path: showMeta.poster,
				last_updated: new Date().toISOString(),
			},
			{ onConflict: 'user_id, show_id' }
		);
	}
}

export async function bulkMarkUnwatched(
	tmdbId: number,
	episodes: { showId: number; season: number; episode: number }[]
) {
	const supabase = createAdminClient();

	if (episodes.length === 0) return;

	// Iterate to delete
	for (const chunk of episodes) {
		await supabase.from('watched_episodes').delete().match({
			user_id: tmdbId,
			show_id: chunk.showId,
			season_number: chunk.season,
			episode_number: chunk.episode
		});
	}
}
