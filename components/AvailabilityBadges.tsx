'use client';

import type { MediaAvailability } from '@/lib/availability';
import { STREAMING_SERVICES } from '@/lib/services';
import { cn } from '@/lib/cn';

interface AvailabilityBadgesProps {
	availability: MediaAvailability | null | undefined;
	className?: string;
}

/** Nome breve del servizio (es. "Amazon Prime Video" → "Prime Video"). */
function shortName(id: number, name: string): string {
	return STREAMING_SERVICES.find((s) => s.providerId === id)?.name ?? name;
}

/**
 * Badge in vetro sul poster: il primo servizio in abbonamento, altrimenti
 * "Noleggio" o "Acquisto" (dati TMDB / JustWatch per la regione dell'utente).
 */
export default function AvailabilityBadges({ availability, className = '' }: AvailabilityBadgesProps) {
	if (!availability) return null;

	const stream = availability.stream[0];
	const label = stream
		? shortName(stream.id, stream.name)
		: availability.rent.length
			? 'Noleggio'
			: availability.buy.length
				? 'Acquisto'
				: null;
	if (!label) return null;

	const providers = stream ? availability.stream : availability.rent.length ? availability.rent : availability.buy;
	const prefix = stream ? 'In streaming su' : availability.rent.length ? 'Noleggio su' : 'Acquisto su';

	return (
		<span
			title={`${prefix} ${providers.map((p) => p.name).join(', ')}`}
			className={cn(
				'pointer-events-none max-w-[70%] truncate px-2 py-1 rounded-lg glass text-fg text-[10px] md:text-[11px] font-bold leading-none',
				className
			)}
		>
			{label}
		</span>
	);
}
