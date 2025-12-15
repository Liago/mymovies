'use client';

import Link from 'next/link';
import { Star, Play } from 'lucide-react';
import ActionButtons from './ActionButtons';

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
			href={`/${type === 'tv' ? 'tv' : 'movie'}/${id}`}
			className="group relative block w-full outline-none"
		>
			<div className="relative aspect-[2/3] overflow-hidden rounded-md bg-zinc-900 transition-all duration-300 md:group-hover:scale-105 md:group-hover:z-10 md:group-hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] border border-transparent md:group-hover:border-primary/50">
				{poster ? (
					<img
						src={poster}
						alt={title}
						className="w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
						loading="lazy"
					/>
				) : (
					<div className="w-full h-full flex items-center justify-center text-zinc-500 bg-zinc-800">
						<span className="text-xs">No Image</span>
					</div>
				)}

				{/* Premium Glass Overlay on Hover */}
				<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 md:group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
					<div className="transform translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
						<div className="flex items-center justify-between mb-3 w-full">
							<button className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-primary hover:text-white transition-colors flex-shrink-0"
								onClick={(e) => {
									e.preventDefault();
									// Placeholder for play action
								}}
							>
								<Play size={14} fill="currentColor" className="ml-0.5" />
							</button>

							<ActionButtons
								mediaType={type}
								mediaId={id}
								showText={false}
								showRating={false}
								className="scale-75 origin-right"
							/>
						</div>

						<h3 className="text-white font-bold text-sm leading-tight line-clamp-2 mb-2">
							{title}
						</h3>

						<div className="flex items-center gap-2 text-[10px] font-medium text-gray-300">
							{rating && (
								<span className="text-green-400">{(rating * 10).toFixed(0)}% Match</span>
							)}
							<span className="px-1 py-0.5 border border-gray-600 rounded text-[9px] uppercase">{type}</span>
							<span>{year}</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
}
