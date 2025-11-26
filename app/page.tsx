import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import { fetchDiscoverMovies, fetchTVShows } from "@/app/actions";

export default async function Home() {
	const [movies, tvShows] = await Promise.all([
		fetchDiscoverMovies(),
		fetchTVShows()
	]);

	// Helper to get random items
	const getRandomItems = (arr: any[], count: number) => {
		const shuffled = [...arr].sort(() => 0.5 - Math.random());
		return shuffled.slice(0, count);
	};

	const randomMovies = getRandomItems(movies, 2).map((m: any) => ({ ...m, type: 'movie' }));
	const randomTV = getRandomItems(tvShows, 2).map((t: any) => ({ ...t, type: 'tv' }));

	// Combine and shuffle again to mix movies and TV shows
	const heroItems = getRandomItems([...randomMovies, ...randomTV], 4);

	return (
		<main className="min-h-screen bg-[#fdfbf7]">
			<Navbar />
			<HeroSection items={heroItems} />
		</main>
	);
}
