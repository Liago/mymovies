import 'server-only';

// Dati delle candidature agli Oscar: dataset pubblico su GitHub, in cache per 24 ore

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

const CACHE_DURATION = 24 * 60 * 60 * 1000;

let cacheTimestamp = 0;
let imdbIndex: Map<string, OscarNomination[]> | null = null;
let tmdbIndex: Map<number, OscarNomination[]> | null = null;
let pending: Promise<void> | null = null;

function buildIndexes(data: OscarNomination[]): void {
	const byImdb = new Map<string, OscarNomination[]>();
	const byTmdb = new Map<number, OscarNomination[]>();

	for (const nomination of data) {
		for (const movie of nomination.movies) {
			if (movie.imdb_id) byImdb.set(movie.imdb_id, [...(byImdb.get(movie.imdb_id) ?? []), nomination]);
			if (movie.tmdb_id) byTmdb.set(movie.tmdb_id, [...(byTmdb.get(movie.tmdb_id) ?? []), nomination]);
		}
	}

	imdbIndex = byImdb;
	tmdbIndex = byTmdb;
}

async function ensureLoaded(): Promise<void> {
	if (imdbIndex && Date.now() - cacheTimestamp < CACHE_DURATION) return;
	// Richieste concorrenti condividono lo stesso download
	pending ??= (async () => {
		try {
			const response = await fetch(OSCAR_DATA_URL, { next: { revalidate: 86400 } });
			if (!response.ok) throw new Error(`Risposta ${response.status}`);
			const data = (await response.json()) as OscarNomination[];
			buildIndexes(data);
			cacheTimestamp = Date.now();
		} catch (error) {
			// In caso di errore teniamo l'indice precedente, anche se scaduto
			console.error('[Oscar Awards] Errore nel recupero dei dati:', error);
		} finally {
			pending = null;
		}
	})();
	await pending;
}

/** Candidature (vinte e non) di un film, cercate per id IMDb e in alternativa per id TMDB. */
export async function getOscarNominations({ imdbId, tmdbId }: { imdbId: string | null; tmdbId: number | null }): Promise<OscarNomination[]> {
	await ensureLoaded();
	const byImdb = imdbId ? imdbIndex?.get(imdbId) : undefined;
	if (byImdb?.length) return byImdb;
	return (tmdbId ? tmdbIndex?.get(tmdbId) : undefined) ?? [];
}
