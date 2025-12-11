const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';

interface TMDBRequestTokenResponse {
	success: boolean;
	expires_at: string;
	request_token: string;
}

interface TMDBSessionResponse {
	success: boolean;
	session_id: string;
}

interface TMDBDeleteSessionResponse {
	success: boolean;
}

export interface TMDBUser {
	id: number;
	username: string;
	name: string;
	avatar: {
		gravatar: { hash: string };
		tmdb: { avatar_path: string | null };
	};
	include_adult: boolean;
	iso_639_1: string;
	iso_3166_1: string;
}

const getHeaders = () => ({
	'accept': 'application/json',
	'content-type': 'application/json',
	'Authorization': `Bearer ${TMDB_BEARER_TOKEN}`
});

/**
 * Step 1: Create a request token
 * This token is temporary and expires after 60 minutes
 */
export async function createRequestToken(): Promise<string | null> {
	if (!TMDB_BEARER_TOKEN) {
		console.error('TMDB_BEARER_TOKEN is not set');
		return null;
	}

	try {
		const response = await fetch(`${BASE_URL}/authentication/token/new`, {
			method: 'GET',
			headers: getHeaders(),
		});

		if (!response.ok) {
			console.error('Failed to create request token:', response.statusText);
			return null;
		}

		const data: TMDBRequestTokenResponse = await response.json();

		if (data.success) {
			return data.request_token;
		}

		return null;
	} catch (error) {
		console.error('Error creating request token:', error);
		return null;
	}
}

/**
 * Get the TMDB authorization URL for user to approve the request token
 */
export function getAuthorizationUrl(requestToken: string, redirectTo: string): string {
	return `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(redirectTo)}`;
}

/**
 * Step 3: Create a session ID with the approved request token
 * This session_id can be used for user-specific actions
 */
export async function createSession(requestToken: string): Promise<string | null> {
	if (!TMDB_BEARER_TOKEN) {
		console.error('TMDB_BEARER_TOKEN is not set');
		return null;
	}

	try {
		const response = await fetch(`${BASE_URL}/authentication/session/new`, {
			method: 'POST',
			headers: getHeaders(),
			body: JSON.stringify({ request_token: requestToken }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			console.error('Failed to create session:', errorData);
			return null;
		}

		const data: TMDBSessionResponse = await response.json();

		if (data.success) {
			return data.session_id;
		}

		return null;
	} catch (error) {
		console.error('Error creating session:', error);
		return null;
	}
}

/**
 * Delete a session (logout)
 */
export async function deleteSession(sessionId: string): Promise<boolean> {
	if (!TMDB_BEARER_TOKEN) {
		console.error('TMDB_BEARER_TOKEN is not set');
		return false;
	}

	try {
		const response = await fetch(`${BASE_URL}/authentication/session`, {
			method: 'DELETE',
			headers: getHeaders(),
			body: JSON.stringify({ session_id: sessionId }),
		});

		if (!response.ok) {
			console.error('Failed to delete session:', response.statusText);
			return false;
		}

		const data: TMDBDeleteSessionResponse = await response.json();
		return data.success;
	} catch (error) {
		console.error('Error deleting session:', error);
		return false;
	}
}

/**
 * Get account details for the logged-in user
 */
export async function getAccountDetails(sessionId: string): Promise<TMDBUser | null> {
	if (!TMDB_BEARER_TOKEN) {
		console.error('TMDB_BEARER_TOKEN is not set');
		return null;
	}

	try {
		const response = await fetch(`${BASE_URL}/account?session_id=${sessionId}`, {
			method: 'GET',
			headers: getHeaders(),
		});

		if (!response.ok) {
			console.error('Failed to get account details:', response.statusText);
			return null;
		}

		const data: TMDBUser = await response.json();
		return data;
	} catch (error) {
		console.error('Error getting account details:', error);
		return null;
	}
}

/**
 * Get avatar URL from user data
 */
export function getUserAvatarUrl(user: TMDBUser): string | null {
	if (user.avatar.tmdb.avatar_path) {
		return `https://image.tmdb.org/t/p/w200${user.avatar.tmdb.avatar_path}`;
	}

	if (user.avatar.gravatar.hash) {
		return `https://www.gravatar.com/avatar/${user.avatar.gravatar.hash}`;
	}

	return null;
}
