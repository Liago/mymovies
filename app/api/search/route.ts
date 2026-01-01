import { NextResponse } from 'next/server';
import { searchMulti } from '@/lib/tmdb';

export interface SearchResult {
	id: number | string;
	title: string;
	type: 'movie' | 'tv' | 'person';
	poster: string | null;
	year: string;
	rating?: number;
	description?: string;
	relevance: number;
}

function calculateRelevance(title: string, query: string): number {
	const lowerQuery = query.toLowerCase();
	const lowerTitle = title.toLowerCase();

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

	const items = await searchMulti(query);

	const results: SearchResult[] = items
		.filter((item: any) => item.type === 'movie' || item.type === 'tv')
		.map((item: any) => ({
			id: item.id,
			title: item.title,
			type: item.type,
			poster: item.poster,
			year: item.year || '',
			rating: item.rating,
			description: item.overview,
			relevance: calculateRelevance(item.title, query)
		}))
		.sort((a: SearchResult, b: SearchResult) => b.relevance - a.relevance);

	return NextResponse.json({ results });
}
