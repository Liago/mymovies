import type { WatchProvider, WatchProviderData } from '@/lib/tmdb';

/**
 * Pagine di ricerca dei principali servizi, usate quando TMDB/JustWatch non
 * fornisce un deep link diretto al titolo. Chiave: provider_id TMDB.
 */
const SEARCH_URLS: Record<number, (q: string) => string> = {
	8: (q) => `https://www.netflix.com/search?q=${q}`, // Netflix
	1796: (q) => `https://www.netflix.com/search?q=${q}`, // Netflix Standard con pubblicità
	119: (q) => `https://www.primevideo.com/search?phrase=${q}`, // Prime Video
	10: (q) => `https://www.primevideo.com/search?phrase=${q}`, // Amazon Video
	337: (q) => `https://www.disneyplus.com/search?q=${q}`, // Disney+
	350: (q) => `https://tv.apple.com/it/search?term=${q}`, // Apple TV+
	2: (q) => `https://tv.apple.com/it/search?term=${q}`, // Apple TV (store)
	3: (q) => `https://play.google.com/store/search?q=${q}&c=movies`, // Google Play Film
	222: (q) => `https://www.raiplay.it/ricerca.html?q=${q}`, // RaiPlay
	11: (q) => `https://mubi.com/it/search/films?query=${q}`, // MUBI
	283: (q) => `https://www.crunchyroll.com/it/search?q=${q}`, // Crunchyroll
	192: (q) => `https://www.youtube.com/results?search_query=${q}`, // YouTube
};

/** True se l'URL è http(s) e quindi sicuro da usare come href esterno. */
export function isSafeExternalUrl(url: string | null | undefined): url is string {
	if (!url) return false;
	try {
		const { protocol } = new URL(url);
		return protocol === 'https:' || protocol === 'http:';
	} catch {
		return false;
	}
}

/**
 * Link da aprire cliccando un provider:
 * 1. deep link al titolo sulla piattaforma (estratto dalla pagina TMDB/JustWatch);
 * 2. ricerca del titolo sulla piattaforma, se conosciuta;
 * 3. pagina "Dove guardare" di TMDB come ultima risorsa.
 */
export function providerHref(provider: WatchProvider, data: WatchProviderData | null, mediaTitle?: string): string | null {
	if (isSafeExternalUrl(provider.deep_link)) return provider.deep_link;
	const search = SEARCH_URLS[provider.provider_id];
	if (search && mediaTitle) return search(encodeURIComponent(mediaTitle));
	return isSafeExternalUrl(data?.link) ? data.link : null;
}
