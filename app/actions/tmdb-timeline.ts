'use server';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TimelineEpisode {
	showId: number;
	showName: string;
	showPoster: string | null;
	id: number;
	name: string;
	overview: string;
	seasonNumber: number;
	episodeNumber: number;
	airDate: string | null;
	stillPath: string | null;
	voteAverage: number;
	isUpcoming: boolean;
}

export async function getTimelineEpisodes(showIds: number[], language: string = 'it-IT'): Promise<TimelineEpisode[]> {
	if (!TMDB_API_KEY || showIds.length === 0) return [];

	try {
		const episodes: TimelineEpisode[] = [];
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Fetch details for all tracked shows
		const promises = showIds.map(async (id) => {
			const res = await fetch(`${BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}&language=${language}`);
			if (!res.ok) return null;
			const data = await res.json();

			const showName = data.name;
			const showPoster = data.poster_path ? `https://image.tmdb.org/t/p/w200${data.poster_path}` : null;

			// Add next episode if exists
			if (data.next_episode_to_air) {
				const ep = data.next_episode_to_air;
				episodes.push({
					showId: id,
					showName,
					showPoster,
					id: ep.id,
					name: ep.name,
					overview: ep.overview,
					seasonNumber: ep.season_number,
					episodeNumber: ep.episode_number,
					airDate: ep.air_date,
					stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
					voteAverage: ep.vote_average,
					isUpcoming: ep.air_date ? new Date(ep.air_date) >= today : true
				});
			}

			// Add last episode if exists and it's not the same as next
			if (data.last_episode_to_air && (!data.next_episode_to_air || data.last_episode_to_air.id !== data.next_episode_to_air.id)) {
				const ep = data.last_episode_to_air;
				episodes.push({
					showId: id,
					showName,
					showPoster,
					id: ep.id,
					name: ep.name,
					overview: ep.overview,
					seasonNumber: ep.season_number,
					episodeNumber: ep.episode_number,
					airDate: ep.air_date,
					stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w500${ep.still_path}` : null,
					voteAverage: ep.vote_average,
					isUpcoming: ep.air_date ? new Date(ep.air_date) > today : false
				});
			}
		});

		await Promise.all(promises);

		// Sort episodes
		episodes.sort((a, b) => {
			if (!a.airDate) return 1;
			if (!b.airDate) return -1;

			const dateA = new Date(a.airDate).getTime();
			const dateB = new Date(b.airDate).getTime();
			const todayTime = today.getTime();

			const aIsPast = dateA <= todayTime;
			const bIsPast = dateB <= todayTime;

			if (aIsPast && bIsPast) {
				// Both in past: sort descending (most recent first)
				return dateB - dateA;
			} else if (!aIsPast && !bIsPast) {
				// Both in future: sort ascending (soonest first)
				return dateA - dateB;
			} else if (aIsPast && !bIsPast) {
				// Past before future
				return -1;
			} else {
				return 1;
			}
		});

		return episodes;
	} catch (e) {
		console.error("Error fetching timeline episodes:", e);
		return [];
	}
}
