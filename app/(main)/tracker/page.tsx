'use client';

import { useTracker } from '@/context/TrackerContext';
import { Eye, Clock, CheckCircle2, ChevronRight, Tv } from 'lucide-react';
import Link from 'next/link';

export default function TrackerPage() {
	const { watchedShows, watchedEpisodes } = useTracker();

	const shows = Array.from(watchedShows.values()).sort((a, b) => b.lastUpdated - a.lastUpdated);

	// Calculate stats for each show
	const showStats = shows.map(show => {
		const showEpisodes = Array.from(watchedEpisodes).filter(key => key.startsWith(`${show.id}:`));
		return {
			...show,
			watchedCount: showEpisodes.length
		};
	});

	if (shows.length === 0) {
		return (
			<div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
				<div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
					<Tv size={48} className="text-zinc-600" />
				</div>
				<h1 className="text-2xl font-bold text-white mb-2">No shows tracked yet</h1>
				<p className="text-zinc-400 max-w-md mb-8">
					Start tracking your TV shows by marking episodes as watched on any TV show detail page.
				</p>
				<Link
					href="/tv"
					className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors"
				>
					Browse TV Shows
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen pt-32 px-6 md:px-12 pb-12">
			<div className="max-w-7xl mx-auto">
				<header className="mb-12">
					<h1 className="text-4xl font-black text-white mb-2">Your Tracker</h1>
					<p className="text-zinc-400">Keep track of your watched episodes and progress.</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{showStats.map((show) => (
						<Link
							key={show.id}
							href={`/tv/${show.id}`}
							className="group bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:scale-[1.02] flex flex-col"
						>
							<div className="aspect-video relative overflow-hidden bg-zinc-800">
								{show.poster ? (
									<img
										src={show.poster.replace('w500', 'w780')} // Use wider image for backdrop style card
										alt={show.name}
										className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
									/>
								) : (
									<div className="w-full h-full flex items-center justify-center text-zinc-700">
										<Tv size={48} />
									</div>
								)}
								<div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
								<div className="absolute bottom-4 left-4 right-4">
									<h2 className="text-xl font-bold text-white line-clamp-1 mb-1">{show.name}</h2>
									<div className="flex items-center gap-2 text-xs text-primary font-medium">
										<CheckCircle2 size={12} />
										<span>{show.watchedCount} Episodes Watched</span>
									</div>
								</div>
							</div>

							<div className="p-4 flex items-center justify-between text-zinc-400 group-hover:text-white transition-colors">
								<span className="text-sm">Last watched {new Date(show.lastUpdated).toLocaleDateString()}</span>
								<ChevronRight size={16} />
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
