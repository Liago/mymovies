import { NextResponse } from 'next/server';
import { searchMovies, MovieData } from '@/lib/omdb';

export interface SearchResult extends MovieData {
	relevance: number;
}

// Simple relevance calculation to keep UI happy
function calculateRelevance(item: MovieData, query: string): number {
	const lowerQuery = query.toLowerCase();
	const lowerTitle = item.title.toLowerCase();

	if (lowerTitle === lowerQuery) return 100;
	if (lowerTitle.startsWith(lowerQuery)) return 90;
	if (lowerTitle.includes(lowerQuery)) return 80;
	return 60;
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const query = searchParams.get('q');

	if (!query || query.trim().length === 0) {
		return NextResponse.json({ results: [] });
	}

	const movies = await searchMovies(query);

	const results: SearchResult[] = movies.map(movie => ({
		...movie,
		relevance: calculateRelevance(movie, query)
	})).sort((a, b) => b.relevance - a.relevance);

	return NextResponse.json({ results });
}
