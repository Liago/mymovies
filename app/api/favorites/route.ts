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
			.from('favorites')
			.select('*')
			.eq('user_id', user.id)
			.order('added_at', { ascending: false });

		if (error) throw error;

		const favorites = data.map(item => ({
			id: item.media_id,
			media_type: item.media_type,
			title: item.title,
			poster: item.poster_path
		}));

		return NextResponse.json(favorites);
	} catch (error) {
		console.error('Error fetching favorites:', error);
		return NextResponse.json({ error: 'Failed to fetch favorites' }, { status: 500 });
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
		const { id, media_type, title, poster } = body;

		const supabase = createAdminClient();

		const { error } = await supabase
			.from('favorites')
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
		console.error('Error adding favorite:', error);
		return NextResponse.json({ error: 'Failed to add favorite' }, { status: 500 });
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
			.from('favorites')
			.delete()
			.match({ user_id: user.id, media_id: parseInt(id), media_type: type });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing favorite:', error);
		return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
	}
}
