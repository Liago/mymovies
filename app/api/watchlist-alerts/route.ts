import { NextRequest, NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { checkUserAlerts, INTERACTIVE_CHECK_LIMIT, toWatchlistAlert, type AlertRow } from '@/lib/watchlist-alerts-server';

export const maxDuration = 60;

const ALERTS_LIMIT = 50;

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

async function listAlerts(tmdbId: number) {
	const supabase = createAdminClient();
	const { data, error } = await supabase
		.from('watchlist_alerts')
		.select('*')
		.eq('user_id', tmdbId)
		.order('created_at', { ascending: false })
		.limit(ALERTS_LIMIT);

	if (error) throw error;
	return ((data ?? []) as AlertRow[]).map(toWatchlistAlert);
}

// GET: elenco avvisi
export async function GET() {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ alerts: [] });
		}

		return NextResponse.json({ alerts: await listAlerts(tmdbId) });
	} catch (error) {
		console.error('Error fetching watchlist alerts:', error);
		return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
	}
}

// POST: controlla watchlist e serie seguite e restituisce gli avvisi
export async function POST() {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const fresh = await checkUserAlerts(createAdminClient(), tmdbId, { limit: INTERACTIVE_CHECK_LIMIT });

		return NextResponse.json({ fresh, alerts: await listAlerts(tmdbId) });
	} catch (error) {
		console.error('Error checking watchlist availability:', error);
		return NextResponse.json({ error: 'Failed to check availability' }, { status: 500 });
	}
}

// PATCH: segna come letti gli avvisi indicati (o tutti)
export async function PATCH(request: NextRequest) {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json().catch(() => ({}));
		const ids: number[] = Array.isArray(body.ids) ? body.ids.map(Number).filter(Number.isInteger) : [];

		const supabase = createAdminClient();
		let query = supabase
			.from('watchlist_alerts')
			.update({ read_at: new Date().toISOString() })
			.eq('user_id', tmdbId)
			.is('read_at', null);
		if (ids.length) query = query.in('id', ids);

		const { error } = await query;
		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error updating watchlist alerts:', error);
		return NextResponse.json({ error: 'Failed to update alerts' }, { status: 500 });
	}
}

// DELETE: svuota gli avvisi
export async function DELETE() {
	try {
		const tmdbId = await getAuthenticatedTmdbId();
		if (!tmdbId) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		const supabase = createAdminClient();
		const { error } = await supabase.from('watchlist_alerts').delete().eq('user_id', tmdbId);
		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error deleting watchlist alerts:', error);
		return NextResponse.json({ error: 'Failed to delete alerts' }, { status: 500 });
	}
}
