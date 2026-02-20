import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/server';

async function getAuthenticatedTmdbId() {
	const supabase = await createClient();
	const { data: { user }, error: authError } = await supabase.auth.getUser();

	if (authError || !user) {
		return null;
	}

	const { data: profile } = await supabase
		.from('profiles')
		.select('tmdb_id')
		.eq('auth_user_id', user.id)
		.single();

	return profile?.tmdb_id ?? null;
}

// GET: Fetch all tracked shows and watched episodes for the authenticated user
export async function GET() {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ watchedShows: [], watchedEpisodes: [] });
		}

		const supabase = createAdminClient();

		const [showsResult, episodesResult] = await Promise.all([
			supabase.from('tracked_shows').select('*').eq('user_id', tmdbId).order('last_updated', { ascending: false }),
			supabase.from('watched_episodes').select('*').eq('user_id', tmdbId)
		]);

		if (showsResult.error) throw showsResult.error;
		if (episodesResult.error) throw episodesResult.error;

		const watchedShows = (showsResult.data || []).map((s: any) => ({
			id: s.show_id,
			name: s.name,
			poster: s.poster_path,
			lastUpdated: new Date(s.last_updated).getTime()
		}));

		const watchedEpisodes = (episodesResult.data || []).map((e: any) =>
			`${e.show_id}:${e.season_number}:${e.episode_number}`
		);

		return NextResponse.json({ watchedShows, watchedEpisodes });
	} catch (error) {
		console.error('Error fetching tracker data:', error);
		return NextResponse.json({ error: 'Failed to fetch tracker data' }, { status: 500 });
	}
}

// POST: Track a show
export async function POST(request: NextRequest) {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { showId, name, poster } = body;

		if (!showId || !name) {
			return NextResponse.json({ error: 'Missing showId or name' }, { status: 400 });
		}

		const supabase = createAdminClient();

		const { error } = await supabase.from('tracked_shows').upsert({
			user_id: tmdbId,
			show_id: showId,
			name,
			poster_path: poster,
			last_updated: new Date().toISOString()
		}, { onConflict: 'user_id, show_id' });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error tracking show:', error);
		return NextResponse.json({ error: 'Failed to track show' }, { status: 500 });
	}
}

// DELETE: Untrack a show
export async function DELETE(request: NextRequest) {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const showId = searchParams.get('showId');

		if (!showId) {
			return NextResponse.json({ error: 'Missing showId' }, { status: 400 });
		}

		const supabase = createAdminClient();

		const { error } = await supabase.from('tracked_shows').delete().match({
			user_id: tmdbId,
			show_id: parseInt(showId)
		});

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error untracking show:', error);
		return NextResponse.json({ error: 'Failed to untrack show' }, { status: 500 });
	}
}
