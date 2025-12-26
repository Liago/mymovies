import { getMovieDetail } from '@/lib/omdb';
import { getMovieDetailTMDb, getMovieTrailerTMDb, getMovieTrailer, getMovieReviews } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Play, ChevronLeft, Calendar, Clock, Film } from 'lucide-react';
import Link from 'next/link'; // Still used elsewhere if needed, or remove if unused. Kept for safety.
import PersonCard from '@/components/PersonCard';
import TrailerButton from '@/components/TrailerButton';
import ReviewsButton from '@/components/ReviewsButton';
import Navbar from '@/components/Navbar';
import ActionButtons from '@/components/ActionButtons';
import { fetchAccountStates, fetchSimilarMovies, fetchMovieRecommendations } from '@/app/actions';
import { cookies } from 'next/headers';
import MovieCarousel from '@/components/MovieCarousel';
import { Metadata } from 'next';
import HistoryTracker from '@/components/HistoryTracker';
import PosterImage from '@/components/PosterImage';
import BackButton from '@/components/BackButton';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params;
	const isTMDbId = /^\d+$/.test(id);
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';

	let movie;
	if (isTMDbId) {
		movie = await getMovieDetailTMDb(parseInt(id), lang);
	} else {
		movie = await getMovieDetail(id);
	}

	if (!movie) {
		return {
			title: 'Movie Not Found',
			description: 'The requested movie could not be found.'
		};
	}

	const title = `${movie.title} - CineScope`;
	const description = movie.description || `Read reviews and watch trailers for ${movie.title} on CineScope.`;
	const poster = movie.poster ? (movie.poster.startsWith('http') ? movie.poster : `https://image.tmdb.org/t/p/w500${movie.poster}`) : '/placeholder-movie.jpg';

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [
				{
					url: poster,
					width: 500,
					height: 750,
					alt: movie.title,
				},
			],
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [poster],
		},
	};
}


export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';

	const isTMDbId = /^\d+$/.test(id);

	let movie;
	let trailerUrl = null;
	let accountStates = null;
	let similarMovies: any[] = [];
	let recommendations: any[] = [];
	let reviews: any = { results: [], totalResults: 0 };

	if (isTMDbId) {
		const movieId = parseInt(id);
		[movie, trailerUrl, accountStates, similarMovies, recommendations, reviews] = await Promise.all([
			getMovieDetailTMDb(movieId, lang),
			getMovieTrailerTMDb(movieId, lang),
			fetchAccountStates('movie', movieId),
			fetchSimilarMovies(movieId),
			fetchMovieRecommendations(movieId),
			getMovieReviews(movieId, 1, lang)
		]);
	} else {
		movie = await getMovieDetail(id);
		trailerUrl = await getMovieTrailer(id);
	}

	if (!movie) {
		notFound();
	}

	const backdropUrl = (movie as any).backdrop || movie.poster?.replace('w500', 'original') || '';

	return (
		<main className="min-h-screen bg-black text-white">
			{/* Immersive Background */}
			<div className="fixed inset-0 z-0">
				<img
					src={backdropUrl}
					alt={movie.title}
					className="w-full h-full object-cover opacity-50 blur-xl scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
			</div>

			<div className="relative z-10">

				<div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pt-32">
					<BackButton fallbackHref="/discovery" label="Back to Discovery" />

					<div className="grid lg:grid-cols-[350px,1fr] gap-12 items-start">
						{/* Poster */}
						<div className="w-full max-w-[350px] mx-auto lg:mx-0">
							<div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-purple-900/20 bg-zinc-900 border border-white/10 relative group">
								{movie.poster ? (
									<PosterImage
										src={movie.poster}
										alt={movie.title}
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

								<HistoryTracker
									id={isTMDbId ? parseInt(id) : id}
									title={movie.title}
									poster={movie.poster || null}
									type="movie"
								/>

								<div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium">
									{/* IMDb Rating */}
									<div className="flex items-center gap-2">
										<svg width="40" height="20" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
											<rect width="64" height="32" rx="4" fill="#F5C518" />
											<text x="32" y="22" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000" textAnchor="middle">IMDb</text>
										</svg>
										<span className="text-lg font-bold text-white">{movie.rating.imdb}</span>
									</div>

									{/* Rotten Tomatoes Rating */}
									{movie.rating.rottenTomatoes && (
										<div className="flex items-center gap-2">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M12 2C12 2 10.5 0.5 9 1C7.5 1.5 8 3 8 3C5 3 3 5.5 3 8.5C3 12.5 6 16 9 18.5C10 19.5 11 21 12 22C13 21 14 19.5 15 18.5C18 16 21 12.5 21 8.5C21 5.5 19 3 16 3C16 3 16.5 1.5 15 1C13.5 0.5 12 2 12 2Z" fill="#FA320A" />
												<ellipse cx="12" cy="7" rx="2" ry="1.5" fill="#8BC34A" transform="rotate(-15 12 7)" />
											</svg>
											<span className="text-lg font-bold text-white">{movie.rating.rottenTomatoes}%</span>
										</div>
									)}

									{/* Metascore Rating */}
									{(movie.rating as any).metascore && (
										<div className="flex items-center gap-2">
											<div className="w-10 h-6 rounded flex items-center justify-center bg-yellow-600 text-white font-bold text-sm">
												M
											</div>
											<span className="text-lg font-bold text-white">{(movie.rating as any).metascore}</span>
										</div>
									)}

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
									<>
										<ReviewsButton
											reviews={reviews.results}
											title={movie.title}
											count={reviews.totalResults}
										/>
										<ActionButtons
											mediaType="movie"
											mediaId={parseInt(id)}
											title={movie.title}
											poster={movie.poster}
											initialState={accountStates}
											showText={true}
										/>
									</>
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

							{/* Awards Section */}
							{(movie as any).awards && (
								<div className="border-t border-white/10 pt-8">
									<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
										Awards & Recognition
									</h2>
									<p className="text-lg text-zinc-300 leading-relaxed font-light">
										{(movie as any).awards}
									</p>
								</div>
							)}

							{/* Additional Info */}
							{((movie as any).writer || (movie as any).country || (movie as any).languages) && (
								<div className="border-t border-white/10 pt-8">
									<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
										Additional Information
									</h2>
									<div className="space-y-4">
										{(movie as any).writer && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Writer
												</h3>
												<p className="text-zinc-300">{(movie as any).writer}</p>
											</div>
										)}
										{(movie as any).country && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Country
												</h3>
												<p className="text-zinc-300">{(movie as any).country}</p>
											</div>
										)}
										{(movie as any).languages && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Languages
												</h3>
												<p className="text-zinc-300">{(movie as any).languages}</p>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Details Grid */}
							<div className="space-y-8 pt-8 border-t border-white/10">
								{/* Director Section */}
								<div>
									<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">
										Director
									</h3>
									{(movie as any).director?.id ? (
										<PersonCard
											personId={(movie as any).director.id}
											name={(movie as any).director.name}
											role="Director"
											profilePath={(movie as any).director.profilePath}
										/>
									) : (
										<p className="text-white font-medium">{typeof movie.director === 'string' ? movie.director : (movie as any).director?.name || 'N/A'}</p>
									)}
								</div>

								{/* Financial Stats Section */}
								{((movie as any).budget || (movie as any).revenue || (movie.boxOffice && movie.boxOffice !== 'N/A')) && (
									<div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
										{(movie as any).budget && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Budget
												</h3>
												<p className="text-2xl font-bold text-white">{(movie as any).budget}</p>
											</div>
										)}

										{(movie as any).revenue && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Revenue
												</h3>
												<p className="text-2xl font-bold text-white">{(movie as any).revenue}</p>
											</div>
										)}

										{movie.boxOffice && movie.boxOffice !== 'N/A' && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Box Office
												</h3>
												<p className="text-2xl font-bold text-white">{movie.boxOffice}</p>
											</div>
										)}
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
							{movie.actors.map((actor: any, index: number) => (
								<PersonCard
									key={index}
									personId={actor.id}
									name={actor.name || actor}
									role={actor.character || 'Actor'}
									profilePath={actor.profilePath}
								/>
							))}
						</div>
					</div>
				</section>
			)}

			{/* Recommendations Section */}
			{isTMDbId && recommendations && recommendations.length > 0 && (
				<section className="relative z-10 bg-black border-t border-white/5">
					<div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
						<MovieCarousel title="You May Also Like" movies={recommendations.slice(0, 12)} />
					</div>
				</section>
			)}

			{/* Similar Movies Section */}
			{isTMDbId && similarMovies && similarMovies.length > 0 && (
				<section className="relative z-10 bg-zinc-950 border-t border-white/5">
					<div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
						<MovieCarousel title="Similar Movies" movies={similarMovies.slice(0, 12)} />
					</div>
				</section>
			)}
		</main>
	);
}
