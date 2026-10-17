import { STREAMING_SERVICES, WATCH_REGION } from './services';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/';

export type CatalogList = 'trending' | 'top-rated' | 'now-playing' | 'upcoming';
export type CatalogType = 'movie' | 'tv';

export const CATALOG_LISTS: { slug: CatalogList; label: string }[] = [
	{ slug: 'trending', label: 'Di tendenza' },
	{ slug: 'top-rated', label: 'Più votati' },
	{ slug: 'now-playing', label: 'Al cinema' },
	{ slug: 'upcoming', label: 'In uscita' },
];

export function isCatalogList(value: string): value is CatalogList {
	return CATALOG_LISTS.some((l) => l.slug === value);
}

export interface CatalogItem {
	id: number;
	title: string;
	poster: string | null;
	year: string;
	rating: number;
	type: CatalogType;
	genreIds: number[];
}

export interface CatalogPage {
	results: CatalogItem[];
	page: number;
	totalPages: number;
	totalResults: number;
}

export interface Genre {
	id: number;
	name: string;
}

/** Campi usati dei risultati TMDB (film o serie). */
interface TmdbListItem {
	id: number;
	title?: string;
	name?: string;
	poster_path?: string | null;
	release_date?: string;
	first_air_date?: string;
	vote_average?: number;
	genre_ids?: number[];
}

interface TmdbListResponse {
	results?: TmdbListItem[];
	page?: number;
	total_pages?: number;
	total_results?: number;
}

const EMPTY_PAGE: CatalogPage = { results: [], page: 1, totalPages: 0, totalResults: 0 };

function regionOf(language: string): string {
	return language.split('-')[1] || WATCH_REGION;
}

function isoDay(offsetDays = 0): string {
	const d = new Date();
	d.setDate(d.getDate() + offsetDays);
	return d.toISOString().slice(0, 10);
}

function mapItem(item: TmdbListItem, type: CatalogType): CatalogItem {
	return {
		id: item.id,
		title: item.title || item.name || '',
		poster: item.poster_path ? `${IMG}w500${item.poster_path}` : null,
		year: (item.release_date || item.first_air_date || '').split('-')[0],
		rating: item.vote_average || 0,
		type,
		genreIds: item.genre_ids || [],
	};
}

/**
 * Endpoint TMDB per una combinazione lista/tipo/genere. Senza genere si usano
 * gli endpoint nativi (stessi risultati di prima); con il genere si passa a
 * /discover con parametri equivalenti.
 */
function catalogPath(list: CatalogList, type: CatalogType, genre: number | null, language: string): string {
	const region = regionOf(language);
	const discover = (params: Record<string, string>) => {
		const q = new URLSearchParams({ sort_by: 'popularity.desc', ...params });
		if (genre) q.set('with_genres', String(genre));
		return `/discover/${type}?${q.toString()}`;
	};

	switch (list) {
		case 'trending':
			return genre ? discover({}) : `/trending/${type}/week?`;
		case 'top-rated':
			return genre
				? discover({ sort_by: 'vote_average.desc', 'vote_count.gte': '300' })
				: `/${type}/top_rated?`;
		case 'now-playing':
			if (type === 'movie') {
				return genre
					? discover({
						region,
						with_release_type: '2|3',
						'release_date.gte': isoDay(-42),
						'release_date.lte': isoDay(0),
					})
					: `/movie/now_playing?region=${region}`;
			}
			return genre ? discover({ 'air_date.gte': isoDay(0), 'air_date.lte': isoDay(7) }) : '/tv/on_the_air?';
		case 'upcoming':
			if (type === 'movie') {
				return genre
					? discover({ region, with_release_type: '2|3', 'release_date.gte': isoDay(1) })
					: `/movie/upcoming?region=${region}`;
			}
			return discover({ 'first_air_date.gte': isoDay(1) });
	}
}

export async function getCatalog(
	list: CatalogList,
	type: CatalogType,
	genre: number | null,
	page: number = 1,
	language: string = 'it-IT'
): Promise<CatalogPage> {
	if (!TMDB_API_KEY) return EMPTY_PAGE;
	try {
		const path = catalogPath(list, type, genre, language);
		const sep = path.endsWith('?') ? '' : '&';
		const res = await fetch(
			`${BASE_URL}${path}${sep}api_key=${TMDB_API_KEY}&language=${language}&page=${page}`,
			{ next: { revalidate: 1800 } }
		);
		if (!res.ok) return EMPTY_PAGE;
		const data: TmdbListResponse = await res.json();
		return {
			results: (data.results || []).map((item) => mapItem(item, type)),
			page: data.page || page,
			totalPages: Math.min(data.total_pages || 0, 500),
			totalResults: data.total_results || 0,
		};
	} catch (e) {
		console.error('Error in getCatalog:', e);
		return EMPTY_PAGE;
	}
}

export async function getGenres(type: CatalogType, language: string = 'it-IT'): Promise<Genre[]> {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${TMDB_API_KEY}&language=${language}`, {
			next: { revalidate: 86400 },
		});
		const data = await res.json();
		return data.genres || [];
	} catch {
		return [];
	}
}

export interface StreamingPick extends CatalogItem {
	service: string;
	serviceSlug: string;
}

/**
 * Titoli popolari inclusi negli abbonamenti dei servizi principali
 * (TMDB discover filtrato per watch provider, regione IT).
 */
export async function getStreamingPicks(language: string = 'it-IT', perService: number = 4): Promise<StreamingPick[]> {
	if (!TMDB_API_KEY) return [];
	const region = regionOf(language);

	const fetchFor = async (providerId: number, type: CatalogType) => {
		try {
			const q = new URLSearchParams({
				api_key: TMDB_API_KEY,
				language,
				watch_region: region,
				with_watch_providers: String(providerId),
				with_watch_monetization_types: 'flatrate',
				sort_by: 'popularity.desc',
				'vote_count.gte': '50',
			});
			const res = await fetch(`${BASE_URL}/discover/${type}?${q.toString()}`, { next: { revalidate: 3600 } });
			if (!res.ok) return [];
			const data: TmdbListResponse = await res.json();
			return (data.results || []).map((item) => mapItem(item, type));
		} catch {
			return [];
		}
	};

	const perProvider = await Promise.all(
		STREAMING_SERVICES.map(async (svc) => {
			const [movies, shows] = await Promise.all([fetchFor(svc.providerId, 'movie'), fetchFor(svc.providerId, 'tv')]);
			// Alterna film e serie per avere una riga varia
			const mixed: CatalogItem[] = [];
			for (let i = 0; mixed.length < perService && (i < movies.length || i < shows.length); i++) {
				if (shows[i]) mixed.push(shows[i]);
				if (movies[i] && mixed.length < perService) mixed.push(movies[i]);
			}
			return mixed.map((item) => ({ ...item, service: svc.name, serviceSlug: svc.slug }));
		})
	);

	// Interleave tra servizi, senza duplicati
	const seen = new Set<string>();
	const out: StreamingPick[] = [];
	for (let i = 0; i < perService; i++) {
		for (const list of perProvider) {
			const item = list[i];
			if (!item) continue;
			const key = `${item.type}:${item.id}`;
			if (seen.has(key)) continue;
			seen.add(key);
			out.push(item);
		}
	}
	return out;
}
