const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';

const getHeaders = () => ({
	'accept': 'application/json',
	'content-type': 'application/json',
	'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
});

/**
 * Add or remove media from watchlist
 */
export async function addToWatchlist(
	accountId: number,
	sessionId: string,
	mediaType: 'movie' | 'tv',
	mediaId: number,
	watchlist: boolean
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(`${BASE_URL}/account/${accountId}/watchlist`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({
				media_type: mediaType,
				media_id: mediaId,
				watchlist: watchlist
			})
		});
		return response.ok;
	} catch (error) {
		console.error('Error adding to watchlist:', error);
		return false;
	}
}

/**
 * Mark media as favorite
 */
export async function markAsFavorite(
	accountId: number,
	sessionId: string,
	mediaType: 'movie' | 'tv',
	mediaId: number,
	favorite: boolean
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(`${BASE_URL}/account/${accountId}/favorite`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({
				media_type: mediaType,
				media_id: mediaId,
				favorite: favorite
			})
		});
		return response.ok;
	} catch (error) {
		console.error('Error marking as favorite:', error);
		return false;
	}
}

/**
 * Rate media (1.0 to 10.0)
 * session_id is required via query param or body for some endpoints, 
 * but for /rating usually Authorization header + session_id or guest_session_id works.
 * With Bearer token, we actually need to pass session_id in query param for user actions usually?
 * Let's check docs: https://developer.themoviedb.org/reference/movie-add-rating
 * "Authentication: session_id"
 */
export async function rateMedia(
	sessionId: string,
	mediaType: 'movie' | 'tv',
	mediaId: number,
	value: number
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		// value must be between 0.5 and 10.0
		const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/rating?session_id=${sessionId}`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({ value })
		});
		return response.ok;
	} catch (error) {
		console.error('Error rating media:', error);
		return false;
	}
}

/**
 * Delete rating
 */
export async function deleteRating(
	sessionId: string,
	mediaType: 'movie' | 'tv',
	mediaId: number
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/rating?session_id=${sessionId}`, {
			method: 'DELETE',
			headers: getHeaders()
		});
		return response.ok;
	} catch (error) {
		console.error('Error deleting rating:', error);
		return false;
	}
}

/**
 * Get Account States (favorite, rated, watchlist)
 * https://developer.themoviedb.org/reference/movie-account-states
 */
export async function getAccountStates(
	sessionId: string,
	mediaType: 'movie' | 'tv',
	mediaId: number
) {
	if (!TMDB_BEARER_TOKEN) return null;

	try {
		const response = await fetch(`${BASE_URL}/${mediaType}/${mediaId}/account_states?session_id=${sessionId}`, {
			method: 'GET',
			headers: getHeaders()
		});
		const data = await response.json();
		return {
			favorite: data.favorite,
			rated: data.rated, // can be boolean false or object { value: 8 }
			watchlist: data.watchlist
		};
	} catch (error) {
		console.error('Error getting account states:', error);
		return null;
	}
}

// Lists interfaces
export interface TMDBList {
	id: number;
	name: string;
	description: string;
	item_count: number;
}

interface TMDBListResponse {
	results: TMDBList[];
	total_results: number;
	page: number;
	total_pages: number;
}

interface TMDBListCreateResponse {
	status_message: string;
	success: boolean;
	status_code: number;
	list_id: number;
}

/**
 * Get user's custom lists
 */
export async function getUserLists(
	accountId: number,
	sessionId: string,
	page: number = 1
): Promise<TMDBList[]> {
	if (!TMDB_BEARER_TOKEN) return [];

	try {
		const response = await fetch(`${BASE_URL}/account/${accountId}/lists?session_id=${sessionId}&page=${page}`, {
			method: 'GET',
			headers: getHeaders()
		});

		if (!response.ok) return [];

		const data: TMDBListResponse = await response.json();
		return data.results || [];
	} catch (error) {
		console.error('Error getting user lists:', error);
		return [];
	}
}

/**
 * Create a new custom list
 */
export async function createList(
	sessionId: string,
	name: string,
	description: string = ''
): Promise<number | null> {
	if (!TMDB_BEARER_TOKEN) return null;

	try {
		const response = await fetch(`${BASE_URL}/list?session_id=${sessionId}`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({
				name,
				description,
				language: 'en'
			})
		});

		if (!response.ok) return null;

		const data: TMDBListCreateResponse = await response.json();
		if (data.success) {
			return data.list_id;
		}
		return null;
	} catch (error) {
		console.error('Error creating list:', error);
		return null;
	}
}

/**
 * Add media to a custom list
 */
export async function addToList(
	sessionId: string,
	listId: number,
	mediaId: number
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(`${BASE_URL}/list/${listId}/add_item?session_id=${sessionId}`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({
				media_id: mediaId
			})
		});

		return response.ok;
	} catch (error) {
		console.error('Error adding to list:', error);
		return false;
	}
}

/**
 * Get list details with items
 */
export async function getListDetails(listId: number, language: string = 'en-US') {
	if (!TMDB_BEARER_TOKEN) return null;

	try {
		const response = await fetch(`${BASE_URL}/list/${listId}?language=${language}`, {
			method: 'GET',
			headers: getHeaders()
		});

		if (!response.ok) return null;

		const data = await response.json();
		const items = (data.items || []).map((item: any) => ({
			id: item.id,
			title: item.title || item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: item.media_type || (item.title ? 'movie' : 'tv')
		}));

		return {
			id: data.id,
			name: data.name,
			description: data.description,
			item_count: data.item_count,
			items
		};
	} catch (error) {
		console.error('Error getting list details:', error);
		return null;
	}
}

/**
 * Delete a custom list
 */
export async function deleteList(sessionId: string, listId: number): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(`${BASE_URL}/list/${listId}?session_id=${sessionId}`, {
			method: 'DELETE',
			headers: getHeaders()
		});

		return response.ok;
	} catch (error) {
		console.error('Error deleting list:', error);
		return false;
	}
}

/**
 * Remove media from a custom list
 */
export async function removeFromList(
	sessionId: string,
	listId: number,
	mediaId: number
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(`${BASE_URL}/list/${listId}/remove_item?session_id=${sessionId}`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({
				media_id: mediaId
			})
		});

		return response.ok;
	} catch (error) {
		console.error('Error removing from list:', error);
		return false;
	}
}
// ... imports

/**
 * Get user's favorites
 */
export async function getFavorites(
	accountId: number,
	sessionId: string,
	mediaType: 'movies' | 'tv',
	page: number = 1,
	language: string = 'en-US'
) {
	if (!TMDB_BEARER_TOKEN) return { results: [], total_pages: 0 };

	try {
		const response = await fetch(`${BASE_URL}/account/${accountId}/favorite/${mediaType}?session_id=${sessionId}&page=${page}&language=${language}&sort_by=created_at.desc`, {
			method: 'GET',
			headers: getHeaders()
		});

		if (!response.ok) return { results: [], total_pages: 0 };

		const data = await response.json();
		const results = data.results.map((item: any) => ({
			id: item.id,
			title: item.title || item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: mediaType === 'movies' ? 'movie' : 'tv'
		}));

		return {
			results,
			total_pages: data.total_pages
		};
	} catch (error) {
		console.error('Error getting favorites:', error);
		return { results: [], total_pages: 0 };
	}
}

/**
 * Get user's watchlist
 */
export async function getWatchlist(
	accountId: number,
	sessionId: string,
	mediaType: 'movies' | 'tv',
	page: number = 1,
	language: string = 'en-US'
) {
	if (!TMDB_BEARER_TOKEN) return { results: [], total_pages: 0 };

	try {
		const response = await fetch(`${BASE_URL}/account/${accountId}/watchlist/${mediaType}?session_id=${sessionId}&page=${page}&language=${language}&sort_by=created_at.desc`, {
			method: 'GET',
			headers: getHeaders()
		});

		if (!response.ok) return { results: [], total_pages: 0 };

		const data = await response.json();
		const results = data.results.map((item: any) => ({
			id: item.id,
			title: item.title || item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: mediaType === 'movies' ? 'movie' : 'tv'
		}));

		return {
			results,
			total_pages: data.total_pages
		};
	} catch (error) {
		console.error('Error getting watchlist:', error);
		return { results: [], total_pages: 0 };
	}
}
