// Oscar Awards Data Module
// Fetches and caches Oscar nomination data from GitHub

const OSCAR_DATA_URL = 'https://raw.githubusercontent.com/delventhalz/json-nominations/main/oscar-nominations.json';

export interface OscarNomination {
	category: string;
	year: string;
	nominees: string[];
	movies: Array<{
		title: string;
		tmdb_id: number | null;
		imdb_id: string | null;
	}>;
	won: boolean;
}

export interface MovieAward {
	category: string;
	year: string;
	nominees: string[];
	won: boolean;
}

export interface MovieAwardsData {
	oscarWins: MovieAward[];
	oscarNominations: MovieAward[];
	totalOscarWins: number;
	totalOscarNominations: number;
}

// In-memory cache for Oscar data
let oscarDataCache: OscarNomination[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Index for faster lookups
let imdbIndex: Map<string, OscarNomination[]> | null = null;
let tmdbIndex: Map<number, OscarNomination[]> | null = null;

async function fetchOscarData(): Promise<OscarNomination[]> {
	const now = Date.now();

	// Return cached data if still valid
	if (oscarDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
		return oscarDataCache;
	}

	try {
		console.log('[Oscar Awards] Fetching Oscar data from GitHub...');
		const response = await fetch(OSCAR_DATA_URL, {
			next: { revalidate: 86400 } // Cache for 24 hours
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch Oscar data: ${response.status}`);
		}

		const data = await response.json();
		oscarDataCache = data;
		cacheTimestamp = now;

		// Build indexes
		buildIndexes(data);

		console.log(`[Oscar Awards] Loaded ${data.length} nominations`);
		return data;
	} catch (error) {
		console.error('[Oscar Awards] Error fetching data:', error);
		// Return cached data if available, even if stale
		if (oscarDataCache) {
			return oscarDataCache;
		}
		return [];
	}
}

function buildIndexes(data: OscarNomination[]): void {
	imdbIndex = new Map();
	tmdbIndex = new Map();

	for (const nomination of data) {
		for (const movie of nomination.movies) {
			if (movie.imdb_id) {
				const existing = imdbIndex.get(movie.imdb_id) || [];
				existing.push(nomination);
				imdbIndex.set(movie.imdb_id, existing);
			}
			if (movie.tmdb_id) {
				const existing = tmdbIndex.get(movie.tmdb_id) || [];
				existing.push(nomination);
				tmdbIndex.set(movie.tmdb_id, existing);
			}
		}
	}
}

export async function getOscarAwardsByImdbId(imdbId: string): Promise<MovieAwardsData> {
	await fetchOscarData();

	if (!imdbIndex) {
		return {
			oscarWins: [],
			oscarNominations: [],
			totalOscarWins: 0,
			totalOscarNominations: 0
		};
	}

	const nominations = imdbIndex.get(imdbId) || [];
	return processNominations(nominations);
}

export async function getOscarAwardsByTmdbId(tmdbId: number): Promise<MovieAwardsData> {
	await fetchOscarData();

	if (!tmdbIndex) {
		return {
			oscarWins: [],
			oscarNominations: [],
			totalOscarWins: 0,
			totalOscarNominations: 0
		};
	}

	const nominations = tmdbIndex.get(tmdbId) || [];
	return processNominations(nominations);
}

function processNominations(nominations: OscarNomination[]): MovieAwardsData {
	const wins: MovieAward[] = [];
	const noms: MovieAward[] = [];

	for (const nom of nominations) {
		const award: MovieAward = {
			category: nom.category,
			year: nom.year,
			nominees: nom.nominees,
			won: nom.won
		};

		if (nom.won) {
			wins.push(award);
		} else {
			noms.push(award);
		}
	}

	// Sort by year (most recent first)
	const sortByYear = (a: MovieAward, b: MovieAward) => {
		const yearA = parseInt(a.year.split('/')[0]);
		const yearB = parseInt(b.year.split('/')[0]);
		return yearB - yearA;
	};

	wins.sort(sortByYear);
	noms.sort(sortByYear);

	return {
		oscarWins: wins,
		oscarNominations: noms,
		totalOscarWins: wins.length,
		totalOscarNominations: wins.length + noms.length
	};
}

// Category display names (translate to more readable format)
export const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
	'PICTURE': 'Best Picture',
	'BEST PICTURE': 'Best Picture',
	'DIRECTING': 'Best Director',
	'BEST DIRECTOR': 'Best Director',
	'ACTOR IN A LEADING ROLE': 'Best Actor',
	'ACTRESS IN A LEADING ROLE': 'Best Actress',
	'ACTOR IN A SUPPORTING ROLE': 'Best Supporting Actor',
	'ACTRESS IN A SUPPORTING ROLE': 'Best Supporting Actress',
	'WRITING (ORIGINAL SCREENPLAY)': 'Best Original Screenplay',
	'WRITING (ADAPTED SCREENPLAY)': 'Best Adapted Screenplay',
	'CINEMATOGRAPHY': 'Best Cinematography',
	'FILM EDITING': 'Best Film Editing',
	'MUSIC (ORIGINAL SCORE)': 'Best Original Score',
	'MUSIC (ORIGINAL SONG)': 'Best Original Song',
	'SOUND': 'Best Sound',
	'SOUND EDITING': 'Best Sound Editing',
	'SOUND MIXING': 'Best Sound Mixing',
	'PRODUCTION DESIGN': 'Best Production Design',
	'COSTUME DESIGN': 'Best Costume Design',
	'MAKEUP AND HAIRSTYLING': 'Best Makeup and Hairstyling',
	'VISUAL EFFECTS': 'Best Visual Effects',
	'ANIMATED FEATURE FILM': 'Best Animated Feature',
	'INTERNATIONAL FEATURE FILM': 'Best International Feature',
	'DOCUMENTARY (FEATURE)': 'Best Documentary Feature',
	'DOCUMENTARY (SHORT SUBJECT)': 'Best Documentary Short',
	'SHORT FILM (ANIMATED)': 'Best Animated Short',
	'SHORT FILM (LIVE ACTION)': 'Best Live Action Short'
};

export function getDisplayCategory(category: string): string {
	const upperCategory = category.toUpperCase();
	return CATEGORY_DISPLAY_NAMES[upperCategory] || category;
}
