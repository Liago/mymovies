import { getMovieDetail } from '@/lib/omdb';
import { getMovieTrailer, getMovieDetailTMDb, getMovieTrailerTMDb } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Star, Clock, Calendar, DollarSign, Play, Share2, Plus } from 'lucide-react';
import Link from 'next/link';
import PersonCard from '@/components/PersonCard';
import Navbar from '@/components/Navbar';

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const isTMDbId = /^\d+$/.test(id);

	let movie;
	let trailerUrl = null;

	if (isTMDbId) {
		movie = await getMovieDetailTMDb(parseInt(id));
		trailerUrl = await getMovieTrailerTMDb(parseInt(id));
	} else {
		movie = await getMovieDetail(id);
		trailerUrl = await getMovieTrailer(id);
	}

	if (!movie) {
		notFound();
	}

	const backdropUrl = movie.poster?.replace('w500', 'original') || '';

	return (
		<main className="min-h-screen bg-slate-950 text-white">
			<Navbar />

			{/* Hero Banner */}
			<section className="relative h-[70vh] w-full">
				<div className="absolute inset-0">
					<img
						src={backdropUrl}
						alt={movie.title}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
					<div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
				</div>

				<div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex items-end pb-12">
					<div className="max-w-4xl">
						<h1 className="text-5xl md:text-7xl font-bold text-white mb-4 leading-tight">
							{movie.title}
						</h1>

						<div className="flex items-center gap-6 text-lg text-gray-300 mb-8">
							<div className="flex items-center gap-2">
								<Star className="text-green-400 fill-green-400" size={20} />
								<span className="text-white font-bold">{movie.rating.imdb}</span>
							</div>
							<span>{movie.releaseDate}</span>
							<span>{movie.duration}</span>
							<span className="border border-gray-500 px-2 py-0.5 rounded text-sm uppercase">HD</span>
						</div>

						<div className="flex flex-wrap gap-4">
							{trailerUrl && (
								<a
									href={trailerUrl}
									target="_blank"
									rel="noopener noreferrer"
									className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
								>
									<Play size={24} fill="currentColor" />
									Watch Trailer
								</a>
							)}
							<button className="flex items-center gap-3 bg-gray-800/80 backdrop-blur text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-700 transition-colors">
								<Plus size={24} />
								Add to List
							</button>
							<button className="p-3 rounded-full bg-gray-800/80 backdrop-blur hover:bg-gray-700 transition-colors">
								<Share2 size={24} />
							</button>
						</div>
					</div>
				</div>
			</section>

			{/* Content Grid */}
			<div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

					{/* Main Info */}
					<div className="lg:col-span-8 space-y-12">
						{/* Synopsis */}
						<section>
							<h2 className="text-2xl font-bold mb-4 text-gray-100">Synopsis</h2>
							<p className="text-lg text-gray-400 leading-relaxed">
								{movie.description}
							</p>
						</section>

						{/* Cast */}
						<section>
							<h2 className="text-2xl font-bold mb-6 text-gray-100">Top Cast</h2>
							<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
								{movie.actors.map((actor: string, index: number) => (
									<PersonCard key={index} name={actor} role="Actor" />
								))}
							</div>
						</section>
					</div>

					{/* Sidebar Details */}
					<div className="lg:col-span-4 space-y-8">
						<div className="glass-panel rounded-xl p-6 space-y-6">
							<div>
								<h3 className="text-gray-500 text-sm font-medium mb-1">Director</h3>
								<p className="text-white font-semibold text-lg">{movie.director}</p>
							</div>

							<div>
								<h3 className="text-gray-500 text-sm font-medium mb-1">Box Office</h3>
								<p className="text-white font-semibold text-lg">{movie.boxOffice}</p>
							</div>

							<div className="pt-4 border-t border-white/10">
								<h3 className="text-gray-500 text-sm font-medium mb-3">Ratings</h3>
								<div className="flex items-center justify-between mb-2">
									<span className="text-gray-300">IMDb</span>
									<span className="text-white font-bold">{movie.rating.imdb}/10</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-gray-300">Rotten Tomatoes</span>
									<span className="text-white font-bold">{movie.rating.rottenTomatoes}%</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
