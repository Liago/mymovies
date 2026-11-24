import 'server-only';
import type { WatchProvider, WatchProviderData } from '@/lib/tmdb';
import { isSafeExternalUrl } from '@/lib/watch-links';

/**
 * L'API `/watch/providers` di TMDB restituisce solo il link alla pagina
 * "Dove guardare" di TMDB, non i link diretti alle piattaforme. La pagina web
 * di TMDB invece li espone (forniti da JustWatch) come
 * `https://click.justwatch.com/a?...&r=<url della piattaforma>`.
 * Qui leggiamo quella pagina e associamo ogni link al provider giusto,
 * confrontando il logo (stesso `logo_path` dell'API) o il nome nel `title`.
 */

interface ScrapedLink {
	url: string;
	logoFile: string | null;
	title: string;
}

const ANCHOR_RE = /<a\b([^>]*?)href="(https:\/\/click\.justwatch\.com\/[^"]+)"([^>]*)>([\s\S]*?)<\/a>/gi;
const TITLE_RE = /title="([^"]*)"/i;
const LOGO_RE = /\/t\/p\/[^/"']+\/([A-Za-z0-9_-]+\.(?:jpg|jpeg|png|svg|webp))/i;

function decodeEntities(s: string): string {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&quot;/g, '"')
		.replace(/&#39;|&#x27;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function normalize(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/[^a-z0-9+]/g, '');
}

function logoFileOf(path: string | null | undefined): string | null {
	return path?.split('/').pop() || null;
}

/** Estrae l'URL della piattaforma dal redirect JustWatch (parametro `r`). */
function targetUrl(justwatchUrl: string): string {
	try {
		const r = new URL(justwatchUrl).searchParams.get('r');
		if (isSafeExternalUrl(r)) return r;
	} catch {
		// URL non valido: si usa il redirect così com'è
	}
	return justwatchUrl;
}

export function parseWatchLinks(html: string): ScrapedLink[] {
	const links: ScrapedLink[] = [];
	for (const m of html.matchAll(ANCHOR_RE)) {
		const attrs = `${m[1]} ${m[3]}`;
		const href = decodeEntities(m[2]);
		const inner = m[4];
		links.push({
			url: targetUrl(href),
			logoFile: inner.match(LOGO_RE)?.[1] ?? null,
			title: decodeEntities(attrs.match(TITLE_RE)?.[1] ?? ''),
		});
	}
	return links;
}

async function fetchWatchPage(mediaType: 'movie' | 'tv', id: number, country: string): Promise<string | null> {
	try {
		const res = await fetch(`https://www.themoviedb.org/${mediaType}/${id}/watch?locale=${country}`, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; CineScope/1.0)',
				'Accept-Language': 'it-IT,it;q=0.9,en;q=0.8',
			},
			next: { revalidate: 21600 },
			signal: AbortSignal.timeout(5000),
		});
		if (!res.ok) return null;
		return await res.text();
	} catch (e) {
		console.error('Error fetching TMDB watch page:', e);
		return null;
	}
}

function matchLink(provider: WatchProvider, links: ScrapedLink[]): string | null {
	const logo = logoFileOf(provider.logo_path);
	const byLogo = logo ? links.find((l) => l.logoFile === logo) : undefined;
	if (byLogo) return byLogo.url;

	// Il title è del tipo "Watch <titolo> on Netflix" / "Guarda <titolo> su Netflix".
	const name = normalize(provider.provider_name);
	if (!name) return null;
	const byName = links.find((l) => {
		const t = l.title.match(/.*\s(?:on|su)\s(.+)$/i)?.[1];
		return t ? normalize(t) === name : false;
	});
	return byName?.url ?? null;
}

/**
 * Arricchisce i provider con `deep_link` verso la piattaforma. In caso di
 * errore restituisce i dati invariati: il fallback è gestito da `providerHref`.
 */
export async function withDeepLinks(
	data: WatchProviderData | null,
	mediaType: 'movie' | 'tv',
	id: number,
	language: string = 'it-IT'
): Promise<WatchProviderData | null> {
	if (!data) return data;
	const country = language.split('-')[1] || language.split('-')[0].toUpperCase();
	const html = await fetchWatchPage(mediaType, id, country);
	if (!html) return data;

	const links = parseWatchLinks(html);
	if (!links.length) return data;

	const enrich = (list?: WatchProvider[]) => list?.map((p) => ({ ...p, deep_link: matchLink(p, links) }));
	return {
		...data,
		flatrate: enrich(data.flatrate),
		rent: enrich(data.rent),
		buy: enrich(data.buy),
		ads: enrich(data.ads),
		free: enrich(data.free),
	};
}
