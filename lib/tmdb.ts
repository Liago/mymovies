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

export async function getPersonDetails(name: string, language: string = 'it-IT') {
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

export async function getPersonCredits(personId: number, language: string = 'it-IT') {
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

export async function getPersonDetailsById(personId: number, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(
			`${BASE_URL}/person/${personId}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits,external_ids&language=${language}`
		);
		const data = await res.json();

		// Process combined credits - filter only movies and TV shows
		const knownFor = data.combined_credits?.cast
			?.filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
			.sort((a: any, b: any) => b.popularity - a.popularity)
			.slice(0, 100)
			.map((item: any) => ({
				id: item.id,
				title: item.title || item.name,
				poster: item.poster_path ? `https://image.tmdb.org/t/p/w300${item.poster_path}` : null,
				year: (item.release_date || item.first_air_date || '').split('-')[0],
				type: item.media_type,
				character: item.character || item.job || 'N/A',
				voteAverage: item.vote_average
			})) || [];

		return {
			id: data.id,
			name: data.name,
			biography: data.biography || 'Biography not available.',
			birthday: data.birthday,
			deathday: data.deathday,
			placeOfBirth: data.place_of_birth,
			profilePath: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : null,
			knownForDepartment: data.known_for_department,
			gender: data.gender, // 0: not set, 1: female, 2: male, 3: non-binary
			popularity: data.popularity,
			imdbId: data.external_ids?.imdb_id,
			homepage: data.homepage,
			alsoKnownAs: data.also_known_as || [],
			knownFor
		};
	} catch (e) {
		console.error('Error fetching person details by ID:', e);
		return null;
	}
}

export async function getDiscoverMovies(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}&language=${language}`);
		const data = await res.json();
		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		return [];
	}
}

export async function getTVShows(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&sort_by=popularity.desc&page=${page}&language=${language}`);
		const data = await res.json();
		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'tv'
		})) || [];
	} catch (e) {
		return [];
	}
}

export async function getUpcomingMovies(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(`${BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&language=${language}&page=${page}`);
		const data = await res.json();
		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		return [];
	}
}

export async function getMovieDetailByImdbId(imdbId: string, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(`${BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=${language}`);
		const data = await res.json();
		const movie = data.movie_results?.[0];

		if (movie && movie.id) {
			return getMovieDetailTMDb(movie.id, language);
		}
		return null;
	} catch (e) {
		console.error('Error fetching movie by IMDb ID:', e);
		return null;
	}
}

export async function getMovieDetailTMDb(id: number, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids&language=${language}`);
		const data = await res.json();

		const directorData = data.credits?.crew?.find((c: any) => c.job === 'Director');

		// Format budget and revenue
		const formatCurrency = (amount: number) => {
			if (!amount || amount === 0) return null;
			return new Intl.NumberFormat('en-US', {
				style: 'currency',
				currency: 'USD',
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			}).format(amount);
		};

		// Fetch real IMDB and Rotten Tomatoes ratings from OMDB if IMDB ID is available
		let imdbRating = data.vote_average;
		let rottenTomatoesRating: number | null = null;
		let metascore: number | null = null;
		let awards: string | null = null;
		let omdbBoxOffice: string | null = null;
		let writer: string | null = null;
		let country: string | null = null;
		let languages: string | null = null;

		const imdbId = data.external_ids?.imdb_id;
		if (imdbId && process.env.OMDB_API_KEY && process.env.OMDB_API_KEY !== 'undefined') {
			try {
				console.log(`[OMDB] Fetching data for IMDB ID: ${imdbId}`);
				const omdbRes = await fetch(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbId}`);
				const omdbData = await omdbRes.json();
				console.log(`[OMDB] Response status: ${omdbData.Response}`);

				if (omdbData.Response === 'False') {
					console.error(`[OMDB] API Error: ${omdbData.Error || 'Unknown error'}`);
				}

				if (omdbData.Response === 'True') {
					// Use OMDB IMDB rating if valid, otherwise keep TMDB rating
					const omdbImdbRating = parseFloat(omdbData.imdbRating);
					if (!isNaN(omdbImdbRating) && omdbImdbRating > 0) {
						imdbRating = omdbImdbRating;
					}

					// Extract Rotten Tomatoes rating
					if (omdbData.Ratings && Array.isArray(omdbData.Ratings)) {
						const rtRating = omdbData.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
						if (rtRating && rtRating.Value) {
							const rtValue = parseInt(rtRating.Value.replace('%', ''), 10);
							if (!isNaN(rtValue) && rtValue >= 0) {
								rottenTomatoesRating = rtValue;
								console.log(`[OMDB] Rotten Tomatoes rating found: ${rtValue}%`);
							}
						}
					}

					// Extract additional OMDB data
					if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
						metascore = parseInt(omdbData.Metascore);
					}
					if (omdbData.Awards && omdbData.Awards !== 'N/A') {
						awards = omdbData.Awards;
					}
					if (omdbData.BoxOffice && omdbData.BoxOffice !== 'N/A') {
						omdbBoxOffice = omdbData.BoxOffice;
					}
					if (omdbData.Writer && omdbData.Writer !== 'N/A') {
						writer = omdbData.Writer;
					}
					if (omdbData.Country && omdbData.Country !== 'N/A') {
						country = omdbData.Country;
					}
					if (omdbData.Language && omdbData.Language !== 'N/A') {
						languages = omdbData.Language;
					}
				}
			} catch (omdbError) {
				console.warn('[OMDB] Error fetching data, using TMDB ratings:', omdbError);
			}
		} else {
			if (!imdbId) {
				console.log('[OMDB] No IMDB ID available, skipping OMDB fetch');
			} else if (!process.env.OMDB_API_KEY || process.env.OMDB_API_KEY === 'undefined') {
				console.log('[OMDB] API key not configured, skipping OMDB fetch');
			}
		}

		return {
			title: data.title,
			description: data.overview,
			poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
			backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
			releaseDate: data.release_date,
			duration: `${data.runtime} min`,
			rating: {
				imdb: imdbRating,
				rottenTomatoes: rottenTomatoesRating,
				metascore
			},
			actors: data.credits?.cast?.slice(0, 8).map((c: any) => ({
				id: c.id,
				name: c.name,
				character: c.character,
				profilePath: c.profile_path
			})) || [],
			director: {
				id: directorData?.id || null,
				name: directorData?.name || 'N/A',
				profilePath: directorData?.profile_path || null
			},
			budget: formatCurrency(data.budget),
			revenue: formatCurrency(data.revenue),
			boxOffice: omdbBoxOffice || 'N/A',
			awards,
			writer,
			country,
			languages
		};
	} catch (e) {
		console.error('Error fetching TMDb movie detail:', e);
		return null;
	}
}

export async function getMovieTrailerTMDb(id: number, language: string = 'it-IT'): Promise<string | null> {
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

export async function getTVDetailTMDb(id: number, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids&language=${language}`);
		const data = await res.json();

		// Fetch real IMDB and Rotten Tomatoes ratings from OMDB if IMDB ID is available
		let imdbRating = data.vote_average;
		let rottenTomatoesRating: number | null = null;
		let metascore: number | null = null;
		let awards: string | null = null;
		let writer: string | null = null;
		let country: string | null = null;
		let languages: string | null = null;

		const imdbId = data.external_ids?.imdb_id;
		if (imdbId && process.env.OMDB_API_KEY && process.env.OMDB_API_KEY !== 'undefined') {
			try {
				console.log(`[OMDB] Fetching data for IMDB ID: ${imdbId}`);
				const omdbRes = await fetch(`http://www.omdbapi.com/?apikey=${process.env.OMDB_API_KEY}&i=${imdbId}`);
				const omdbData = await omdbRes.json();
				console.log(`[OMDB] Response status: ${omdbData.Response}`);

				if (omdbData.Response === 'False') {
					console.error(`[OMDB] API Error: ${omdbData.Error || 'Unknown error'}`);
				}

				if (omdbData.Response === 'True') {
					// Use OMDB IMDB rating if valid, otherwise keep TMDB rating
					const omdbImdbRating = parseFloat(omdbData.imdbRating);
					if (!isNaN(omdbImdbRating) && omdbImdbRating > 0) {
						imdbRating = omdbImdbRating;
					}

					// Extract Rotten Tomatoes rating
					if (omdbData.Ratings && Array.isArray(omdbData.Ratings)) {
						const rtRating = omdbData.Ratings.find((r: any) => r.Source === 'Rotten Tomatoes');
						if (rtRating && rtRating.Value) {
							const rtValue = parseInt(rtRating.Value.replace('%', ''), 10);
							if (!isNaN(rtValue) && rtValue >= 0) {
								rottenTomatoesRating = rtValue;
								console.log(`[OMDB] Rotten Tomatoes rating found: ${rtValue}%`);
							}
						}
					}

					// Extract additional OMDB data
					if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
						metascore = parseInt(omdbData.Metascore);
					}
					if (omdbData.Awards && omdbData.Awards !== 'N/A') {
						awards = omdbData.Awards;
					}
					if (omdbData.Writer && omdbData.Writer !== 'N/A') {
						writer = omdbData.Writer;
					}
					if (omdbData.Country && omdbData.Country !== 'N/A') {
						country = omdbData.Country;
					}
					if (omdbData.Language && omdbData.Language !== 'N/A') {
						languages = omdbData.Language;
					}
				}
			} catch (omdbError) {
				console.warn('[OMDB] Error fetching data, using TMDB ratings:', omdbError);
			}
		} else {
			if (!imdbId) {
				console.log('[OMDB] No IMDB ID available, skipping OMDB fetch');
			} else if (!process.env.OMDB_API_KEY || process.env.OMDB_API_KEY === 'undefined') {
				console.log('[OMDB] API key not configured, skipping OMDB fetch');
			}
		}

		return {
			title: data.name,
			description: data.overview,
			poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
			backdrop: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
			releaseDate: data.first_air_date,
			seasons: data.number_of_seasons,
			episodes: data.number_of_episodes,
			status: data.status,
			rating: {
				imdb: imdbRating,
				rottenTomatoes: rottenTomatoesRating,
				metascore
			},
			actors: data.credits?.cast?.slice(0, 8).map((c: any) => ({
				id: c.id,
				name: c.name,
				character: c.character,
				profilePath: c.profile_path
			})) || [],
			creators: data.created_by?.map((c: any) => c.name).join(', ') || 'N/A',
			genres: data.genres?.map((g: any) => g.name) || [],
			awards,
			writer,
			country,
			languages
		};
	} catch (e) {
		console.error('Error fetching TMDb TV detail:', e);
		return null;
	}
}

export async function getTVTrailerTMDb(id: number, language: string = 'it-IT'): Promise<string | null> {
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

// Search multi-type (movies, TV shows, people)
export async function searchMulti(query: string, page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => {
			const mediaType = item.media_type;

			if (mediaType === 'person') {
				return {
					id: item.id,
					title: item.name,
					type: 'person',
					poster: item.profile_path ? `https://image.tmdb.org/t/p/w500${item.profile_path}` : null,
					knownFor: item.known_for_department || 'Acting'
				};
			}

			return {
				id: item.id,
				title: item.title || item.name,
				poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
				year: (item.release_date || item.first_air_date || '').split('-')[0],
				rating: item.vote_average,
				type: mediaType === 'movie' ? 'movie' : 'tv',
				overview: item.overview || ''
			};
		}) || [];
	} catch (e) {
		console.error('Error in searchMulti:', e);
		return [];
	}
}

// Trending content (all, movie, tv, person) with time window (day, week)
export async function getTrending(mediaType: 'all' | 'movie' | 'tv' | 'person' = 'all', timeWindow: 'day' | 'week' = 'week', language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => {
			const type = item.media_type || mediaType;

			if (type === 'person') {
				return {
					id: item.id,
					title: item.name,
					type: 'person',
					poster: item.profile_path ? `https://image.tmdb.org/t/p/w500${item.profile_path}` : null,
					knownFor: item.known_for_department || 'Acting'
				};
			}

			return {
				id: item.id,
				title: item.title || item.name,
				poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
				year: (item.release_date || item.first_air_date || '').split('-')[0],
				rating: item.vote_average,
				type: type === 'movie' ? 'movie' : 'tv'
			};
		}) || [];
	} catch (e) {
		console.error('Error in getTrending:', e);
		return [];
	}
}

// Top Rated Movies
export async function getTopRatedMovies(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		console.error('Error in getTopRatedMovies:', e);
		return [];
	}
}

// Top Rated TV Shows
export async function getTopRatedTV(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/tv/top_rated?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'tv'
		})) || [];
	} catch (e) {
		console.error('Error in getTopRatedTV:', e);
		return [];
	}
}

// Now Playing Movies (currently in theaters)
export async function getNowPlayingMovies(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		console.error('Error in getNowPlayingMovies:', e);
		return [];
	}
}

// Popular Movies
export async function getPopularMovies(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		console.error('Error in getPopularMovies:', e);
		return [];
	}
}

// Popular TV Shows
export async function getPopularTV(page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/tv/popular?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'tv'
		})) || [];
	} catch (e) {
		console.error('Error in getPopularTV:', e);
		return [];
	}
}

// Get Movie Genres
export async function getMovieGenres(language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}&language=${language}`
		);
		const data = await res.json();

		return data.genres || [];
	} catch (e) {
		console.error('Error in getMovieGenres:', e);
		return [];
	}
}

// Get TV Genres
export async function getTVGenres(language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}&language=${language}`
		);
		const data = await res.json();

		return data.genres || [];
	} catch (e) {
		console.error('Error in getTVGenres:', e);
		return [];
	}
}

// Discover Movies with genre filter
export async function getDiscoverMoviesByGenre(genreId: number, page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		console.error('Error in getDiscoverMoviesByGenre:', e);
		return [];
	}
}

// Discover TV Shows with genre filter
export async function getDiscoverTVByGenre(genreId: number, page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=${genreId}&sort_by=popularity.desc&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'tv'
		})) || [];
	} catch (e) {
		console.error('Error in getDiscoverTVByGenre:', e);
		return [];
	}
}

// Similar Movies
export async function getSimilarMovies(movieId: number, page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/movie/${movieId}/similar?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		console.error('Error in getSimilarMovies:', e);
		return [];
	}
}

// Similar TV Shows
export async function getSimilarTV(tvId: number, page: number = 1, language: string = 'it-IT') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/tv/${tvId}/similar?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'tv'
		})) || [];
	} catch (e) {
		console.error('Error in getSimilarTV:', e);
		return [];
	}
}

// Movie Recommendations
export async function getMovieRecommendations(movieId: number, page: number = 1, language: string = 'en-US') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/movie/${movieId}/recommendations?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.title,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.release_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'movie'
		})) || [];
	} catch (e) {
		console.error('Error in getMovieRecommendations:', e);
		return [];
	}
}

// TV Recommendations
export async function getTVRecommendations(tvId: number, page: number = 1, language: string = 'en-US') {
	if (!TMDB_API_KEY) return [];
	try {
		const res = await fetch(
			`${BASE_URL}/tv/${tvId}/recommendations?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return data.results?.map((item: any) => ({
			id: item.id,
			title: item.name,
			poster: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : null,
			year: (item.first_air_date || '').split('-')[0],
			rating: item.vote_average,
			type: 'tv'
		})) || [];
	} catch (e) {
		console.error('Error in getTVRecommendations:', e);
		return [];
	}
}

// Movie Reviews
export async function getMovieReviews(movieId: number, page: number = 1, language: string = 'en-US') {
	if (!TMDB_API_KEY) return { results: [], totalResults: 0 };
	try {
		const res = await fetch(
			`${BASE_URL}/movie/${movieId}/reviews?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return {
			results: data.results?.map((review: any) => ({
				id: review.id,
				author: review.author,
				authorDetails: {
					name: review.author_details?.name || review.author,
					username: review.author_details?.username,
					avatarPath: review.author_details?.avatar_path,
					rating: review.author_details?.rating
				},
				content: review.content,
				createdAt: review.created_at,
				updatedAt: review.updated_at,
				url: review.url
			})) || [],
			totalResults: data.total_results || 0
		};
	} catch (e) {
		console.error('Error in getMovieReviews:', e);
		return { results: [], totalResults: 0 };
	}
}

// TV Reviews
export async function getTVReviews(tvId: number, page: number = 1, language: string = 'en-US') {
	if (!TMDB_API_KEY) return { results: [], totalResults: 0 };
	try {
		const res = await fetch(
			`${BASE_URL}/tv/${tvId}/reviews?api_key=${TMDB_API_KEY}&page=${page}&language=${language}`
		);
		const data = await res.json();

		return {
			results: data.results?.map((review: any) => ({
				id: review.id,
				author: review.author,
				authorDetails: {
					name: review.author_details?.name || review.author,
					username: review.author_details?.username,
					avatarPath: review.author_details?.avatar_path,
					rating: review.author_details?.rating
				},
				content: review.content,
				createdAt: review.created_at,
				updatedAt: review.updated_at,
				url: review.url
			})) || [],
			totalResults: data.total_results || 0
		};
	} catch (e) {
		console.error('Error in getTVReviews:', e);
		return { results: [], totalResults: 0 };
	}
}

// TV Season Details
export async function getTVSeasonDetails(tvId: number, seasonNumber: number, language: string = 'en-US') {
	if (!TMDB_API_KEY) return null;
	try {
		const res = await fetch(
			`${BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}&language=${language}`
		);

		if (!res.ok) {
			console.error(`Failed to fetch season details: ${res.status} ${res.statusText}`);
			return null;
		}

		const data = await res.json();

		return {
			id: data.id,
			name: data.name,
			overview: data.overview,
			airDate: data.air_date,
			posterPath: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
			seasonNumber: data.season_number,
			voteAverage: data.vote_average,
			episodes: data.episodes?.map((episode: any) => ({
				id: episode.id,
				name: episode.name,
				overview: episode.overview,
				episodeNumber: episode.episode_number,
				seasonNumber: episode.season_number,
				airDate: episode.air_date,
				stillPath: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : null,
				voteAverage: episode.vote_average,
				runtime: episode.runtime,
				crew: episode.crew,
				guestStars: episode.guest_stars?.map((guest: any) => ({
					id: guest.id,
					name: guest.name,
					character: guest.character,
					profilePath: guest.profile_path ? `https://image.tmdb.org/t/p/w185${guest.profile_path}` : null
				})) || []
			})) || []
		};
	} catch (e) {
		console.error('Error in getTVSeasonDetails:', e);
		return null;
	}
}
