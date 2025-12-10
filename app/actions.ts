'use server';

import { getPersonDetails, getPersonCredits, getDiscoverMovies, getTVShows, getMovieTrailerTMDb, getUpcomingMovies } from '@/lib/tmdb';


export async function fetchPersonDetails(name: string) {
	return await getPersonDetails(name);
}

export async function fetchPersonCredits(id: number) {
	return await getPersonCredits(id);
}

export async function fetchDiscoverMovies(page: number = 1) {
	return await getDiscoverMovies(page);
}

export async function fetchTVShows(page: number = 1) {
	return await getTVShows(page);
}

export async function fetchUpcomingMovies(page: number = 1) {
	return await getUpcomingMovies(page);
}

export async function fetchMovieTrailer(id: number) {
	return await getMovieTrailerTMDb(id);
}
