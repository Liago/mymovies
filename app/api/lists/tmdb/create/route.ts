import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createTMDBList } from '@/lib/tmdb-user-lists';

export async function POST(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const sessionId = cookieStore.get('tmdb_session_id')?.value;

		if (!sessionId) {
			return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		}

		const { name, description } = await request.json();

		const result = await createTMDBList(sessionId, name, description);

		if (!result.success) {
			return NextResponse.json({ error: 'Failed to create TMDB list' }, { status: 500 });
		}

		return NextResponse.json({ success: true, list_id: result.list_id });
	} catch (error) {
		console.error('[API /lists/tmdb/create] Error:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
