'use client';

import { useState } from 'react';
import { ChevronDown, Calendar, Clock, Star, User } from 'lucide-react';
import { getTVSeasonDetails } from '@/lib/tmdb';

interface TVSeasonsProps {
	tvId: number;
	numberOfSeasons: number;
	language?: string;
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

export default function TVSeasons({ tvId, numberOfSeasons, language = 'en-US' }: TVSeasonsProps) {
	const [expandedSeasons, setExpandedSeasons] = useState<Set<number>>(new Set());
	const [seasonData, setSeasonData] = useState<Map<number, Season>>(new Map());
	const [loadingSeasons, setLoadingSeasons] = useState<Set<number>>(new Set());

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
					const data = await getTVSeasonDetails(tvId, seasonNumber, language);
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

	// Generate season numbers (starting from 1, season 0 is usually specials)
	const seasons = Array.from({ length: numberOfSeasons }, (_, i) => i + 1);

	return (
		<div className="space-y-4">
			{seasons.map((seasonNumber) => {
				const isExpanded = expandedSeasons.has(seasonNumber);
				const season = seasonData.get(seasonNumber);
				const isLoading = loadingSeasons.has(seasonNumber);

				return (
					<div
						key={seasonNumber}
						className="rounded-2xl overflow-hidden bg-zinc-900 border border-white/10"
					>
						{/* Season Header */}
						<button
							onClick={() => toggleSeason(seasonNumber)}
							className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors group"
						>
							<div className="flex items-center gap-4">
								<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-black font-bold text-lg">
									{seasonNumber}
								</div>
								<div>
									<h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
										Season {seasonNumber}
									</h3>
									{season && (
										<p className="text-sm text-zinc-400">
											{season.episodes.length} Episodes
										</p>
									)}
								</div>
							</div>
							<ChevronDown
								size={24}
								className={`text-zinc-400 transition-transform ${
									isExpanded ? 'rotate-180' : ''
								}`}
							/>
						</button>

						{/* Season Content */}
						{isExpanded && (
							<div className="border-t border-white/10">
								{isLoading ? (
									<div className="px-6 py-12 text-center">
										<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
										<p className="text-zinc-400 mt-4">Loading episodes...</p>
									</div>
								) : season ? (
									<div className="p-6 space-y-4">
										{/* Season Overview */}
										{season.overview && (
											<div className="pb-4 border-b border-white/10">
												<p className="text-zinc-300 leading-relaxed">{season.overview}</p>
											</div>
										)}

										{/* Episodes List */}
										<div className="space-y-3">
											{season.episodes.map((episode) => (
												<div
													key={episode.id}
													className="rounded-xl bg-black/50 border border-white/5 p-4 hover:border-white/20 transition-colors group"
												>
													<div className="flex gap-4">
														{/* Episode Still/Thumbnail */}
														{episode.stillPath && (
															<div className="flex-shrink-0 w-40 h-24 rounded-lg overflow-hidden bg-zinc-800">
																<img
																	src={episode.stillPath}
																	alt={episode.name}
																	className="w-full h-full object-cover"
																/>
															</div>
														)}

														{/* Episode Info */}
														<div className="flex-1 min-w-0">
															<div className="flex items-start justify-between gap-4 mb-2">
																<div className="flex-1 min-w-0">
																	<div className="flex items-center gap-2 mb-1">
																		<span className="px-2 py-0.5 rounded bg-white/10 text-xs font-semibold text-zinc-400">
																			E{episode.episodeNumber}
																		</span>
																		<h4 className="font-bold text-white group-hover:text-primary transition-colors truncate">
																			{episode.name}
																		</h4>
																	</div>
																	<div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
																		{episode.airDate && (
																			<div className="flex items-center gap-1">
																				<Calendar size={14} />
																				<span>{new Date(episode.airDate).toLocaleDateString()}</span>
																			</div>
																		)}
																		{episode.runtime && (
																			<div className="flex items-center gap-1">
																				<Clock size={14} />
																				<span>{episode.runtime} min</span>
																			</div>
																		)}
																		{episode.voteAverage > 0 && (
																			<div className="flex items-center gap-1">
																				<Star size={14} className="text-yellow-500 fill-yellow-500" />
																				<span className="text-white font-semibold">{episode.voteAverage.toFixed(1)}</span>
																			</div>
																		)}
																	</div>
																</div>
															</div>

															{/* Episode Overview */}
															{episode.overview && (
																<p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 mb-2">
																	{episode.overview}
																</p>
															)}

															{/* Guest Stars */}
															{episode.guestStars.length > 0 && (
																<div className="mt-2 pt-2 border-t border-white/5">
																	<div className="flex items-center gap-2 text-xs text-zinc-500">
																		<User size={14} />
																		<span>Guest Stars:</span>
																		<span className="text-zinc-400">
																			{episode.guestStars.slice(0, 3).map(g => g.name).join(', ')}
																			{episode.guestStars.length > 3 && ` +${episode.guestStars.length - 3} more`}
																		</span>
																	</div>
																</div>
															)}
														</div>
													</div>
												</div>
											))}
										</div>
									</div>
								) : (
									<div className="px-6 py-12 text-center text-zinc-500">
										Failed to load season details
									</div>
								)}
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
}
