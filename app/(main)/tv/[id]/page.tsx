import { getTVDetailTMDb, getTVTrailerTMDb } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Star, ChevronLeft, Tv, Calendar, Layers } from 'lucide-react';
import Link from 'next/link';
import PersonCard from '@/components/PersonCard';
import TrailerButton from '@/components/TrailerButton';

export default async function TVDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	const tvShow = await getTVDetailTMDb(parseInt(id));
	const trailerUrl = await getTVTrailerTMDb(parseInt(id));

	if (!tvShow) {
		notFound();
	}

	const backdropUrl = tvShow.poster?.replace('w500', 'original') || '';

	return (
		<main className="min-h-screen bg-black text-white">
			{/* Immersive Background */}
			<div className="fixed inset-0 z-0">
				<img
					src={backdropUrl}
					alt={tvShow.title}
					className="w-full h-full object-cover opacity-30 blur-3xl scale-110"
				/>
				<div className="absolute inset-0 bg-black/80" />
			</div>

			<div className="relative z-10">
				<div className="max-w-7xl mx-auto px-6 md:px-12 py-12 pt-32">
					<Link
						href="/tv"
						className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-8 transition-colors group"
					>
						<ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
						<span className="text-sm font-medium">Back to TV Shows</span>
					</Link>

					<div className="grid lg:grid-cols-[350px,1fr] gap-12 items-start">
						{/* Poster */}
						<div className="w-full max-w-[350px] mx-auto lg:mx-0">
							<div className="aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 bg-zinc-900 border border-white/10 relative group">
								{tvShow.poster ? (
									<img
										src={tvShow.poster}
										alt={tvShow.title}
										className="w-full h-full object-cover"
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

								<div className="flex flex-wrap items-center gap-6 text-sm text-zinc-400 font-medium">
									<div className="flex items-center gap-2 text-green-400">
										<Star className="fill-green-400 text-green-400" size={18} />
										<span className="text-lg font-bold">{tvShow.rating.imdb.toFixed(1)}</span>
										<span className="text-xs opacity-70">IMDb</span>
									</div>
									<div className="flex items-center gap-2">
										<Layers size={18} />
										<span>{tvShow.seasons} Seasons</span>
									</div>
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

							{trailerUrl && (
								<div className="flex gap-4">
									<TrailerButton trailerUrl={trailerUrl} />
								</div>
							)}

							<div className="border-t border-white/10 pt-8">
								<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">
									Synopsis
								</h2>
								<p className="text-lg md:text-xl text-zinc-300 leading-relaxed font-light">
									{tvShow.description}
								</p>
							</div>

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

								{tvShow.rating.rottenTomatoes && (
									<div>
										<h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
											Score
										</h3>
										<p className="text-white font-medium">{tvShow.rating.rottenTomatoes}%</p>
									</div>
								)}
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
							{tvShow.actors.map((actor: string, index: number) => (
								<PersonCard key={index} name={actor} role="Actor" />
							))}
						</div>
					</div>
				</section>
			)}
		</main>
	);
}
