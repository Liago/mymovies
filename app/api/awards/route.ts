import { NextResponse } from 'next/server';
import { getOscarAwardsByImdbId, getOscarAwardsByTmdbId } from '@/lib/oscar-awards';

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const imdbId = searchParams.get('imdb_id');
	const tmdbId = searchParams.get('tmdb_id');

	if (!imdbId && !tmdbId) {
		return NextResponse.json(
			{ error: 'Either imdb_id or tmdb_id is required' },
			{ status: 400 }
		);
	}

	try {
		let awards;

		if (imdbId) {
			awards = await getOscarAwardsByImdbId(imdbId);
		} else if (tmdbId) {
			awards = await getOscarAwardsByTmdbId(parseInt(tmdbId));
		}

		return NextResponse.json(awards);
	} catch (error) {
		console.error('[Awards API] Error:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch awards data' },
			{ status: 500 }
		);
	}
}
