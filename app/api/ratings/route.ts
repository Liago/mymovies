import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET() {
	try {
		const cookieStore = cookies();
		const userCookie = cookieStore.get('tmdb_user');

		if (!userCookie) {
			return NextResponse.json([], { status: 200 });
		}

		const user = JSON.parse(userCookie.value);
		const supabase = createAdminClient();

		const { data, error } = await supabase
			.from('ratings')
			.select('*')
			.eq('user_id', user.id)
			.order('rated_at', { ascending: false });

		if (error) throw error;

		const ratings = data.map(item => ({
			id: item.media_id,
			media_type: item.media_type,
			title: item.title,
			poster: item.poster_path,
			rating: parseFloat(item.rating)
		}));

		return NextResponse.json(ratings);
	} catch (error) {
		console.error('Error fetching ratings:', error);
		return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const cookieStore = cookies();
		const userCookie = cookieStore.get('tmdb_user');

		if (!userCookie) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const user = JSON.parse(userCookie.value);
		const body = await request.json();
		const { id, media_type, title, poster, rating } = body;

		const supabase = createAdminClient();

		const { error } = await supabase
			.from('ratings')
			.upsert({
				user_id: user.id,
				media_id: id,
				media_type,
				title,
				poster_path: poster,
				rating
			}, { onConflict: 'user_id, media_id, media_type' });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error rating media:', error);
		return NextResponse.json({ error: 'Failed to rate media' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const cookieStore = cookies();
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
			.from('ratings')
			.delete()
			.match({ user_id: user.id, media_id: parseInt(id), media_type: type });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting rating:', error);
		return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 });
	}
}
