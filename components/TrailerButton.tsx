'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';
import TrailerModal from './TrailerModal';

interface TrailerButtonProps {
	trailerUrl: string;
}

export default function TrailerButton({ trailerUrl }: TrailerButtonProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors cursor-pointer"
			>
				<Play size={24} fill="currentColor" />
				Watch Trailer
			</button>

			<TrailerModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				youtubeUrl={trailerUrl}
			/>
		</>
	);
}
