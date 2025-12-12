import { getMovieDetail } from '@/lib/omdb';
import { getMovieDetailTMDb, getMovieTrailerTMDb, getMovieTrailer } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Star, Play, ChevronLeft, Calendar, Clock, Film } from 'lucide-react';
import Link from 'next/link';
import PersonCard from '@/components/PersonCard';
import TrailerButton from '@/components/TrailerButton';
import Navbar from '@/components/Navbar';
import ActionButtons from '@/components/ActionButtons';
import { fetchAccountStates } from '@/app/actions';
import { cookies } from 'next/headers';

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';

	const isTMDbId = /^\d+$/.test(id);

	let movie;
	let trailerUrl = null;
	let accountStates = null;

	if (isTMDbId) {
		movie = await getMovieDetailTMDb(parseInt(id), lang);
		trailerUrl = await getMovieTrailerTMDb(parseInt(id), lang);
		accountStates = await fetchAccountStates('movie', parseInt(id));
	} else {
		movie = await getMovieDetail(id);
		trailerUrl = await getMovieTrailer(id);
	}

	if (!movie) {
		notFound();
	}

	const backdropUrl = movie.poster?.replace('w500', 'original') || '';

	return (
		<main className="min-h-screen bg-black text-white">
			{/* Immersive Background */}
			<div className="fixed inset-0 z-0">
				<img
					src={backdropUrl}
					alt={movie.title}
					className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
				/>
				<div className="absolute inset-0 bg-black/80" />
			</div>

			<div className="relative z-10">

				<div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pt-32">
					<Link
						href="/discovery"
						className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
					>
						<ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
						<span className="text-sm font-medium">Back to Discovery</span>
					</Link>

					<div className="grid lg:grid-cols-[350px,1fr] gap-12 items-start">
						{/* Poster */}
						<div className="w-full max-w-[350px] mx-auto lg:mx-0">
							<div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 bg-zinc-900 border border-white/10 relative group">
								{movie.poster ? (
									<img
										src={movie.poster}
										alt={movie.title}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-zinc-700">
										<Film size={64} />
									</div>
								)}
								{/* Shine effect */}
								<div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
							</div>
						</div>

						{/* Info */}
						<div className="space-y-8">
							<div>
								<div className="flex flex-wrap items-center gap-3 mb-4">
									{movie.releaseDate && (
										<span className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-zinc-300">
											{movie.releaseDate.split('-')[0]}
										</span>
									)}
									<span className="px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-xs font-semibold text-primary uppercase tracking-wider">
										{(movie as any).type || 'Movie'}
									</span>
								</div>

								<h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
									{movie.title}
								</h1>

								<div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium">
									<div className="flex items-center gap-2 text-green-400">
										<Star className="fill-green-400 text-green-400" size={18} />
										<span className="text-lg font-bold">{movie.rating.imdb}</span>
										<span className="text-xs opacity-70">IMDb</span>
									</div>
									<div className="flex items-center gap-2">
										<Clock size={18} />
										<span>{movie.duration}</span>
									</div>
									<div className="flex items-center gap-2">
										<Calendar size={18} />
										<span>{movie.releaseDate?.split('-')[0] || 'N/A'}</span>
									</div>
								</div>
							</div>

							<div className="flex flex-wrap gap-4 items-center">
								{trailerUrl && <TrailerButton trailerUrl={trailerUrl} />}
								{isTMDbId && (
									<ActionButtons
										mediaType="movie"
										mediaId={parseInt(id)}
										initialState={accountStates}
										showText={true}
									/>
								)}
							</div>

							<div className="border-t border-white/10 pt-8">
								<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
									Synopsis
								</h2>
								<p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
									{movie.description}
								</p>
							</div>

							{/* Details Grid */}
							<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-white/10">
								<div>
									<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
										Director
									</h3>
									<p className="text-white font-medium">{movie.director}</p>
								</div>

								{movie.boxOffice && movie.boxOffice !== 'N/A' && (
									<div>
										<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
											Box Office
										</h3>
										<p className="text-white font-medium">{movie.boxOffice}</p>
									</div>
								)}

								{movie.rating.rottenTomatoes && (
									<div>
										<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
											Rotten Tomatoes
										</h3>
										<p className="text-white font-medium">{movie.rating.rottenTomatoes}%</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Cast Section */}
			{movie.actors && movie.actors.length > 0 && (
				<section className="relative z-10 bg-zinc-950 border-t border-white/5">
					<div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
						<h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
							<span>Cast & Crew</span>
							<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
						</h2>
						<div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
							{movie.actors.map((actor: string, index: number) => (
								<PersonCard key={index} name={actor} role="Actor" />
							))}
						</div>
					</div>
				</section>
			)}
		</main>
	);
}
