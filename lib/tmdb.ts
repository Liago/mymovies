const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function getMovieTrailer(imdbId: string): Promise<string | null> {
	if (!TMDB_API_KEY) {
		console.warn('TMDB_API_KEY is not set');
		return null;
	}

	try {
		// 1. Find TMDb ID from IMDb ID
		const findResponse = await fetch(
			`${BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id`
		);
		const findData = await findResponse.json();

		const movie = findData.movie_results?.[0];
		const tv = findData.tv_results?.[0];
		const item = movie || tv;

		if (!item) return null;

		const type = movie ? 'movie' : 'tv';
		const tmdbId = item.id;

		// 2. Get Videos
		const videosResponse = await fetch(
			`${BASE_URL}/${type}/${tmdbId}/videos?api_key=${TMDB_API_KEY}`
		);
		const videosData = await videosResponse.json();

		const trailer = videosData.results?.find(
			(v: any) => v.site === 'YouTube' && v.type === 'Trailer'
		);

		if (trailer) {
			return `https://www.youtube.com/watch?v=${trailer.key}`;
		}

		return null;
	} catch (error) {
		console.error('Error fetching trailer:', error);
		return null;
	}
}
