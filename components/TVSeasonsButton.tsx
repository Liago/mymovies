'use client';

import { useState } from 'react';
import { Layers } from 'lucide-react';
import TVSeasonsModal from './TVSeasonsModal';

interface TVSeasonsButtonProps {
	tvId: number;
	numberOfSeasons: number;
	title: string;
	language?: string;
	poster?: string | null;
}

export default function TVSeasonsButton({ tvId, numberOfSeasons, title, language, poster }: TVSeasonsButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer"
			>
				<Layers size={18} className="text-zinc-400 group-hover:text-primary transition-colors" />
				<span className="text-zinc-300 group-hover:text-white transition-colors">{numberOfSeasons} Seasons</span>
			</button>

			<TVSeasonsModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				tvId={tvId}
				numberOfSeasons={numberOfSeasons}
				title={title}
				language={language}
				poster={poster || null}
			/>
		</>
	);
}
