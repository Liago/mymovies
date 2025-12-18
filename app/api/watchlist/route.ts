import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
	try {
		const cookieStore = await cookies();
		const userCookie = cookieStore.get('tmdb_user');

		if (!userCookie) {
			return NextResponse.json([], { status: 200 });
		}

		const user = JSON.parse(userCookie.value);
		const supabase = createAdminClient();

		const { data, error } = await supabase
			.from('watchlist')
			.select('*')
			.eq('user_id', user.id)
			.order('added_at', { ascending: false });

		if (error) throw error;

		const watchlist = data.map(item => ({
			id: item.media_id,
			media_type: item.media_type,
			title: item.title,
			poster: item.poster_path
		}));

		return NextResponse.json(watchlist);
	} catch (error) {
		console.error('Error fetching watchlist:', error);
		return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const userCookie = cookieStore.get('tmdb_user');

		if (!userCookie) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = JSON.parse(userCookie.value);
		const body = await request.json();
		const { id, media_type, title, poster } = body;

		const supabase = createAdminClient();

		const { error } = await supabase
			.from('watchlist')
			.upsert({
				user_id: user.id,
				media_id: id,
				media_type,
				title,
				poster_path: poster
			}, { onConflict: 'user_id, media_id, media_type' });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error adding to watchlist:', error);
		return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const cookieStore = await cookies();
		const userCookie = cookieStore.get('tmdb_user');

		if (!userCookie) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = JSON.parse(userCookie.value);
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		const type = searchParams.get('type');

		if (!id || !type) {
			return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
		}

		const supabase = createAdminClient();

		const { error } = await supabase
			.from('watchlist')
			.delete()
			.match({ user_id: user.id, media_id: parseInt(id), media_type: type });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing from watchlist:', error);
		return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
	}
}
