'use client';

import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { useState } from 'react';
import TrailerModal from './TrailerModal';

interface HeroItem {
	id: number;
	title: string;
	poster: string | null;
	rating: number;
	year: string;
	type: 'movie' | 'tv';
	description?: string;
	trailerUrl?: string | null;
}

interface HeroSectionProps {
	item: HeroItem;
}

export default function HeroSection({ item }: HeroSectionProps) {
	const [isTrailerOpen, setIsTrailerOpen] = useState(false);

	if (!item) return null;

	const backdropUrl = item.poster?.replace('w500', 'original') || '';

	return (
		<section className="relative h-[85vh] w-full overflow-hidden">
			{/* Background Image with Parallax-like feel */}
			<div className="absolute inset-0">
				<img
					src={backdropUrl}
					alt={item.title}
					className="w-full h-full object-cover object-top"
				/>

				{/* Cinematic Gradients */}
				<div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
			</div>

			{/* Content */}
			<div className="relative h-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col justify-center pt-20">
				<div className="max-w-3xl animate-fade-in-up">
					{/* Badge */}
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 mb-6">
						<span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
						<span className="text-xs font-medium text-white tracking-wider uppercase">Featured Premiere</span>
					</div>

					{/* Title */}
					<h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tight text-shadow-lg">
						{item.title}
					</h1>

					{/* Meta */}
					<div className="flex items-center gap-4 mb-8 text-gray-300 font-medium">
						<span className="text-green-400">{item.rating.toFixed(1)} Match</span>
						<span>{item.year}</span>
						<span className="border border-gray-500 px-1 rounded text-xs uppercase">{item.type}</span>
						<span>4K Ultra HD</span>
					</div>

					{/* Description */}
					<p className="text-lg md:text-xl text-gray-300 mb-10 line-clamp-3 max-w-2xl leading-relaxed text-shadow-sm">
						{item.description}
					</p>

					{/* Buttons */}
					<div className="flex flex-wrap gap-4">
						<button
							onClick={() => setIsTrailerOpen(true)}
							className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-200 transition-colors cursor-pointer"
						>
							<Play size={24} fill="currentColor" />
							Watch Trailer
						</button>
						<Link
							href={`/movie/${item.id}`}
							className="flex items-center gap-3 bg-gray-600/80 backdrop-blur text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-600 transition-colors"
						>
							<Info size={24} />
							More Info
						</Link>
					</div>
				</div>
			</div>

			<TrailerModal
				isOpen={isTrailerOpen}
				onClose={() => setIsTrailerOpen(false)}
				youtubeUrl={item.trailerUrl || null}
			/>
		</section>
	);
}
