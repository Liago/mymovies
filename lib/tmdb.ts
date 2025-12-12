const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export async function getMovieTrailer(imdbId: string): Promise<string | null> {
	if (!TMDB_API_KEY) {
		console.warn('TMDB_API_KEY is not set');
		return null;
	}

	try {
		// Find is external ID search, usually language independent or fixed
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

		const videosResponse = await fetch(
			`${BASE_URL}/${type}/${tmdbId}/videos?api_key=${TMDB_API_KEY}` // Videos often have iso_639_1 but default is usually fine for trailers
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

export async function getPersonDetails(name: string, language: string = 'en-US') {
	if (!TMDB_API_KEY) return null;
	try {
		const searchRes = await fetch(`${BASE_URL}/search/person?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(name)}&language=${language}`);
		const searchData = await searchRes.json();
		const person = searchData.results?.[0];

		if (!person) return null;

		return {
			id: person.id,
			name: person.name,
			image: person.profile_path ? `https://image.tmdb.org/t/p/w200${person.profile_path}` : null
		};
	} catch (e) {
		console.error('Error fetching person:', e);
		return null;
	}
}

export async function getPersonCredits(personId: number, language: string = 'en-US') {
	if (!TMDB_API_KEY) return [];
	try {
		const creditsRes = await fetch(`${BASE_URL}/person/${personId}/combined_credits?api_key=${TMDB_API_KEY}&language=${language}`);
		const creditsData = await creditsRes.json();

		return creditsData.cast
			?.sort((a: any, b: any) => b.popularity - a.popularity)
			.slice(0, 10)
			.map((item: any) => ({
				id: item.id,
				title: item.title || item.name,
				poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
				year: (item.release_date || item.first_air_date || '').split('-')[0],
				type: item.media_type
			})) || [];
	} catch (e) {
		console.error('Error fetching credits:', e);
		return [];
	}
}

export async function getDiscoverMovies(page: number = 1, language: string = 'en-US') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}&language=${language}`);
		const data = await res.json();
		return data.results.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		}));
	} catch (e) {
		return [];
	}
}

export async function getTVShows(page: number = 1, language: string = 'en-US') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}&language=${language}`);
		const data = await res.json();
		return data.results.map((item: any) => ({
			id: item.id,
			title: item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'tv'
		}));
	} catch (e) {
		return [];
	}
}

export async function getUpcomingMovies(page: number = 1, language: string = 'en-US') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=${language}&page=${page}`);
		const data = await res.json();
		return data.results.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		}));
	} catch (e) {
		return [];
	}
}

export async function getMovieDetailTMDb(id: number, language: string = 'en-US') {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=${language}`);
		const data = await res.json();

		return {
			title: data.title,
			description: data.overview,
			poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
			releaseDate: data.release_date,
			duration: `${data.runtime} min`,
			rating: {
				imdb: data.vote_average,
				rottenTomatoes: Math.round(data.vote_average * 10)
			},
			actors: data.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [],
			director: data.credits?.crew?.find((c: any) => c.job === 'Director')?.name || 'N/A',
			boxOffice: 'N/A'
		};
	} catch (e) {
		console.error('Error fetching TMDb movie detail:', e);
		return null;
	}
}

export async function getMovieTrailerTMDb(id: number, language: string = 'en-US'): Promise<string | null> {
	if (!TMDB_API_KEY) return null;
	try {
		// Try to get trailer in specific language, fallback to English if not found?
		// TMDb usually filters strictly by language if provided.
		// We might want to try language first, then fallback to no language (defaults to all/en)?
		let videosResponse = await fetch(
			`${BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}&language=${language}`
		);
		let videosData = await videosResponse.json();

		// If no results and language was specific (e.g. it-IT), try default (en-US usually) or no language param
		if ((!videosData.results || videosData.results.length === 0) && language !== 'en-US') {
			videosResponse = await fetch(
				`${BASE_URL}/movie/${id}/videos?api_key=${TMDB_API_KEY}`
			);
			videosData = await videosResponse.json();
		}

		const trailer = videosData.results?.find(
			(v: any) => v.site === 'YouTube' && v.type === 'Trailer'
		);

		if (trailer) {
			return `https://www.youtube.com/watch?v=${trailer.key}`;
		}

		return null;
	} catch (error) {
		console.error('Error fetching TMDb trailer:', error);
		return null;
	}
}

export async function getTVDetailTMDb(id: number, language: string = 'en-US') {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=${language}`);
		const data = await res.json();

		return {
			title: data.name,
			description: data.overview,
			poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
			releaseDate: data.first_air_date,
			seasons: data.number_of_seasons,
			episodes: data.number_of_episodes,
			status: data.status,
			rating: {
				imdb: data.vote_average,
				rottenTomatoes: Math.round(data.vote_average * 10)
			},
			actors: data.credits?.cast?.slice(0, 8).map((c: any) => c.name) || [],
			creators: data.created_by?.map((c: any) => c.name).join(', ') || 'N/A',
			genres: data.genres?.map((g: any) => g.name) || []
		};
	} catch (e) {
		console.error('Error fetching TMDb TV detail:', e);
		return null;
	}
}

export async function getTVTrailerTMDb(id: number, language: string = 'en-US'): Promise<string | null> {
	if (!TMDB_API_KEY) return null;
	try {
		let videosResponse = await fetch(
			`${BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}&language=${language}`
		);
		let videosData = await videosResponse.json();

		if ((!videosData.results || videosData.results.length === 0) && language !== 'en-US') {
			videosResponse = await fetch(
				`${BASE_URL}/tv/${id}/videos?api_key=${TMDB_API_KEY}`
			);
			videosData = await videosResponse.json();
		}

		const trailer = videosData.results?.find(
			(v: any) => v.site === 'YouTube' && v.type === 'Trailer'
		);

		if (trailer) {
			return `https://www.youtube.com/watch?v=${trailer.key}`;
		}

		return null;
	} catch (error) {
		console.error('Error fetching TMDb TV trailer:', error);
		return null;
	}
}
