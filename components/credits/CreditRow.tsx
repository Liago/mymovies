'use client';

import { useCallback, useState } from 'react';
import PersonModal from '@/components/PersonModal';
import Artwork from '@/components/ui/Artwork';

interface CreditRowProps {
	personId: number;
	name: string;
	role: string;
	profilePath: string | null;
	/** Dettaglio secondario (es. numero di episodi). */
	meta?: string | null;
}

/** Riga compatta con ritratto, nome e ruolo; apre la scheda persona al click. */
export default function CreditRow({ personId, name, role, profilePath, meta }: CreditRowProps) {
	const [isOpen, setIsOpen] = useState(false);
	const close = useCallback(() => setIsOpen(false), []);
	const imageUrl = profilePath
		? profilePath.startsWith('http')
			? profilePath
			: `https://image.tmdb.org/t/p/w185${profilePath}`
		: null;

	return (
		<>
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-3 p-2.5 pr-3.5 rounded-[14px] bg-card border border-line text-left min-w-0 transition-opacity hover:opacity-80"
			>
				<Artwork src={imageUrl} alt={name} className="w-12 h-12 rounded-full shrink-0" imgClassName="object-top" />
				<span className="flex flex-col min-w-0">
					<span className="text-[14px] font-bold truncate">{name}</span>
					{role && <span className="text-[12px] font-medium text-fg3 line-clamp-2">{role}</span>}
					{meta && <span className="text-[11px] font-semibold text-fg3 mt-0.5">{meta}</span>}
				</span>
			</button>
			<PersonModal personId={isOpen ? personId : null} onClose={close} />
		</>
	);
}
