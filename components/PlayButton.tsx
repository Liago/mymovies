'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import TrailerModal from './TrailerModal';

interface PlayButtonProps {
	trailerUrl: string | null;
}

export default function PlayButton({ trailerUrl }: PlayButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	if (!trailerUrl) return null;

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-orange-400 hover:scale-105 transition-transform cursor-pointer z-10 group"
			>
				<Play size={32} fill="currentColor" className="group-hover:text-orange-500" />
			</button>

			<TrailerModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				youtubeUrl={trailerUrl}
			/>
		</>
	);
}
