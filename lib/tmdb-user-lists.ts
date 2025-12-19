const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';

const getHeaders = () => ({
	'accept': 'application/json',
	'content-type': 'application/json',
	'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
});

// ... existing functions ...

/**
 * Get all user lists from TMDB
 */
export async function getTMDBLists(accountId: number, sessionId: string) {
	if (!TMDB_BEARER_TOKEN) return [];

	try {
		const response = await fetch(
			`${BASE_URL}/account/${accountId}/lists?session_id=${sessionId}`,
			{ headers: getHeaders() }
		);

		if (!response.ok) return [];

		const data = await response.json();
		return data.results || [];
	} catch (error) {
		console.error('Error fetching TMDB lists:', error);
		return [];
	}
}

/**
 * Get TMDB list details including items
 */
export async function getTMDBListDetails(listId: string) {
	if (!TMDB_BEARER_TOKEN) return null;

	try {
		const response = await fetch(
			`${BASE_URL}/list/${listId}`,
			{ headers: getHeaders() }
		);

		if (!response.ok) return null;

		return await response.json();
	} catch (error) {
		console.error('Error fetching TMDB list details:', error);
		return null;
	}
}

/**
 * Create a new list on TMDB
 */
export async function createTMDBList(
	sessionId: string,
	name: string,
	description: string = ''
): Promise<{ success: boolean; list_id?: number }> {
	if (!TMDB_BEARER_TOKEN) return { success: false };

	try {
		const response = await fetch(
			`${BASE_URL}/list?session_id=${sessionId}`,
			{
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify({
					name,
					description,
					language: 'en'
				})
			}
		);

		if (!response.ok) {
			console.error('TMDB create list failed:', response.status);
			return { success: false };
		}

		const data = await response.json();
		return {
			success: data.success,
			list_id: data.list_id
		};
	} catch (error) {
		console.error('Error creating TMDB list:', error);
		return { success: false };
	}
}

/**
 * Add item to TMDB list
 */
export async function addItemToTMDBList(
	sessionId: string,
	listId: string,
	mediaId: number
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(
			`${BASE_URL}/list/${listId}/add_item?session_id=${sessionId}`,
			{
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify({
					media_id: mediaId
				})
			}
		);

		return response.ok;
	} catch (error) {
		console.error('Error adding item to TMDB list:', error);
		return false;
	}
}

/**
 * Remove item from TMDB list
 */
export async function removeItemFromTMDBList(
	sessionId: string,
	listId: string,
	mediaId: number
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(
			`${BASE_URL}/list/${listId}/remove_item?session_id=${sessionId}`,
			{
				method: 'POST',
				headers: getHeaders(),
				body: JSON.stringify({
					media_id: mediaId
				})
			}
		);

		return response.ok;
	} catch (error) {
		console.error('Error removing item from TMDB list:', error);
		return false;
	}
}

/**
 * Delete TMDB list
 */
export async function deleteTMDBList(
	sessionId: string,
	listId: string
): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) return false;

	try {
		const response = await fetch(
			`${BASE_URL}/list/${listId}?session_id=${sessionId}`,
			{
				method: 'DELETE',
				headers: getHeaders()
			}
		);

		return response.ok;
	} catch (error) {
		console.error('Error deleting TMDB list:', error);
		return false;
	}
}
