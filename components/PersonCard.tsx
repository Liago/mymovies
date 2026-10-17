'use client';

import { useCallback, useState } from 'react';
import PersonModal from './PersonModal';
import Artwork from './ui/Artwork';

interface PersonCardProps {
	personId?: number;
	name: string;
	role: string;
	profilePath?: string | null;
	/** Diametro del ritratto in px (88 film, 104 serie). */
	size?: number;
}

/** Ritratto circolare con nome e ruolo; apre la scheda persona al click. */
export default function PersonCard({ personId, name, role, profilePath, size = 88 }: PersonCardProps) {
	const [isOpen, setIsOpen] = useState(false);
	const close = useCallback(() => setIsOpen(false), []);
	const imageUrl = profilePath
		? profilePath.startsWith('http')
			? profilePath
			: `https://image.tmdb.org/t/p/w300${profilePath}`
		: null;

	return (
		<>
			<button
				type="button"
				onClick={() => personId && setIsOpen(true)}
				disabled={!personId}
				className="flex flex-col items-center text-center gap-1.5 min-w-0 transition-opacity hover:opacity-80 disabled:cursor-default"
			>
				<Artwork src={imageUrl} alt={name} className="rounded-full shrink-0" imgClassName="object-top">
					<span className="block" style={{ width: size, height: size }} />
				</Artwork>
				<span className="text-[13px] md:text-[14px] font-bold mt-1 line-clamp-2">{name}</span>
				{role && <span className="text-[12px] font-medium text-fg3 -mt-1 line-clamp-2">{role}</span>}
			</button>
			<PersonModal personId={isOpen && personId ? personId : null} onClose={close} />
		</>
	);
}
