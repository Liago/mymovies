import { getTVDetailTMDb, getTVTrailerTMDb, getTVReviews, getTVWatchProviders } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { ChevronLeft, Tv, Calendar, Layers } from 'lucide-react';
import Link from 'next/link';
import PersonCard from '@/components/PersonCard';
import TrailerButton from '@/components/TrailerButton';
import ReviewsButton from '@/components/ReviewsButton';
import ActionButtons from '@/components/ActionButtons';
import { fetchAccountStates, fetchSimilarTV, fetchTVRecommendations } from '@/app/actions';
import { cookies } from 'next/headers';
import MovieCarousel from '@/components/MovieCarousel';
import HistoryTracker from '@/components/HistoryTracker';
import TVSeasonsButton from '@/components/TVSeasonsButton';
import PosterImage from '@/components/PosterImage';
import BackButton from '@/components/BackButton';
import WatchProviders from '@/components/WatchProviders';
import AwardsSection from '@/components/AwardsSection';

export default async function TVDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';

	const tvId = parseInt(id);
	const [tvShow, trailerUrl, accountStates, similarShows, recommendations, reviews, watchProviders] = await Promise.all([
		getTVDetailTMDb(tvId, lang),
		getTVTrailerTMDb(tvId, lang),
		fetchAccountStates('tv', tvId),
		fetchSimilarTV(tvId),
		fetchTVRecommendations(tvId),
		getTVReviews(tvId, 1, lang),
		getTVWatchProviders(tvId, lang)
	]);

	if (!tvShow) {
		notFound();
	}

	const backdropUrl = (tvShow as any).backdrop || tvShow.poster?.replace('w500', 'original') || '';

	return (
		<main className="min-h-screen bg-black text-white">
			{/* Immersive Background */}
			<div className="fixed inset-0 z-0">
				<img
					src={backdropUrl}
					alt={tvShow.title}
					className="w-full h-full object-cover opacity-50 blur-xl scale-105"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
			</div>

			<div className="relative z-10">
				<div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pt-32">
					<BackButton fallbackHref="/tv" label="Back to TV Shows" />

					<div className="grid lg:grid-cols-[350px,1fr] gap-12 items-start">
						{/* Poster */}
						<div className="w-full max-w-[350px] mx-auto lg:mx-0">
							<div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 bg-zinc-900 border border-white/10 relative group">
								{tvShow.poster ? (
									<PosterImage
										src={tvShow.poster}
										alt={tvShow.title}
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-zinc-700">
										<Tv size={64} />
									</div>
								)}
								<div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
							</div>
						</div>

						{/* Info */}
						<div className="space-y-8">
							<div>
								<div className="flex flex-wrap items-center gap-3 mb-4">
									{tvShow.releaseDate && (
										<span className="px-3 py-1 rounded-full border border-white/20 bg-white/5 text-xs font-semibold text-zinc-300">
											{tvShow.releaseDate.split('-')[0]}
										</span>
									)}
									<span className="px-3 py-1 rounded-full border border-secondary/30 bg-secondary/10 text-xs font-semibold text-secondary uppercase tracking-wider">
										{tvShow.status}
									</span>
								</div>

								<h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
									{tvShow.title}
								</h1>

								<HistoryTracker
									id={tvId}
									title={tvShow.title}
									poster={tvShow.poster || null}
									type="tv"
								/>

								<div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium">
									{/* IMDb Rating */}
									<div className="flex items-center gap-2">
										<svg width="40" height="20" viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg">
											<rect width="64" height="32" rx="4" fill="#F5C518" />
											<text x="32" y="22" fontSize="16" fontWeight="bold" fontFamily="Arial, sans-serif" fill="#000" textAnchor="middle">IMDb</text>
										</svg>
										<span className="text-lg font-bold text-white">{typeof tvShow.rating.imdb === 'number' ? tvShow.rating.imdb.toFixed(1) : tvShow.rating.imdb}</span>
									</div>

									{/* Rotten Tomatoes Rating */}
									{tvShow.rating.rottenTomatoes !== null && tvShow.rating.rottenTomatoes !== undefined && (
										<div className="flex items-center gap-2">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
												<path d="M12 2C12 2 10.5 0.5 9 1C7.5 1.5 8 3 8 3C5 3 3 5.5 3 8.5C3 12.5 6 16 9 18.5C10 19.5 11 21 12 22C13 21 14 19.5 15 18.5C18 16 21 12.5 21 8.5C21 5.5 19 3 16 3C16 3 16.5 1.5 15 1C13.5 0.5 12 2 12 2Z" fill="#FA320A" />
												<ellipse cx="12" cy="7" rx="2" ry="1.5" fill="#8BC34A" transform="rotate(-15 12 7)" />
											</svg>
											<span className="text-lg font-bold text-white">{tvShow.rating.rottenTomatoes}%</span>
										</div>
									)}

									{/* Metascore Rating */}
									{(tvShow.rating as any).metascore && (
										<div className="flex items-center gap-2">
											<div className="w-10 h-6 rounded flex items-center justify-center bg-yellow-600 text-white font-bold text-sm">
												M
											</div>
											<span className="text-lg font-bold text-white">{(tvShow.rating as any).metascore}</span>
										</div>
									)}

									<TVSeasonsButton
										tvId={tvId}
										numberOfSeasons={tvShow.seasons}
										title={tvShow.title}
										language={lang}
										poster={tvShow.poster}
									/>
									<div className="flex items-center gap-2">
										<Calendar size={18} />
										<span>{tvShow.releaseDate?.split('-')[0] || 'N/A'}</span>
									</div>
								</div>
							</div>

							{tvShow.genres && tvShow.genres.length > 0 && (
								<div className="flex flex-wrap gap-2">
									{tvShow.genres.map((genre: string, index: number) => (
										<span
											key={index}
											className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium text-zinc-300"
										>
											{genre}
										</span>
									))}
								</div>
							)}

							<div className="flex flex-wrap gap-4 items-center">
								{trailerUrl && <TrailerButton trailerUrl={trailerUrl} />}
								<ReviewsButton
									reviews={reviews.results}
									title={tvShow.title}
									count={reviews.totalResults}
								/>
								<ActionButtons
									mediaType="tv"
									mediaId={parseInt(id)}
									title={tvShow.title}
									poster={tvShow.poster}
									initialState={accountStates}
									showText={true}
								/>
							</div>

							<div className="border-t border-white/10 pt-8">
								<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
									Synopsis
								</h2>
								<p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
									{tvShow.description}
								</p>
							</div>

							{/* Awards Section */}
							{(tvShow as any).awards && (
								<AwardsSection
									awards={(tvShow as any).awards}
									imdbId={(tvShow as any).imdbId}
									tmdbId={(tvShow as any).id}
									lang={lang}
								/>
							)}

							{/* Additional Info */}
							{((tvShow as any).writer || (tvShow as any).country || (tvShow as any).languages) && (
								<div className="border-t border-white/10 pt-8">
									<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
										Additional Information
									</h2>
									<div className="space-y-4">
										{(tvShow as any).writer && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Writer
												</h3>
												<p className="text-zinc-300">{(tvShow as any).writer}</p>
											</div>
										)}
										{(tvShow as any).country && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Country
												</h3>
												<p className="text-zinc-300">{(tvShow as any).country}</p>
											</div>
										)}
										{(tvShow as any).languages && (
											<div>
												<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
													Languages
												</h3>
												<p className="text-zinc-300">{(tvShow as any).languages}</p>
											</div>
										)}
									</div>
								</div>
							)}

							{/* Where to Watch */}
							{watchProviders && (
								<WatchProviders providers={watchProviders} lang={lang} />
							)}

							{/* Details Grid */}
							<div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t border-white/10">
								<div>
									<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
										Creators
									</h3>
									<p className="text-white font-medium">{tvShow.creators}</p>
								</div>

								<div>
									<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
										Episodes
									</h3>
									<p className="text-white font-medium">
										{tvShow.episodes}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>



			{/* Cast Section */}
			{tvShow.actors && tvShow.actors.length > 0 && (
				<section className="relative z-10 bg-zinc-950 border-t border-white/5">
					<div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
						<h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
							<span>Cast & Crew</span>
							<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
						</h2>
						<div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
							{tvShow.actors.map((actor: any, index: number) => (
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
			{recommendations && recommendations.length > 0 && (
				<section className="relative z-10 bg-black border-t border-white/5">
					<div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
						<MovieCarousel title="You May Also Like" movies={recommendations.slice(0, 12)} />
					</div>
				</section>
			)}

			{/* Similar TV Shows Section */}
			{similarShows && similarShows.length > 0 && (
				<section className="relative z-10 bg-zinc-950 border-t border-white/5">
					<div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
						<MovieCarousel title="Similar TV Shows" movies={similarShows.slice(0, 12)} />
					</div>
				</section>
			)}
		</main>
	);
}
