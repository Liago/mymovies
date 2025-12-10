import { fetchDiscoverMovies, fetchTVShows } from "@/app/actions";
import HeroSection from "@/components/HeroSection";
import MovieCarousel from "@/components/MovieCarousel";

export default async function Home() {
	const [movies, tvShows] = await Promise.all([
		fetchDiscoverMovies(),
		fetchTVShows()
	]);

	const heroMovie = movies[0];
	const trendingMovies = movies.slice(1, 15);
	const popularTV = tvShows.slice(0, 15);

	return (
		<main className="min-h-screen bg-black text-white pb-20">
			{/* Hero Section */}
			<HeroSection item={heroMovie} />

			{/* Content Sections */}
			<div className="relative z-10 -mt-32 md:-mt-48 space-y-8">
				<MovieCarousel title="Trending Movies" movies={trendingMovies} />

				<MovieCarousel title="Popular TV Shows" movies={popularTV} />

				{/* Just for demo/filling space */}
				<MovieCarousel title="New Releases" movies={movies.slice(5, 12)} />
			</div>
		</main>
	);
}
