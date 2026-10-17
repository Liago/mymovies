/**
 * Servizi di streaming mostrati in Home ("Incluso nei tuoi abbonamenti").
 * Gli id sono quelli dei watch provider TMDB/JustWatch per l'Italia.
 */
export interface StreamingService {
	/** Slug usato nel parametro `svc` dell'URL. */
	slug: string;
	name: string;
	providerId: number;
}

export const STREAMING_SERVICES: StreamingService[] = [
	{ slug: 'netflix', name: 'Netflix', providerId: 8 },
	{ slug: 'prime-video', name: 'Prime Video', providerId: 119 },
	{ slug: 'disney-plus', name: 'Disney+', providerId: 337 },
	{ slug: 'now', name: 'NOW', providerId: 39 },
	{ slug: 'apple-tv', name: 'Apple TV+', providerId: 350 },
];

export const WATCH_REGION = 'IT';
