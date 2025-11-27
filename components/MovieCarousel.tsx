'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import MovieCard from './MovieCard';

interface Movie {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	type?: 'movie' | 'tv';
}

interface MovieCarouselProps {
	title: string;
	movies: Movie[];
}

export default function MovieCarousel({ title, movies }: MovieCarouselProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showControls, setShowControls] = useState(false);

	const scroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const { clientWidth } = scrollRef.current;
			const scrollAmount = clientWidth * 0.8;
			scrollRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}
	};

	return (
		<section
			className="mb-12 relative group"
			onMouseEnter={() => setShowControls(true)}
			onMouseLeave={() => setShowControls(false)}
		>
			<h2 className="text-xl md:text-2xl font-bold text-white mb-4 px-6 md:px-12 flex items-center gap-2">
				{title}
				<span className="text-xs font-normal text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:underline">
					Explore All
				</span>
			</h2>

			<div className="relative group">
				{/* Left Control */}
				<button
					onClick={() => scroll('left')}
					className={`absolute left-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-r from-black/80 to-transparent flex items-center justify-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
				>
					<ChevronLeft className="text-white w-8 h-8" />
				</button>

				{/* Carousel Track */}
				<div
					ref={scrollRef}
					className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-6 md:px-12 pb-8 pt-4"
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
					{movies.map((movie) => (
						<div key={movie.id} className="flex-shrink-0 w-[140px] md:w-[180px]">
							<MovieCard {...movie} />
						</div>
					))}
				</div>

				{/* Right Control */}
				<button
					onClick={() => scroll('right')}
					className={`absolute right-0 top-0 bottom-0 z-20 w-12 bg-gradient-to-l from-black/80 to-transparent flex items-center justify-center transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}
				>
					<ChevronRight className="text-white w-8 h-8" />
				</button>
			</div>
		</section>
	);
}
