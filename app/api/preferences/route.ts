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

// GET: Fetch user preferences
export async function GET() {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ preferences: {} });
		}

		const supabase = createAdminClient();
		const { data, error } = await supabase
			.from('user_preferences')
			.select('*')
			.eq('user_id', tmdbId)
			.single();

		// It's normal for no preferences to exist yet
		if (error && error.code !== 'PGRST116') {
			throw error;
		}

		return NextResponse.json({ preferences: data || {} });
	} catch (error) {
		console.error('Error fetching user preferences:', error);
		return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
	}
}

// POST: Update user preferences
export async function POST(request: NextRequest) {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const supabase = createAdminClient();

		const { error } = await supabase.from('user_preferences').upsert({
			user_id: tmdbId,
			...body,
			updated_at: new Date().toISOString()
		}, { onConflict: 'user_id' });

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating user preferences:', error);
		return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
	}
}
