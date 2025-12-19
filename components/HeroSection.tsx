'use client';

import Link from 'next/link';
import { Play, Info } from 'lucide-react';
import { useState } from 'react';
import TrailerModal from './TrailerModal';
import ActionButtons from './ActionButtons';

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
		<section className="relative h-screen w-full overflow-hidden">
			{/* Background Layer */}
			<div className="absolute inset-0 z-0">
				<img
					src={backdropUrl}
					alt={item.title}
					className="w-full h-full object-cover select-none"
				/>

				{/* Vignette & Gradients */}
				<div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
				<div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
				<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/20" />
			</div>

			{/* Content Layer */}
			<div className="relative z-10 h-full max-w-[1920px] mx-auto px-6 md:px-12 flex flex-col justify-center pt-20">
				<div className="max-w-4xl animate-slide-up">
					{/* Meta Badge */}
					<div className="inline-flex items-center gap-3 mb-6 animate-fade-in delay-100">
						<span className="px-3 py-1 rounded bg-white/10 backdrop-blur-md border border-white/10 text-xs font-bold tracking-widest text-white uppercase">
							{item.type === 'movie' ? 'Movie' : 'Series'}
						</span>
						<span className="px-3 py-1 rounded bg-primary/20 backdrop-blur-md border border-primary/20 text-xs font-bold tracking-widest text-primary uppercase">
							New Release
						</span>
					</div>

					{/* Title */}
					<h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-6 leading-[0.85] tracking-tight drop-shadow-2xl">
						{item.title}
					</h1>

					{/* Ratings & Info */}
					<div className="flex items-center gap-6 mb-8 text-lg font-medium animate-fade-in delay-200">
						<div className="flex items-center gap-2 text-green-400">
							<span className="font-bold">{(item.rating * 10).toFixed(0)}%</span>
							<span className="text-sm text-green-400/80">Match</span>
						</div>
						<span className="text-gray-400">{item.year}</span>
						<span className="text-gray-400">4K Ultra HD</span>
						<span className="text-gray-400">5.1</span>
					</div>

					{/* Description */}
					<p className="text-lg md:text-2xl text-gray-300 mb-10 line-clamp-3 max-w-2xl leading-relaxed animate-fade-in delay-300">
						{item.description}
					</p>

					{/* Actions */}
					<div className="flex flex-wrap gap-4 animate-fade-in delay-300">
						<button
							onClick={() => setIsTrailerOpen(true)}
							className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
						>
							<div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center group-hover:scale-110 transition-transform">
								<Play size={14} fill="currentColor" className="ml-0.5" />
							</div>
							Watch Trailer
						</button>

						<Link
							href={`/movie/${item.id}`}
							className="group flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
						>
							<Info size={24} />
							More Info
						</Link>

						<ActionButtons
							mediaType={item.type}
							mediaId={item.id}
							title={item.title}
							poster={item.poster}
							showText={false}
							className="scale-110 ml-2"
						/>
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
