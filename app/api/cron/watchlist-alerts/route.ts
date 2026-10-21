import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { checkWatchlistAvailability } from '@/lib/watchlist-alerts-server';

export const maxDuration = 300;

/**
 * Controllo periodico (Vercel Cron) della disponibilità per tutte le watchlist,
 * così gli avvisi sono pronti anche per chi non apre l'app da giorni.
 * Protetto da `CRON_SECRET` (Vercel lo invia come header Authorization).
 */
export async function GET(request: NextRequest) {
	const secret = process.env.CRON_SECRET;
	if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const supabase = createAdminClient();
		const { data, error } = await supabase.from('watchlist').select('user_id');
		if (error) throw error;

		const userIds = [...new Set(((data ?? []) as { user_id: number | null }[]).map((r) => r.user_id).filter((id): id is number => id !== null))];

		let alerts = 0;
		let failures = 0;
		for (const userId of userIds) {
			try {
				alerts += (await checkWatchlistAvailability(supabase, userId)).length;
			} catch (e) {
				failures++;
				console.error(`Error checking watchlist availability for user ${userId}:`, e);
			}
		}

		return NextResponse.json({ users: userIds.length, alerts, failures });
	} catch (error) {
		console.error('Error running watchlist availability cron:', error);
		return NextResponse.json({ error: 'Cron failed' }, { status: 500 });
	}
}
