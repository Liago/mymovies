'use server';

import { getPersonDetails, getPersonCredits, getDiscoverMovies, getTVShows, getMovieTrailerTMDb, getUpcomingMovies } from '@/lib/tmdb';
import { addToWatchlist, markAsFavorite, rateMedia, deleteRating, getAccountStates, getUserLists, createList, addToList, getListDetails, deleteList, removeFromList, getFavorites, getWatchlist } from '@/lib/tmdb-user';
import { cookies } from 'next/headers';

// ... imports ...

async function getLanguage() {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value;
	return lang && (lang === 'en-US' || lang === 'it-IT') ? lang : 'en-US';
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
	const sessionId = await getSessionId();
	const accountId = await getAccountId();
	if (!sessionId || !accountId) return [];

	return await getUserLists(accountId, sessionId);
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
	const lang = await getLanguage();
	return await getListDetails(listId, lang);
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
