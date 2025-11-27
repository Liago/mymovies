'use server';

import { getPersonDetails, getPersonCredits, getDiscoverMovies, getTVShows, getMovieTrailerTMDb } from '@/lib/tmdb';


export async function fetchPersonDetails(name: string) {
	return await getPersonDetails(name);
}

export async function fetchPersonCredits(id: number) {
	return await getPersonCredits(id);
}

export async function fetchDiscoverMovies() {
	return await getDiscoverMovies();
}

export async function fetchTVShows() {
	return await getTVShows();
}

export async function fetchMovieTrailer(id: number) {
	return await getMovieTrailerTMDb(id);
}
