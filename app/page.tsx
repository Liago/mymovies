import { cookies } from "next/headers";
import { fetchTrending, fetchNowPlayingMovies, fetchPopularTV } from "@/app/actions";
import {
	getMovieDetailTMDb,
	getMovieTrailerTMDb,
	getMovieWatchProviders,
	getTVDetailTMDb,
	getTVTrailerTMDb,
	getTVWatchProviders,
	type WatchProviderData,
} from "@/lib/tmdb";
import { getStreamingPicks } from "@/lib/tmdb-catalog";
import { STREAMING_SERVICES } from "@/lib/services";
import { formatRating, formatRuntime } from "@/lib/format";
import HeroCarousel, { type HeroSlide } from "@/components/home/HeroCarousel";
import UpNextRow from "@/components/home/UpNextRow";
import StreamingRow from "@/components/home/StreamingRow";
import WeeklyChart from "@/components/home/WeeklyChart";
import PosterRow from "@/components/home/PosterRow";

interface TrendingItem {
	id: number;
	title: string;
	poster: string | null;
	backdrop?: string | null;
	overview?: string;
	year?: string;
	rating?: number;
	type: 'movie' | 'tv' | 'person';
}

function firstProvider(data: WatchProviderData | null) {
	const p = [...(data?.flatrate || []), ...(data?.free || []), ...(data?.ads || [])].sort(
		(a, b) => a.display_priority - b.display_priority
	)[0];
	if (!p) return { service: null, serviceLogo: null };
	const name = STREAMING_SERVICES.find((s) => s.providerId === p.provider_id)?.name ?? p.provider_name;
	return {
		service: `Su ${name}`,
		serviceLogo: p.logo_path ? `https://image.tmdb.org/t/p/w92${p.logo_path}` : null,
	};
}

async function buildSlide(item: TrendingItem, index: number, lang: string): Promise<HeroSlide> {
	const rank = `N°${index + 1} IN TENDENZA`;

	if (item.type === 'tv') {
		const [detail, trailerUrl, providers] = await Promise.all([
			getTVDetailTMDb(item.id, lang),
			getTVTrailerTMDb(item.id, lang),
			getTVWatchProviders(item.id, lang),
		]);
		const imdb = formatRating(detail?.rating?.imdb);
		const seasons = detail?.seasons;
		return {
			id: item.id,
			type: 'tv',
			title: item.title,
			kicker: index === 0 ? rank : `SERIE · ${rank}`,
			chips: [
				'Serie',
				item.year,
				seasons ? `${seasons} ${seasons === 1 ? 'stagione' : 'stagioni'}` : null,
				imdb ? `IMDb ${imdb}` : null,
			].filter(Boolean) as string[],
			meta: [detail?.genres?.[0], item.year, imdb ? `IMDb ${imdb}` : null].filter(Boolean).join(' · '),
			overview: item.overview || detail?.description || '',
			backdrop: item.backdrop || null,
			poster: item.poster,
			trailerUrl,
			...firstProvider(providers),
		};
	}

	const [detail, trailerUrl, providers] = await Promise.all([
		getMovieDetailTMDb(item.id, lang),
		getMovieTrailerTMDb(item.id, lang),
		getMovieWatchProviders(item.id, lang),
	]);
	const imdb = formatRating(detail?.rating?.imdb);
	return {
		id: item.id,
		type: 'movie',
		title: item.title,
		kicker: index === 0 ? rank : `FILM · ${rank}`,
		chips: ['Film', item.year, formatRuntime(detail?.runtime), imdb ? `IMDb ${imdb}` : null].filter(Boolean) as string[],
		meta: [detail?.genres?.[0], item.year, imdb ? `IMDb ${imdb}` : null].filter(Boolean).join(' · '),
		overview: item.overview || detail?.description || '',
		backdrop: item.backdrop || null,
		poster: item.poster,
		trailerUrl,
		...firstProvider(providers),
	};
}

export default async function Home({ searchParams }: { searchParams: Promise<{ svc?: string }> }) {
	const { svc } = await searchParams;
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value === 'en-US' ? 'en-US' : 'it-IT';

	const [trending, nowPlaying, popularTV, streamingPicks] = await Promise.all([
		fetchTrending('all', 'week') as Promise<TrendingItem[]>,
		fetchNowPlayingMovies(),
		fetchPopularTV(),
		getStreamingPicks(lang),
	]);

	const titles = trending.filter((t): t is TrendingItem & { type: 'movie' | 'tv' } => t.type === 'movie' || t.type === 'tv');
	const heroItems = [...titles.filter((t) => t.backdrop), ...titles.filter((t) => !t.backdrop)].slice(0, 3);
	const slides = await Promise.all(heroItems.map((item, i) => buildSlide(item, i, lang)));

	return (
		<>
			<HeroCarousel slides={slides} />

			<main className="pt-5 md:pt-2 pb-36 md:pb-[120px] flex flex-col gap-[26px] md:gap-11">
				<UpNextRow />
				<StreamingRow items={streamingPicks} initialService={svc} />
				<WeeklyChart items={titles.slice(0, 10)} />
				<PosterRow title="Al cinema" href="/catalogo/now-playing" items={nowPlaying.slice(0, 15)} />
				<PosterRow title="Serie popolari" href="/catalogo/trending?type=tv" items={popularTV.slice(0, 15)} />
			</main>
		</>
	);
}
