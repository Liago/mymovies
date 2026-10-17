'use client';

import { Star } from 'lucide-react';
import { useRatings } from '@/context/RatingsContext';
import { cn } from '@/lib/cn';

interface UserRatingProps {
	mediaType: 'movie' | 'tv';
	mediaId: number;
	title: string;
	poster: string | null;
}

/** "Il tuo voto": 10 stelle cliccabili; un secondo click sullo stesso voto lo rimuove. */
export default function UserRating({ mediaType, mediaId, title, poster }: UserRatingProps) {
	const { getRating, rateMedia, deleteRating } = useRatings();
	const current = getRating(mediaId, mediaType) ?? 0;

	const set = (value: number) => {
		if (value === current) deleteRating(mediaId, mediaType);
		else rateMedia(mediaId, mediaType, value, title, poster);
	};

	return (
		<div className="border-t border-line pt-3.5 flex flex-col gap-2">
			<span className="flex items-center justify-between text-[12px] font-bold text-fg3">
				Il tuo voto
				{current > 0 && <span className="text-acc">{current}/10</span>}
			</span>
			<div className="flex gap-0.5" role="radiogroup" aria-label="Il tuo voto">
				{Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
					<button
						key={value}
						type="button"
						role="radio"
						aria-checked={value === current}
						aria-label={`${value} su 10`}
						onClick={() => set(value)}
						className={cn(
							'p-px transition-[color,transform] duration-150 hover:scale-110',
							value <= current ? 'text-acc' : 'text-line hover:text-fg3'
						)}
					>
						<Star size={19} className={value <= current ? 'fill-current' : ''} />
					</button>
				))}
			</div>
		</div>
	);
}
