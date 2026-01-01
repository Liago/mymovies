const API_KEY = process.env.OMDB_API_KEY;
const BASE_URL = 'http://www.omdbapi.com';

export interface MovieData {
	id: string;
	title: string;
	type: 'movie' | 'tv';
	year: number;
	description: string;
	poster?: string;
	actors: string[];
	director: string;
	rating: {
		imdb: number;
		rottenTomatoes: number;
	};
	budget: string;
	boxOffice: string;
	duration: string;
	genre: string[];
	releaseDate: string;
}

export interface OMDbSearchResponse {
	Search: OMDbSearchResult[];
	totalResults: string;
	Response: string;
	Error?: string;
}

export interface OMDbSearchResult {
	Title: string;
	Year: string;
	imdbID: string;
	Type: string;
	Poster: string;
}

export interface OMDbDetailResponse {
	Title: string;
	Year: string;
	Rated: string;
	Released: string;
	Runtime: string;
	Genre: string;
	Director: string;
	Writer: string;
	Actors: string;
	Plot: string;
	Language: string;
	Country: string;
	Awards: string;
	Poster: string;
	Ratings: { Source: string; Value: string }[];
	Metascore: string;
	imdbRating: string;
	imdbVotes: string;
	imdbID: string;
	Type: string;
	DVD: string;
	BoxOffice: string;
	Production: string;
	Website: string;
	Response: string;
}

export async function searchMovies(query: string): Promise<MovieData[]> {
	if (!API_KEY) {
		console.error('OMDB_API_KEY is not set');
		return [];
	}

	try {
		const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&s=${encodeURIComponent(query)}`);
		const data: OMDbSearchResponse = await response.json();

		if (data.Response === 'False' || !data.Search) {
			return [];
		}

		const topResults = data.Search.slice(0, 5);
		const detailedResults = await Promise.all(
			topResults.map(item => getMovieDetail(item.imdbID))
		);

		return detailedResults.filter((item): item is MovieData => item !== null);
	} catch (error) {
		console.error('Error searching movies:', error);
		return [];
	}
}

export async function getMovieDetail(imdbId: string): Promise<MovieData | null> {
	if (!API_KEY) return null;

	try {
		const response = await fetch(`${BASE_URL}/?apikey=${API_KEY}&i=${imdbId}&plot=full`);
		const data: OMDbDetailResponse = await response.json();

		if (data.Response === 'False') {
			return null;
		}

		return mapOMDbToMovieData(data);
	} catch (error) {
		console.error('Error fetching movie detail:', error);
		return null;
	}
}

function mapOMDbToMovieData(data: OMDbDetailResponse): MovieData {
	const ratings = data.Ratings || [];
	const rottenTomatoes = ratings.find(r => r.Source === 'Rotten Tomatoes')?.Value.replace('%', '') || '0';

	return {
		id: data.imdbID,
		title: data.Title,
		type: data.Type === 'series' ? 'tv' : 'movie',
		year: parseInt(data.Year) || 0,
		description: data.Plot || '',
		poster: data.Poster && data.Poster !== 'N/A' ? data.Poster : undefined,
		actors: data.Actors ? data.Actors.split(', ') : [],
		director: data.Director || '',
		rating: {
			imdb: parseFloat(data.imdbRating) || 0,
			rottenTomatoes: parseInt(rottenTomatoes) || 0,
		},
		budget: 'N/A',
		boxOffice: data.BoxOffice || 'N/A',
		duration: data.Runtime || '',
		genre: data.Genre ? data.Genre.split(', ') : [],
		releaseDate: data.Released || '',
	};
}
