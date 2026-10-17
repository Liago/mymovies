import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { searchMulti } from '@/lib/tmdb';

export interface SearchResult {
	id: number | string;
	title: string;
	type: 'movie' | 'tv' | 'person';
	poster: string | null;
	year: string;
	rating?: number;
	description?: string;
	/** Riga secondaria già pronta per la UI ("2024 · ★ 8.5", "Regista"). */
	subtitle: string;
	relevance: number;
}

const DEPARTMENTS: Record<string, string> = {
	Acting: 'Recitazione',
	Directing: 'Regia',
	Writing: 'Sceneggiatura',
	Production: 'Produzione',
	Sound: 'Musiche',
	Camera: 'Fotografia',
	Editing: 'Montaggio',
	Art: 'Scenografia',
	'Costume & Make-Up': 'Costumi e trucco',
	Crew: 'Troupe',
	'Visual Effects': 'Effetti visivi',
};

/** Risultato di `searchMulti` (titolo o persona). */
interface SearchItem {
	id: number;
	title: string;
	type: 'movie' | 'tv' | 'person';
	poster: string | null;
	year?: string;
	rating?: number;
	overview?: string;
	knownFor?: string;
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

	const cookieStore = await cookies();
	const cookieLang = cookieStore.get('app_language')?.value;
	const lang = cookieLang === 'en-US' ? 'en-US' : 'it-IT';

	const items: SearchItem[] = await searchMulti(query, 1, lang);

	const results: SearchResult[] = items
		.filter((item) => item.type === 'movie' || item.type === 'tv' || item.type === 'person')
		.map((item): SearchResult => {
			if (item.type === 'person') {
				return {
					id: item.id,
					title: item.title,
					type: 'person' as const,
					poster: item.poster ? item.poster.replace('/w500/', '/w185/') : null,
					year: '',
					subtitle: (item.knownFor && DEPARTMENTS[item.knownFor]) || item.knownFor || 'Persona',
					relevance: calculateRelevance(item.title, query),
				};
			}
			const rating = typeof item.rating === 'number' && item.rating > 0 ? `★ ${item.rating.toFixed(1)}` : null;
			return {
				id: item.id,
				title: item.title,
				type: item.type,
				poster: item.poster ? item.poster.replace('/w500/', '/w185/') : null,
				year: item.year || '',
				rating: item.rating,
				description: item.overview,
				subtitle: [item.year, rating].filter(Boolean).join(' · ') || (item.type === 'tv' ? 'Serie TV' : 'Film'),
				relevance: calculateRelevance(item.title, query),
			};
		})
		.sort((a: SearchResult, b: SearchResult) => b.relevance - a.relevance);

	return NextResponse.json({ results });
}
