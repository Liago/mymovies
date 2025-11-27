'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { createPortal } from 'react-dom';

interface TrailerModalProps {
	isOpen: boolean;
	onClose: () => void;
	youtubeUrl: string | null;
}

export default function TrailerModal({ isOpen, onClose, youtubeUrl }: TrailerModalProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	if (!mounted || !isOpen || !youtubeUrl) return null;

	// Extract video ID from URL
	const videoId = youtubeUrl.split('v=')[1];
	const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
			<div className="relative w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
				>
					<X size={24} />
				</button>
				<iframe
					src={embedUrl}
					className="w-full h-full"
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowFullScreen
				/>
			</div>
			<div
				className="absolute inset-0 -z-10"
				onClick={onClose}
			/>
		</div>,
		document.body
	);
}
