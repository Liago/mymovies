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

// POST: Toggle a single episode (mark/unmark as watched)
export async function POST(request: NextRequest) {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { showId, season, episode, isWatched, showMeta } = body;

		if (showId == null || season == null || episode == null || isWatched == null) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const supabase = createAdminClient();

		if (isWatched) {
			// Mark as watched
			const { error: epError } = await supabase.from('watched_episodes').upsert({
				user_id: tmdbId,
				show_id: showId,
				season_number: season,
				episode_number: episode
			}, { onConflict: 'user_id, show_id, season_number, episode_number' });

			if (epError) throw epError;

			// Update show metadata
			if (showMeta) {
				const { error: showError } = await supabase.from('tracked_shows').upsert({
					user_id: tmdbId,
					show_id: showId,
					name: showMeta.name,
					poster_path: showMeta.poster,
					last_updated: new Date().toISOString()
				}, { onConflict: 'user_id, show_id' });

				if (showError) throw showError;
			}
		} else {
			// Unmark as watched
			const { error } = await supabase.from('watched_episodes').delete().match({
				user_id: tmdbId,
				show_id: showId,
				season_number: season,
				episode_number: episode
			});

			if (error) throw error;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error toggling episode:', error);
		return NextResponse.json({ error: 'Failed to toggle episode' }, { status: 500 });
	}
}

// PUT: Bulk mark a season as watched
export async function PUT(request: NextRequest) {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { showId, season, episodes, showMeta } = body;

		if (!showId || season == null || !episodes?.length) {
			return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
		}

		const supabase = createAdminClient();

		const records = episodes.map((ep: number) => ({
			user_id: tmdbId,
			show_id: showId,
			season_number: season,
			episode_number: ep
		}));

		const { error: epError } = await supabase
			.from('watched_episodes')
			.upsert(records, { onConflict: 'user_id, show_id, season_number, episode_number' });

		if (epError) throw epError;

		if (showMeta) {
			const { error: showError } = await supabase.from('tracked_shows').upsert({
				user_id: tmdbId,
				show_id: showId,
				name: showMeta.name,
				poster_path: showMeta.poster,
				last_updated: new Date().toISOString()
			}, { onConflict: 'user_id, show_id' });

			if (showError) throw showError;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error bulk marking season:', error);
		return NextResponse.json({ error: 'Failed to bulk mark season' }, { status: 500 });
	}
}

// DELETE: Bulk unmark a season as watched
export async function DELETE(request: NextRequest) {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(request.url);
		const showId = searchParams.get('showId');
		const season = searchParams.get('season');
		const episodesParam = searchParams.get('episodes');

		if (!showId || !season || !episodesParam) {
			return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
		}

		const episodes = episodesParam.split(',').map(Number);
		const supabase = createAdminClient();

		for (const ep of episodes) {
			const { error } = await supabase.from('watched_episodes').delete().match({
				user_id: tmdbId,
				show_id: parseInt(showId),
				season_number: parseInt(season),
				episode_number: ep
			});

			if (error) throw error;
		}

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error bulk unmarking season:', error);
		return NextResponse.json({ error: 'Failed to bulk unmark season' }, { status: 500 });
	}
}
