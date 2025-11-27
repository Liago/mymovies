'use client';

import Link from 'next/link';
import { Star, Play } from 'lucide-react';

interface MovieCardProps {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	type?: 'movie' | 'tv';
}

export default function MovieCard({ id, title, poster, rating, year, type = 'movie' }: MovieCardProps) {
	return (
		<Link
			href={`/movie/${id}`}
			className="group relative block w-full"
		>
			<div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-slate-800 transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-purple-900/20 group-hover:z-10">
				{poster ? (
					<img
						src={poster}
						alt={title}
						className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-slate-500">
						No Image
					</div>
				)}

				{/* New Badge */}
				{year === new Date().getFullYear().toString() && (
					<div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-lg z-20">
						NEW
					</div>
				)}

				{/* Gradient Overlay - Always visible but subtle, stronger on hover */}
				<div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />

				{/* Content Overlay */}
				<div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
					<div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
						<div className="flex items-center gap-2 mb-2">
							<div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">
								<Play size={12} fill="currentColor" />
							</div>
							{rating && (
								<span className="text-green-400 font-bold text-sm">{rating.toFixed(1)} Match</span>
							)}
						</div>

						<h3 className="text-white font-bold text-lg leading-tight line-clamp-2 mb-1">
							{title}
						</h3>

						<div className="flex items-center gap-2 text-xs text-gray-300">
							<span>{year}</span>
							<span className="w-1 h-1 rounded-full bg-gray-500" />
							<span className="uppercase border border-gray-500 px-1 rounded text-[10px]">{type}</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
