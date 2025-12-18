import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
	try {
		const supabase = await createClient();

		// Get authenticated user
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json([], { status: 200 }); // Return empty for guests
		}

		// Get user's TMDB ID from profile
		const { data: profile } = await supabase
			.from('profiles')
			.select('tmdb_id')
			.eq('auth_user_id', user.id)
			.single();

		if (!profile) {
			return NextResponse.json([], { status: 200 });
		}

		// RLS will automatically filter to only this user's favorites
		const { data, error } = await supabase
			.from('favorites')
			.select('*')
			.eq('user_id', profile.tmdb_id)
			.order('added_at', { ascending: false });

		if (error) throw error;

		const favorites = (data || []).map(item => ({
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
		const supabase = await createClient();
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('tmdb_id')
			.eq('auth_user_id', user.id)
			.single();

		if (!profile) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		const body = await request.json();
		const { id, media_type, title, poster } = body;

		// RLS will automatically enforce user can only insert their own data
		const { error } = await supabase
			.from('favorites')
			.upsert({
				user_id: profile.tmdb_id,
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
		const supabase = await createClient();
		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('tmdb_id')
			.eq('auth_user_id', user.id)
			.single();

		if (!profile) {
			return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
		}

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		const type = searchParams.get('type');

		if (!id || !type) {
			return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
		}

		// RLS ensures user can only delete their own data
		const { error } = await supabase
			.from('favorites')
			.delete()
			.match({ user_id: profile.tmdb_id, media_id: parseInt(id), media_type: type });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing favorite:', error);
		return NextResponse.json({ error: 'Failed to remove favorite' }, { status: 500 });
	}
}
