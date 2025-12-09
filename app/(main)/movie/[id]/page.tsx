import { getMovieDetail } from '@/lib/omdb';
import { getMovieTrailer, getMovieDetailTMDb, getMovieTrailerTMDb } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Star, Clock, Play, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import PersonCard from '@/components/PersonCard';
import TrailerButton from '@/components/TrailerButton';

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
		<main className="min-h-screen bg-white">
			{/* Hero Section - Minimalist */}
			<section className="relative bg-gray-50">
				<div className="max-w-3xl mx-auto px-8 md:px-16 py-12">
					<Link
						href="/discovery"
						className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
					>
						<ChevronLeft size={20} />
						<span className="text-sm font-medium">Back to Discovery</span>
					</Link>

					<div className="grid md:grid-cols-[300px,1fr] gap-12 items-start">
						{/* Poster */}
						<div className="w-full max-w-[300px] mx-auto md:mx-0">
							<div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-lg bg-gray-200">
								{movie.poster ? (
									<img
										src={movie.poster}
										alt={movie.title}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-gray-400">
										<Play size={64} />
									</div>
								)}
							</div>
						</div>

						{/* Info */}
						<div className="space-y-6">
							<div>
								<h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
									{movie.title}
								</h1>
								<div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
									<span className="flex items-center gap-1.5">
										<Star className="text-amber-500 fill-amber-500" size={18} />
										<span className="font-semibold text-gray-900">{movie.rating.imdb}</span>
									</span>
									<span>•</span>
									<span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
									<span>•</span>
									<span>{movie.duration}</span>
								</div>
							</div>

							{trailerUrl && (
								<div>
									<TrailerButton trailerUrl={trailerUrl} />
								</div>
							)}

							<div className="pt-6 border-t border-gray-200">
								<h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
									Synopsis
								</h2>
								<p className="text-gray-700 leading-relaxed">
									{movie.description}
								</p>
							</div>

							{/* Details Grid */}
							<div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
								<div>
									<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
										Director
									</h3>
									<p className="text-gray-900 font-medium">{movie.director}</p>
								</div>

								{movie.boxOffice && movie.boxOffice !== 'N/A' && (
									<div>
										<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
											Box Office
										</h3>
										<p className="text-gray-900 font-medium">{movie.boxOffice}</p>
									</div>
								)}

								<div>
									<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
										IMDb Rating
									</h3>
									<p className="text-gray-900 font-medium">{movie.rating.imdb}/10</p>
								</div>

								<div>
									<h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
										Score
									</h3>
									<p className="text-gray-900 font-medium">{movie.rating.rottenTomatoes}%</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Cast Section */}
			{movie.actors && movie.actors.length > 0 && (
				<section className="max-w-3xl mx-auto px-8 md:px-16 py-16">
					<h2 className="text-2xl font-bold text-gray-900 mb-8">Cast</h2>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{movie.actors.map((actor: string, index: number) => (
							<PersonCard key={index} name={actor} role="Actor" />
						))}
					</div>
				</section>
			)}
		</main>
	);
}
