import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/tmdb-auth';

export async function POST(request: NextRequest) {
	try {
		// Get session ID from cookie
		const sessionId = request.cookies.get('tmdb_session_id')?.value;

		if (sessionId) {
			// Delete session from TMDB
			await deleteSession(sessionId);
		}

		// Create response
		const response = NextResponse.json({ success: true });

		// Clear cookies
		response.cookies.delete('tmdb_session_id');
		response.cookies.delete('tmdb_user');

		return response;
	} catch (error) {
		console.error('Error in logout:', error);
		return NextResponse.json(
			{ error: 'Failed to logout' },
			{ status: 500 }
		);
	}
}
