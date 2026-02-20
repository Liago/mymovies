'use client';

import { useEffect, useState } from 'react';
import { useTracker } from '@/context/TrackerContext';
import { useLanguage } from '@/context/LanguageContext';
import { getTimelineEpisodes, TimelineEpisode } from '@/app/actions/tmdb-timeline';
import { Calendar, CheckCircle2, Circle, Clock, Tv } from 'lucide-react';
import Link from 'next/link';

export default function TimelinePage() {
	const { watchedShows, watchedEpisodes, toggleWatched, isWatched } = useTracker();
	const { language } = useLanguage();
	const [episodes, setEpisodes] = useState<TimelineEpisode[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showWatched, setShowWatched] = useState(true);

	useEffect(() => {
		const savedOption = localStorage.getItem('cine_timeline_show_watched');
		if (savedOption !== null) {
			setShowWatched(savedOption === 'true');
		}
	}, []);

	useEffect(() => {
		localStorage.setItem('cine_timeline_show_watched', String(showWatched));
	}, [showWatched]);

	useEffect(() => {
		const loadTimeline = async () => {
			setIsLoading(true);
			if (watchedShows.size > 0) {
				const showIds = Array.from(watchedShows.keys());
				const data = await getTimelineEpisodes(showIds, language);
				setEpisodes(data);
			} else {
				setEpisodes([]);
			}
			setIsLoading(false);
		};

		loadTimeline();
	}, [watchedShows, language]);

	const filteredEpisodes = episodes.filter(ep => {
		if (showWatched) return true;
		return !isWatched(ep.showId, ep.seasonNumber, ep.episodeNumber);
	});

	if (isLoading) {
		return (
			<div className="min-h-screen pt-32 flex justify-center">
				<div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
			</div>
		);
	}

	if (watchedShows.size === 0) {
		return (
			<div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
				<div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
					<Tv size={48} className="text-zinc-600" />
				</div>
				<h1 className="text-2xl font-bold text-white mb-2">
					{language === 'it-IT' ? 'Nessuna serie monitorata' : 'No shows tracked yet'}
				</h1>
				<p className="text-zinc-400 max-w-md mb-8">
					{language === 'it-IT'
						? 'Inizia a monitorare le tue serie TV preferite per vedere i nuovi episodi qui.'
						: 'Start tracking your favorite TV shows to see new episodes here.'}
				</p>
				<Link
					href="/tv"
					className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors"
				>
					{language === 'it-IT' ? 'Sfoglia Serie TV' : 'Browse TV Shows'}
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen pt-32 px-6 md:px-12 pb-12">
			<div className="max-w-4xl mx-auto">
				<header className="mb-12">
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
						<div>
							<h1 className="text-4xl font-black text-white mb-2">Timeline</h1>
							<p className="text-zinc-400">
								{language === 'it-IT'
									? 'Gli episodi più recenti e le prossime uscite delle serie che segui.'
									: 'The most recent and upcoming episodes from the shows you track.'}
							</p>
						</div>

						{episodes.length > 0 && (
							<button
								onClick={() => setShowWatched(!showWatched)}
								className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${showWatched
									? 'bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700'
									: 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
									}`}
							>
								{showWatched ? (
									<>
										<Circle size={16} />
										{language === 'it-IT' ? 'Nascondi Visti' : 'Hide Watched'}
									</>
								) : (
									<>
										<CheckCircle2 size={16} />
										{language === 'it-IT' ? 'Mostra Visti' : 'Show Watched'}
									</>
								)}
							</button>
						)}
					</div>
				</header>

				{filteredEpisodes.length === 0 ? (
					<div className="text-center py-12 text-zinc-500 bg-zinc-900/30 rounded-2xl border border-white/5">
						<Calendar size={48} className="mx-auto mb-4 opacity-50" />
						<p>{language === 'it-IT' ? 'Nessun episodio da mostrare in questo momento.' : 'No episodes to show right now.'}</p>
					</div>
				) : (
					<div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
						{filteredEpisodes.map((ep, index) => {
							const watched = isWatched(ep.showId, ep.seasonNumber, ep.episodeNumber);
							const date = ep.airDate ? new Date(ep.airDate) : null;
							const formattedDate = date ? new Intl.DateTimeFormat(language, {
								weekday: 'long',
								day: 'numeric',
								month: 'long',
								year: 'numeric'
							}).format(date) : (language === 'it-IT' ? 'Data da definirsi' : 'TBD');

							return (
								<div key={`${ep.showId}-${ep.id}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group md:is-active">
									{/* Timeline marker */}
									<div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-shrink-0 z-10 ${ep.isUpcoming ? 'bg-zinc-800 text-zinc-400' : (watched ? 'bg-primary text-white' : 'bg-zinc-700 text-white')}`}>
										{ep.isUpcoming ? <Clock size={16} /> : (watched ? <CheckCircle2 size={16} /> : <Circle size={16} />)}
									</div>

									{/* Card */}
									<div className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/80 backdrop-blur border border-white/5 p-4 rounded-2xl hover:border-white/10 transition-colors shadow-xl ${watched ? 'opacity-60' : ''}`}>
										<div className="flex gap-4">
											<div className="w-20 shrink-0 hidden sm:block">
												{ep.stillPath ? (
													<img src={ep.stillPath} alt={ep.name} className="w-full h-auto rounded-lg object-cover aspect-video" />
												) : ep.showPoster ? (
													<img src={ep.showPoster} alt={ep.showName} className="w-full h-auto rounded-lg object-cover aspect-[2/3]" />
												) : (
													<div className="w-full aspect-video bg-zinc-800 rounded-lg flex items-center justify-center">
														<Tv size={24} className="text-zinc-600" />
													</div>
												)}
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex justify-between items-start mb-1">
													<div>
														<Link href={`/tv/${ep.showId}`} className="text-xs font-bold text-primary hover:underline line-clamp-1 truncate block mb-0.5">
															{ep.showName}
														</Link>
														<div className="text-sm font-medium text-white line-clamp-1">{ep.seasonNumber}x{ep.episodeNumber.toString().padStart(2, '0')} - {ep.name}</div>
													</div>

													{!ep.isUpcoming && (
														<button
															onClick={() => toggleWatched(ep.showId, ep.seasonNumber, ep.episodeNumber, { name: ep.showName, poster: ep.showPoster })}
															className={`p-1.5 rounded-full hover:bg-white/10 transition-colors shrink-0 ml-2 ${watched ? 'text-primary' : 'text-zinc-500'}`}
															title={watched ? (language === 'it-IT' ? 'Segnato come visto' : 'Marked as watched') : (language === 'it-IT' ? 'Segna come visto' : 'Mark as watched')}
														>
															<CheckCircle2 size={20} className={watched ? 'fill-primary/20' : ''} />
														</button>
													)}
												</div>

												<div className="text-xs text-zinc-400 capitalize mb-2">{formattedDate}</div>

												{ep.overview && (
													<p className="text-xs text-zinc-500 line-clamp-2 md:line-clamp-3">{ep.overview}</p>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</div>
	);
}
