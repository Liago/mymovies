import { fetchDiscoverMovies } from '@/app/actions';
import Link from 'next/link';
import { ArrowRight, Film } from 'lucide-react';
import MovieCard from '@/components/MovieCard';

export default async function DiscoveryPage() {
	const movies = await fetchDiscoverMovies();
	// Take first one as featured? No, just grid for now.

	const featured = movies[0];
	const rest = movies.slice(1);

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-[1920px] mx-auto px-6 md:px-12">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight">
						Movies
						<span className="text-primary">.</span>
					</h1>
					<p className="text-zinc-400 text-lg max-w-xl">
						Explore our extensive collection of movies from around the world. From blockbusters to indie gems.
					</p>
				</div>

				{/* Featured Big Card (Optional, using first movie) */}
				{featured && (
					<div className="mb-16 relative rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[24/9] group">
						<img
							src={featured.poster?.replace('w500', 'original')}
							alt={featured.title}
							className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
						/>
						<div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
						<div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-center max-w-3xl">
							<span className="text-primary font-bold tracking-widest uppercase mb-4 text-sm">Featured Selection</span>
							<h2 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">{featured.title}</h2>
							<p className="text-zinc-300 text-lg line-clamp-3 mb-8 max-w-xl">{featured.description}</p>
							<Link
								href={`/movie/${featured.id}`}
								className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-colors self-start"
							>
								View Details <ArrowRight size={18} />
							</Link>
						</div>
					</div>
				)}

				{/* Grid */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6 md:gap-8">
					{rest.map((movie: any) => (
						<MovieCard key={movie.id} {...movie} />
					))}
				</div>
			</div>
		</main>
	);
}
