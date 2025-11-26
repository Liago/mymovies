import { fetchDiscoverMovies } from '@/app/actions';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default async function DiscoveryPage() {
	const movies = await fetchDiscoverMovies();
	// Take top 4 for the featured section
	const featuredMovies = movies.slice(0, 4);

	return (
		<main className="min-h-screen p-8 lg:p-12 max-w-[1600px] mx-auto">
			{/* Header */}
			<div className="flex items-end justify-between mb-12">
				<div>
					<h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-2">
						FEATURED REVIEWS - <br />
						<span className="text-gray-500">Editor's Picks</span>
					</h1>
					<p className="text-gray-600 text-lg">
						Critically acclaimed movies loved by audiences worldwide.
					</p>
				</div>

				<div className="flex gap-4">
					<button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
						<ArrowLeft size={24} />
					</button>
					<button className="w-12 h-12 rounded-full bg-[#6d28d9] flex items-center justify-center text-white hover:bg-[#5b21b6] transition-colors shadow-lg shadow-purple-200">
						<ArrowRight size={24} />
					</button>
				</div>
			</div>

			{/* Cards Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
				{featuredMovies.map((movie: any) => (
					<div key={movie.id} className="group flex flex-col">
						<Link href={`/movie/${movie.id}`} className="block relative aspect-[3/4] rounded-3xl overflow-hidden mb-6 shadow-lg">
							{movie.poster ? (
								<img
									src={movie.poster}
									alt={movie.title}
									className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							) : (
								<div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-gray-400">No Poster</div>
							)}
							{/* Overlay gradient */}
							<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						</Link>

						<div className="flex items-start justify-between mb-2">
							<h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">
								{movie.title}
							</h3>
							<div className="flex items-center gap-1 text-yellow-500 font-bold">
								<span>★</span>
								<span>{movie.rating.toFixed(1)}/10</span>
							</div>
						</div>

						<p className="text-gray-500 text-sm mb-4 line-clamp-1">
							{movie.year} • Movie
						</p>

						<Link
							href={`/movie/${movie.id}`}
							className="text-purple-600 font-medium text-sm hover:text-purple-800 transition-colors inline-flex items-center gap-1"
						>
							Read Review <ArrowRight size={14} />
						</Link>
					</div>
				))}
			</div>
		</main>
	);
}
