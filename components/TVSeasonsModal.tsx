'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Calendar, Clock, Star, X, Layers, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useTracker } from '@/context/TrackerContext';
import { fetchTVSeasonDetails } from '@/app/actions';
import { createPortal } from 'react-dom';

interface TVSeasonsModalProps {
	isOpen: boolean;
	onClose: () => void;
	tvId: number;
	numberOfSeasons: number;
	language?: string;
	title: string;
	poster: string | null;
}

interface Episode {
	id: number;
	name: string;
	overview: string;
	episodeNumber: number;
	seasonNumber: number;
	airDate: string;
	stillPath: string | null;
	voteAverage: number;
	runtime: number;
	guestStars: {
		id: number;
		name: string;
		character: string;
		profilePath: string | null;
	}[];
}

interface Season {
	id: number;
	name: string;
	overview: string;
	airDate: string;
	posterPath: string | null;
	seasonNumber: number;
	voteAverage: number;
	episodes: Episode[];
}

export default function TVSeasonsModal({ isOpen, onClose, tvId, numberOfSeasons, language = 'en-US', title, poster }: TVSeasonsModalProps) {
	const { isWatched, toggleWatched, markSeasonWatched } = useTracker();
	const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
	const [seasonData, setSeasonData] = useState<Map<number, Season>>(new Map());
	const [loadingSeasons, setLoadingSeasons] = useState<Set<number>>(new Set());

	// Prevent scrolling when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const toggleSeason = async (seasonNumber: number) => {
		const newExpanded = new Set(expandedSeasons);

		if (newExpanded.has(seasonNumber)) {
			newExpanded.delete(seasonNumber);
		} else {
			newExpanded.add(seasonNumber);

			// Fetch season data if not already loaded
			if (!seasonData.has(seasonNumber)) {
				setLoadingSeasons(prev => new Set(prev).add(seasonNumber));
				try {
					const data = await fetchTVSeasonDetails(tvId, seasonNumber);
					if (data) {
						setSeasonData(prev => new Map(prev).set(seasonNumber, data));
					}
				} catch (error) {
					console.error('Error fetching season details:', error);
				} finally {
					setLoadingSeasons(prev => {
						const newSet = new Set(prev);
						newSet.delete(seasonNumber);
						return newSet;
					});
				}
			}
		}

		setExpandedSeasons(newExpanded);
	};

	// Generate season numbers (starting from 1)
	const seasons = Array.from({ length: numberOfSeasons }, (_, i) => i + 1);

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<div
				className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal Content */}
			<div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50">
					<div>
						<h2 className="text-xl font-bold text-white flex items-center gap-2">
							<Layers className="text-primary" size={20} />
							Seasons & Episodes
						</h2>
						<p className="text-sm text-zinc-400">{title}</p>
					</div>
					<button
						onClick={onClose}
						className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
					>
						<X size={24} />
					</button>
				</div>

				{/* Scrollable Content */}
				<div className="flex-1 overflow-y-auto p-6 space-y-4">
					{seasons.map((seasonNumber) => {
						const isExpanded = expandedSeasons.has(seasonNumber);
						const season = seasonData.get(seasonNumber);
						const isLoading = loadingSeasons.has(seasonNumber);

						return (
							<div
								key={seasonNumber}
								className="rounded-xl overflow-hidden bg-zinc-900/50 border border-white/5"
							>
								{/* Season Header */}
								<button
									onClick={() => toggleSeason(seasonNumber)}
									className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
								>
									<div className="flex items-center gap-4">
										<div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg transition-colors ${isExpanded
											? 'bg-primary text-white'
											: 'bg-white/10 text-zinc-400 group-hover:bg-white/20 group-hover:text-white'
											}`}>
											{seasonNumber}
										</div>
										<div>
											<h3 className={`text-lg font-bold transition-colors ${isExpanded ? 'text-white' : 'text-zinc-400 group-hover:text-white'
												}`}>
												Season {seasonNumber}
											</h3>
											{season && (
												<div className="flex items-center gap-2 text-xs text-zinc-500">
													<span>{season.episodes.length} Episodes</span>
													{isExpanded && (
														<button
															onClick={(e) => {
																e.stopPropagation();
																markSeasonWatched(tvId, seasonNumber, season.episodes, { name: title, poster });
															}}
															className="ml-2 hover:text-primary transition-colors flex items-center gap-1 z-10 relative"
														>
															<CheckCircle2 size={12} />
															Mark all seen
														</button>
													)}
												</div>
											)}
										</div>
									</div>
									<ChevronDown
										size={20}
										className={`text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : 'group-hover:text-white'
											}`}
									/>
								</button>

								{/* Season Content */}
								{isExpanded && (
									<div className="border-t border-white/5 bg-black/20">
										{isLoading ? (
											<div className="px-6 py-12 text-center">
												<div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
												<p className="text-zinc-500 text-sm mt-3">Loading episodes...</p>
											</div>
										) : season ? (
											<div className="p-4 space-y-3">
												{/* Season Overview */}
												{season.overview && (
													<div className="mb-4 text-sm text-zinc-400 leading-relaxed px-2">
														{season.overview}
													</div>
												)}

												{/* Episodes List */}
												<div className="space-y-2">
													{season.episodes.map((episode) => {
														const isSeen = isWatched(tvId, season.seasonNumber, episode.episodeNumber);
														const isAired = episode.airDate && new Date(episode.airDate) < new Date();

														return (
															<div
																key={episode.id}
																className={`rounded-lg border p-3 transition-all duration-200 group relative ${isSeen
																	? 'bg-primary/5 border-primary/20'
																	: 'bg-white/5 border-white/5 hover:border-white/10'
																	}`}
															>
																<div className="flex gap-3">
																	{/* Episode Still/Thumbnail */}
																	{episode.stillPath && (
																		<div className="flex-shrink-0 w-32 h-20 rounded-md overflow-hidden bg-zinc-800 relative group-hover/image">
																			<img
																				src={episode.stillPath}
																				alt={episode.name}
																				className={`w-full h-full object-cover transition-all ${isSeen ? 'grayscale opacity-50' : 'opacity-80 group-hover:opacity-100'}`}
																			/>
																			{isSeen && (
																				<div className="absolute inset-0 flex items-center justify-center bg-black/40">
																					<CheckCircle2 className="text-primary w-8 h-8 drop-shadow-lg" />
																				</div>
																			)}
																		</div>
																	)}

																	{/* Episode Info */}
																	<div className="flex-1 min-w-0 py-0.5">
																		<div className="flex items-start justify-between gap-3 mb-1">
																			<div className="min-w-0">
																				<div className="flex items-center gap-2 mb-0.5">
																					<span className={`text-xs font-mono ${isSeen ? 'text-primary' : 'text-primary/80'}`}>
																						E{episode.episodeNumber}
																					</span>
																					<h4 className={`font-medium text-sm truncate pr-2 ${isSeen ? 'text-primary/90' : 'text-white'}`}>
																						{episode.name}
																					</h4>
																				</div>
																			</div>

																			{/* Action Button */}
																			<button
																				onClick={() => toggleWatched(tvId, season.seasonNumber, episode.episodeNumber, { name: title, poster })}
																				className={`p-1.5 rounded-full transition-colors ${isSeen
																					? 'text-primary bg-primary/10 hover:bg-primary/20'
																					: 'text-zinc-400 hover:text-white hover:bg-white/10'
																					}`}
																				title={isSeen ? "Mark as unwatched" : "Mark as watched"}
																			>
																				{isSeen ? <Eye size={16} /> : <EyeOff size={16} />}
																			</button>
																		</div>

																		<div className="flex items-center gap-3 text-[10px] text-zinc-500 mb-2">
																			{episode.airDate && (
																				<span className={`flex items-center gap-1 ${!isSeen && isAired ? 'text-yellow-500/80 font-medium' : ''}`}>
																					<Calendar size={10} />
																					{episode.airDate}
																					{!isSeen && isAired && " (Available)"}
																				</span>
																			)}
																			{episode.runtime > 0 && (
																				<span className="flex items-center gap-1">
																					<Clock size={10} />
																					{episode.runtime}m
																				</span>
																			)}
																			{episode.voteAverage > 0 && (
																				<span className="flex items-center gap-1 text-zinc-400">
																					<Star size={10} className="text-yellow-500/80 fill-yellow-500/80" />
																					{episode.voteAverage.toFixed(1)}
																				</span>
																			)}
																		</div>

																		{episode.overview && (
																			<p className={`text-xs line-clamp-2 leading-relaxed ${isSeen ? 'text-zinc-500' : 'text-zinc-400'}`}>
																				{episode.overview}
																			</p>
																		)}
																	</div>
																</div>
															</div>
														)
													})}
												</div>
											</div>
										) : (
											<div className="px-6 py-8 text-center">
												<p className="text-red-400 text-sm flex items-center justify-center gap-2">
													<span className="w-2 h-2 rounded-full bg-red-500"></span>
													Failed to load season details
												</p>
											</div>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</div>,
		document.body
	);
}
