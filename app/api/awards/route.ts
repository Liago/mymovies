import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getAwardsDetail } from '@/lib/awards';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const imdbId = searchParams.get('imdb_id');
	const tmdbParam = searchParams.get('tmdb_id');
	const mediaType = searchParams.get('type') === 'tv' ? 'tv' : 'movie';

	const tmdbId = tmdbParam && /^\d+$/.test(tmdbParam) ? parseInt(tmdbParam, 10) : null;
	const validImdb = imdbId && /^tt\d+$/.test(imdbId) ? imdbId : null;

	if (!validImdb && !tmdbId) {
		return NextResponse.json({ error: 'È richiesto imdb_id o tmdb_id' }, { status: 400 });
	}

	try {
		const language = (await cookies()).get('app_language')?.value || 'it-IT';
		const detail = await getAwardsDetail({ mediaType, tmdbId, imdbId: validImdb, language });
		return NextResponse.json(detail, {
			headers: { 'Cache-Control': 'private, max-age=3600' },
		});
	} catch (error) {
		console.error('[Awards API] Errore:', error);
		return NextResponse.json({ error: 'Impossibile recuperare i premi' }, { status: 500 });
	}
}
