import { fetchTrending, fetchTopRatedMovies, fetchNowPlayingMovies, fetchPopularTV } from "@/app/actions";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";

export default async function Home() {
	const [trending, topRated, nowPlaying, popularTV] = await Promise.all([
		fetchTrending('all', 'week'),
		fetchTopRatedMovies(),
		fetchNowPlayingMovies(),
		fetchPopularTV()
	]);

	const heroItem = trending[0];
	const trendingItems = trending.slice(1, 15);
	const topRatedMovies = topRated.slice(0, 15);
	const nowPlayingMovies = nowPlaying.slice(0, 15);
	const popularTVShows = popularTV.slice(0, 15);

	return (
		<main className="min-h-screen bg-black text-white pb-20">
			{/* Hero Section */}
			<HeroSection item={heroItem} />

			{/* Content Sections */}
			<div className="relative z-10 -mt-32 md:-mt-48 space-y-8">
				<MovieCarousel title="Trending This Week" movies={trendingItems} viewAllLink="/trending" />

				<MovieCarousel title="Now Playing in Theaters" movies={nowPlayingMovies} viewAllLink="/now-playing" />

				<MovieCarousel title="Top Rated Movies" movies={topRatedMovies} viewAllLink="/top-rated" />

				<MovieCarousel title="Popular TV Shows" movies={popularTVShows} viewAllLink="/tv" />
			</div>
		</main>
	);
}
