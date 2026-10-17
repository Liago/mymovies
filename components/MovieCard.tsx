'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { CalendarClock } from 'lucide-react';
import AvailabilityBadges from './AvailabilityBadges';
import Artwork from './ui/Artwork';
import { useAvailability } from '@/hooks/useAvailability';
import { formatRating } from '@/lib/format';
import { cn } from '@/lib/cn';

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
	/** Testo del badge in alto a destra al posto del servizio (es. "Al cinema"). */
	badge?: string | null;
	/** Riga sotto il titolo; default "Film · 2024". */
	subtitle?: string | null;
	/** Posizione del badge voto. */
	ratingPlacement?: 'left' | 'right';
	/** Raggio più piccolo per le griglie fitte su mobile. */
	compact?: boolean;
}

/** Poster 2:3 con badge in vetro (voto e servizio), titolo e meta. */
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
	badge,
	subtitle,
	ratingPlacement = 'left',
	compact = false,
}: MovieCardProps) {
	const cardRef = useRef<HTMLAnchorElement>(null);
	// Unreleased titles cannot be streamed, rented or bought yet: skip the lookup.
	const availability = useAvailability(cardRef, type, id, showAvailability && !badge && !premiereLabel);

	const showPremiere = !!premiereLabel && !(episodeProgress && episodeProgress.watched > 0);
	const ratingLabel = formatRating(rating);
	const meta = subtitle !== undefined ? subtitle : [type === 'tv' ? 'Serie' : 'Film', year].filter(Boolean).join(' · ');
	const glassBadge = 'absolute top-2 px-2 py-1 rounded-lg glass text-fg text-[10px] md:text-[11px] font-bold leading-none';

	return (
		<Link
			ref={cardRef}
			href={`/${type === 'tv' ? 'tv' : 'movie'}/${id}`}
			className="group flex flex-col gap-2 min-w-0 outline-none transition-opacity duration-200 ease-out hover:opacity-80 focus-visible:opacity-80"
		>
			<Artwork
				src={poster}
				alt={title}
				className={cn('aspect-[2/3] w-full', compact ? 'rounded-[12px]' : 'rounded-[12px] md:rounded-[14px]')}
			>
				{ratingLabel && (
					<span
						className={cn(glassBadge, ratingPlacement === 'left' ? 'left-2' : 'right-2')}
						title={`Voto medio: ${ratingLabel}/10`}
					>
						★ {ratingLabel}
					</span>
				)}

				{badge ? (
					<span className={cn(glassBadge, 'right-2')}>{badge}</span>
				) : (
					ratingPlacement === 'left' && (
						<AvailabilityBadges availability={availability} className="absolute top-2 right-2" />
					)
				)}

				{episodeProgress && episodeProgress.watched > 0 && (
					<div className="absolute inset-x-0 bottom-0 px-2.5 pt-6 pb-2.5 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2 text-white">
						<span className="text-[11px] font-bold whitespace-nowrap tabular-nums">
							{Math.min(episodeProgress.watched, episodeProgress.total)}/{episodeProgress.total}
						</span>
						<span className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden">
							<span
								className="block h-full rounded-full bg-acc"
								style={{ width: `${Math.min((episodeProgress.watched / Math.max(episodeProgress.total, 1)) * 100, 100)}%` }}
							/>
						</span>
					</div>
				)}

				{showPremiere && (
					<div className="absolute inset-x-2 bottom-2 px-2 py-1.5 rounded-lg glass text-fg flex items-center gap-1.5">
						<CalendarClock size={12} className="text-acc shrink-0" />
						<span className="text-[11px] font-bold truncate">{premiereLabel}</span>
					</div>
				)}
			</Artwork>
			<span className={cn('font-bold px-0.5 line-clamp-1', compact ? 'text-[12px] md:text-[14px]' : 'text-[14px]')}>{title}</span>
			{meta && <span className="text-[12px] font-medium text-fg3 -mt-1.5 px-0.5 line-clamp-1">{meta}</span>}
		</Link>
	);
}
