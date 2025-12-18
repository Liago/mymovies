import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
	try {
		const supabase = await createClient();

		const { data: { user }, error: authError } = await supabase.auth.getUser();

		if (authError || !user) {
			return NextResponse.json([], { status: 200 });
		}

		const { data: profile } = await supabase
			.from('profiles')
			.select('tmdb_id')
			.eq('auth_user_id', user.id)
			.single();

		if (!profile) {
			return NextResponse.json([], { status: 200 });
		}

		const { data, error } = await supabase
			.from('ratings')
			.select('*')
			.eq('user_id', profile.tmdb_id)
			.order('rated_at', { ascending: false });

		if (error) throw error;

		const ratings = (data || []).map(item => ({
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
		const { id, media_type, title, poster, rating } = body;

		const { error } = await supabase
			.from('ratings')
			.upsert({
				user_id: profile.tmdb_id,
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

		const { error } = await supabase
			.from('ratings')
			.delete()
			.match({ user_id: profile.tmdb_id, media_id: parseInt(id), media_type: type });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting rating:', error);
		return NextResponse.json({ error: 'Failed to delete rating' }, { status: 500 });
	}
}
