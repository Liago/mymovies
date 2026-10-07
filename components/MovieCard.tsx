'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { Star, Play, CalendarClock } from 'lucide-react';
import ActionButtons from './ActionButtons';
import AvailabilityBadges from './AvailabilityBadges';
import { useAvailability } from '@/hooks/useAvailability';
import { useLanguage } from '@/context/LanguageContext';

interface MovieCardProps {
	id: number | string;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	type?: 'movie' | 'tv';
	episodeProgress?: { watched: number; total: number };
	/** Formatted premiere date, shown as a badge for titles not yet released. */
	premiereLabel?: string | null;
	/** Show streaming / rent / buy badges on the poster (loaded lazily). */
	showAvailability?: boolean;
}

function ratingTone(rating: number): string {
	if (rating >= 7) return 'text-emerald-400';
	if (rating >= 5.5) return 'text-yellow-400';
	return 'text-orange-400';
}

export default function MovieCard({
	id,
	title,
	poster,
	rating,
	year,
	type = 'movie',
	episodeProgress,
	premiereLabel,
	showAvailability = true,
}: MovieCardProps) {
	const { t } = useLanguage();
	const cardRef = useRef<HTMLAnchorElement>(null);
	// Unreleased titles cannot be streamed, rented or bought yet: skip the lookup.
	const availability = useAvailability(cardRef, type, id, showAvailability && !premiereLabel);

	// A title that has not aired yet cannot have progress, so the two badges
	// never compete for the bottom strip — but keep progress the winner anyway.
	const showPremiere = !!premiereLabel && !(episodeProgress && episodeProgress.watched > 0);
	const hasRating = typeof rating === 'number' && rating > 0;

	return (
		<Link
			ref={cardRef}
			href={`/${type === 'tv' ? 'tv' : 'movie'}/${id}`}
			className="group relative block w-full outline-none"
		>
			<div className="relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 transition-all duration-300 md:group-hover:scale-105 md:group-hover:z-10 md:group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-transparent md:group-hover:border-primary/50">
				{poster ? (
					<img
						src={poster}
						alt={title}
						className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-800">
						<span className="text-xs">No Image</span>
					</div>
				)}

				{/* Average Rating Badge */}
				{hasRating && (
					<div
						className="absolute top-1.5 left-1.5 md:top-2 md:left-2 z-10 pointer-events-none"
						title={`${t('availability.rating')}: ${rating.toFixed(1)}/10`}
					>
						<div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm shadow-md">
							<Star size={10} className={`${ratingTone(rating)} fill-current`} />
							<span className="text-[10px] md:text-[11px] font-bold text-white tabular-nums leading-none">
								{rating.toFixed(1)}
							</span>
						</div>
					</div>
				)}

				{/* Streaming / Rent / Buy Badges */}
				<AvailabilityBadges
					availability={availability}
					className="absolute top-1.5 right-1.5 md:top-2 md:right-2 z-10"
				/>

				{/* Episode Progress Badge */}
				{episodeProgress && episodeProgress.watched > 0 && (
					<div className="absolute bottom-0 left-0 right-0 z-10">
						<div className="bg-black/80 backdrop-blur-sm px-2.5 py-1.5 flex items-center gap-2">
							<span className="text-[11px] font-semibold text-white whitespace-nowrap">
								{Math.min(episodeProgress.watched, episodeProgress.total)}/{episodeProgress.total} ep.
							</span>
							<div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
								<div
									className="h-full bg-emerald-500 rounded-full transition-all duration-500"
									style={{ width: `${Math.min((episodeProgress.watched / episodeProgress.total) * 100, 100)}%` }}
								/>
							</div>
						</div>
					</div>
				)}

				{/* Premiere Date Badge (titles not yet released) */}
				{showPremiere && (
					<div className="absolute bottom-0 left-0 right-0 z-10">
						<div className="bg-black/80 backdrop-blur-sm px-2.5 py-1.5 flex items-center gap-1.5">
							<CalendarClock size={12} className="text-primary flex-shrink-0" />
							<span className="text-[11px] font-semibold text-white truncate">{premiereLabel}</span>
						</div>
					</div>
				)}

				{/* Premium Glass Overlay on Hover */}
				<div className="absolute inset-0 z-20 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
					<div className="transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
						<div className="flex items-center justify-between mb-3 w-full">
							<button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-colors flex-shrink-0"
								onClick={(e) => {
									e.preventDefault();
									// Placeholder for play action
								}}
							>
								<Play size={14} fill="currentColor" className="ml-0.5" />
							</button>

							<ActionButtons
								mediaType={type}
								mediaId={id}
								title={title}
								poster={poster}
								showText={false}
								showRating={false}
								className="scale-75 origin-right"
							/>
						</div>

						<h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2">
							{title}
						</h3>

						<div className="flex items-center gap-2 text-[10px] font-medium text-gray-300">
							{hasRating && (
								<span className="text-green-400">{(rating * 10).toFixed(0)}% Match</span>
							)}
							<span className="px-1 py-0.5 border border-gray-600 rounded text-[9px] uppercase">{type}</span>
							<span>{year}</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
