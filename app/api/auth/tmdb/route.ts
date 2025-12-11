import { NextRequest, NextResponse } from 'next/server';
import { createRequestToken, getAuthorizationUrl } from '@/lib/tmdb-auth';

export async function GET(request: NextRequest) {
	try {
		// Step 1: Create a request token
		const requestToken = await createRequestToken();

		if (!requestToken) {
			return NextResponse.json(
				{ error: 'Failed to create request token' },
				{ status: 500 }
			);
		}

		// Build the callback URL
		const baseUrl = request.nextUrl.origin;
		const callbackUrl = `${baseUrl}/auth/tmdb/callback`;

		// Get the authorization URL
		const authUrl = getAuthorizationUrl(requestToken, callbackUrl);

		// Return the authorization URL for the client to redirect
		return NextResponse.json({ authUrl, requestToken });
	} catch (error) {
		console.error('Error in TMDB auth route:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
