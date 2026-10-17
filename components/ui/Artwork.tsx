'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';

interface ArtworkProps {
	src?: string | null;
	alt: string;
	/** Classi del contenitore (dimensioni, aspect-ratio, radius). */
	className?: string;
	imgClassName?: string;
	/** Carica subito l'immagine (es. hero above the fold). */
	eager?: boolean;
	children?: React.ReactNode;
}

/**
 * Immagine TMDB con placeholder a righe (--ph1/--ph2) mentre carica o se manca,
 * con gli stessi radius dell'immagine finale.
 */
export default function Artwork({ src, alt, className, imgClassName, eager = false, children }: ArtworkProps) {
	const [failedSrc, setFailedSrc] = useState<string | null>(null);
	const showImage = !!src && failedSrc !== src;

	return (
		<div className={cn('relative overflow-hidden placeholder-stripes', className)}>
			{showImage && (
				<img
					src={src}
					alt={alt}
					loading={eager ? 'eager' : 'lazy'}
					decoding="async"
					onError={() => setFailedSrc(src)}
					className={cn('absolute inset-0 h-full w-full object-cover', imgClassName)}
				/>
			)}
			{children}
		</div>
	);
}
