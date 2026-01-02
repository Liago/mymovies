'use server';

import {
	getPersonDetails,
	getPersonCredits,
	getPersonDetailsById,
	getDiscoverMovies,
	getTVShows,
	getMovieTrailerTMDb,
	getUpcomingMovies,
	searchMulti,
	getTrending,
	getTopRatedMovies,
	getTopRatedTV,
	getNowPlayingMovies,
	getPopularMovies,
	getPopularTV,
	getMovieGenres,
	getTVGenres,
	getDiscoverMoviesByGenre,
	getDiscoverTVByGenre,
	getSimilarMovies,
	getSimilarTV,
	getMovieRecommendations,
	getTVRecommendations,
	getTVSeasonDetails
} from '@/lib/tmdb';
import { addToWatchlist, markAsFavorite, rateMedia, deleteRating, getAccountStates, getUserLists, createList, addToList, getListDetails, deleteList, removeFromList, getFavorites, getWatchlist } from '@/lib/tmdb-user';
import { cookies } from 'next/headers';

// ... imports ...

import { createClient } from '@/lib/supabase/server';
async function getLanguage() {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value;
	return lang && (lang === 'en-US' || lang === 'it-IT') ? lang : 'it-IT';
}

export async function fetchPersonDetails(name: string) {
	const lang = await getLanguage();
	return await getPersonDetails(name, lang);
}

// ... existing actions ...

export async function fetchPersonCredits(id: number) {
	const lang = await getLanguage();
	return await getPersonCredits(id, lang);
}

export async function fetchPersonDetailsById(id: number) {
	const lang = await getLanguage();
	return await getPersonDetailsById(id, lang);
}

export async function fetchDiscoverMovies(page: number = 1) {
	const lang = await getLanguage();
	return await getDiscoverMovies(page, lang);
}

export async function fetchTVShows(page: number = 1) {
	const lang = await getLanguage();
	return await getTVShows(page, lang);
}

export async function fetchUpcomingMovies(page: number = 1) {
	const lang = await getLanguage();
	return await getUpcomingMovies(page, lang);
}

export async function fetchMovieTrailer(id: number) {
	const lang = await getLanguage();
	return await getMovieTrailerTMDb(id, lang);
}

// User Actions

async function getSessionId() {
	const cookieStore = await cookies();
	return cookieStore.get('tmdb_session_id')?.value;
}

async function getAccountId() {
	const cookieStore = await cookies();
	const userCookie = cookieStore.get('tmdb_user')?.value;
	if (!userCookie) return null;
	try {
		const user = JSON.parse(userCookie);
		return user.id;
	} catch {
		return null;
	}
}

export async function actionGetUserLists() {
	'use server';
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) return [];

		const { data: profile } = await supabase
			.from('profiles')
			.select('tmdb_id')
			.eq('auth_user_id', user.id)
			.single();

		if (!profile) return [];

		// Get lists with item count
		const { data: userLists, error } = await supabase
			.from('user_lists')
			.select('id, name, description, created_at')
			.eq('user_id', profile.tmdb_id)
			.order('created_at', { ascending: false });

		if (error) {
			console.error('[actionGetUserLists] Query error:', error);
			return [];
		}

		// Count items for each list
		const listsWithCounts = await Promise.all(
			(userLists || []).map(async (list: any) => {
				const { count } = await supabase
					.from('list_items')
					.select('*', { count: 'exact', head: true })
					.eq('list_id', list.id);

				return {
					id: list.id,
					name: list.name,
					description: list.description,
					count: count || 0
				};
			})
		);

		return listsWithCounts;
	} catch (error) {
		console.error('[actionGetUserLists] Error:', error);
		return [];
	}
}

export async function actionCreateList(name: string, description: string) {
	const sessionId = await getSessionId();
	if (!sessionId) return null;

	return await createList(sessionId, name, description);
}

export async function actionAddToList(listId: number, mediaId: number) {
	const sessionId = await getSessionId();
	if (!sessionId) return false;

	return await addToList(sessionId, listId, mediaId);
}



export async function actionAddToWatchlist(mediaType: 'movie' | 'tv', mediaId: number, watchlist: boolean) {
	const sessionId = await getSessionId();
	const accountId = await getAccountId();
	if (!sessionId || !accountId) return false;

	return await addToWatchlist(accountId, sessionId, mediaType, mediaId, watchlist);
}

export async function actionMarkAsFavorite(mediaType: 'movie' | 'tv', mediaId: number, favorite: boolean) {
	const sessionId = await getSessionId();
	const accountId = await getAccountId();
	if (!sessionId || !accountId) return false;

	return await markAsFavorite(accountId, sessionId, mediaType, mediaId, favorite);
}

export async function actionRateMedia(mediaType: 'movie' | 'tv', mediaId: number, value: number) {
	const sessionId = await getSessionId();
	if (!sessionId) return false;

	return await rateMedia(sessionId, mediaType, mediaId, value);
}

export async function actionDeleteRating(mediaType: 'movie' | 'tv', mediaId: number) {
	const sessionId = await getSessionId();
	if (!sessionId) return false;

	return await deleteRating(sessionId, mediaType, mediaId);
}

export async function fetchAccountStates(mediaType: 'movie' | 'tv', mediaId: number) {
	const sessionId = await getSessionId();
	if (!sessionId) return null;

	return await getAccountStates(sessionId, mediaType, mediaId);
}

export async function actionGetFavorites(mediaType: 'movies' | 'tv', page: number = 1) {
	const sessionId = await getSessionId();
	const accountId = await getAccountId();
	if (!sessionId || !accountId) return { results: [], total_pages: 0 };

	const lang = await getLanguage();
	return await getFavorites(accountId, sessionId, mediaType, page, lang);
}

export async function actionGetWatchlist(mediaType: 'movies' | 'tv', page: number = 1) {
	const sessionId = await getSessionId();
	const accountId = await getAccountId();
	if (!sessionId || !accountId) return { results: [], total_pages: 0 };

	const lang = await getLanguage();
	return await getWatchlist(accountId, sessionId, mediaType, page, lang);
}

export async function actionGetListDetails(listId: number) {
	'use server';
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) return null;

		const { data: profile } = await supabase
			.from('profiles')
			.select('tmdb_id')
			.eq('auth_user_id', user.id)
			.single();

		if (!profile) return null;

		// Get list details
		const { data: list, error: listError } = await supabase
			.from('user_lists')
			.select('*')
			.eq('id', listId)
			.eq('user_id', profile.tmdb_id)
			.single();

		if (listError || !list) return null;

		// Get list items
		const { data: items, error: itemsError } = await supabase
			.from('list_items')
			.select('*')
			.eq('list_id', listId)
			.order('added_at', { ascending: false });

		if (itemsError) {
			console.error('[actionGetListDetails] Error fetching items:', itemsError);
		}

		// Transform items to MovieCard format
		const transformedItems = (items || []).map((item: any) => ({
			id: item.media_id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			media_type: item.media_type,
			rating: 0,
			year: '',
		}));

		return {
			id: list.id,
			name: list.name,
			description: list.description,
			item_count: items?.length || 0,
			items: transformedItems
		};
	} catch (error) {
		console.error('[actionGetListDetails] Error:', error);
		return null;
	}
}

export async function actionDeleteList(listId: number) {
	const sessionId = await getSessionId();
	if (!sessionId) return false;

	return await deleteList(sessionId, listId);
}

export async function actionRemoveFromList(listId: number, mediaId: number) {
	const sessionId = await getSessionId();
	if (!sessionId) return false;

	return await removeFromList(sessionId, listId, mediaId);
}

// New TMDB API Actions

export async function fetchSearchMulti(query: string, page: number = 1) {
	const lang = await getLanguage();
	return await searchMulti(query, page, lang);
}

export async function fetchTrending(mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all', timeWindow: 'day' | 'week' = 'week') {
	const lang = await getLanguage();
	return await getTrending(mediaType, timeWindow, lang);
}

export async function fetchTopRatedMovies(page: number = 1) {
	const lang = await getLanguage();
	return await getTopRatedMovies(page, lang);
}

export async function fetchTopRatedTV(page: number = 1) {
	const lang = await getLanguage();
	return await getTopRatedTV(page, lang);
}

export async function fetchNowPlayingMovies(page: number = 1) {
	const lang = await getLanguage();
	return await getNowPlayingMovies(page, lang);
}

export async function fetchPopularMovies(page: number = 1) {
	const lang = await getLanguage();
	return await getPopularMovies(page, lang);
}

export async function fetchPopularTV(page: number = 1) {
	const lang = await getLanguage();
	return await getPopularTV(page, lang);
}

export async function fetchMovieGenres() {
	const lang = await getLanguage();
	return await getMovieGenres(lang);
}

export async function fetchTVGenres() {
	const lang = await getLanguage();
	return await getTVGenres(lang);
}

export async function fetchDiscoverMoviesByGenre(genreId: number, page: number = 1) {
	const lang = await getLanguage();
	return await getDiscoverMoviesByGenre(genreId, page, lang);
}

export async function fetchDiscoverTVByGenre(genreId: number, page: number = 1) {
	const lang = await getLanguage();
	return await getDiscoverTVByGenre(genreId, page, lang);
}

export async function fetchSimilarMovies(movieId: number, page: number = 1) {
	const lang = await getLanguage();
	return await getSimilarMovies(movieId, page, lang);
}

export async function fetchSimilarTV(tvId: number, page: number = 1) {
	const lang = await getLanguage();
	return await getSimilarTV(tvId, page, lang);
}

export async function fetchMovieRecommendations(movieId: number, page: number = 1) {
	const lang = await getLanguage();
	return await getMovieRecommendations(movieId, page, lang);
}

export async function fetchTVRecommendations(tvId: number, page: number = 1) {
	const lang = await getLanguage();
	return await getTVRecommendations(tvId, page, lang);
}

export async function fetchTVSeasonDetails(tvId: number, seasonNumber: number) {
	const lang = await getLanguage();
	return await getTVSeasonDetails(tvId, seasonNumber, lang);
}
