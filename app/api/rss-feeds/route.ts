import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json([], { status: 200 });
		}

		const { data: profile } = await supabase.from('profiles').select('tmdb_id').eq('auth_user_id', user.id).single();
		if (!profile) return NextResponse.json([], { status: 200 });

		const { data, error } = await supabase
			.from('rss_feeds')
			.select('*')
			.eq('user_id', profile.tmdb_id)
			.order('added_at', { ascending: false });

		if (error) throw error;

		return NextResponse.json(data || []);
	} catch (error) {
		console.error('Error fetching RSS feeds:', error);
		return NextResponse.json({ error: 'Failed to fetch RSS feeds' }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profile } = await supabase.from('profiles').select('tmdb_id').eq('auth_user_id', user.id).single();
		if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

		const body = await request.json();
		const { name, url, description, category } = body;

		const { error } = await supabase
			.from('rss_feeds')
			.upsert({
				user_id: profile.tmdb_id,
				name,
				url,
				description,
				category
			}, { onConflict: 'user_id, url' });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error adding RSS feed:', error);
		return NextResponse.json({ error: 'Failed to add RSS feed' }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest) {
	try {
		const supabase = await createClient();
		const { data: { user } } = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { data: profile } = await supabase.from('profiles').select('tmdb_id').eq('auth_user_id', user.id).single();
		if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ error: 'Missing id' }, { status: 400 });
		}

		const { error } = await supabase
			.from('rss_feeds')
			.delete()
			.match({ id, user_id: profile.tmdb_id });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error removing RSS feed:', error);
		return NextResponse.json({ error: 'Failed to remove RSS feed' }, { status: 500 });
	}
}
