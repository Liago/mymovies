'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';
import MovieCard from './MovieCard';
import Link from 'next/link';

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
	viewAllLink?: string;
}

export default function MovieCarousel({ title, movies, viewAllLink }: MovieCarouselProps) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showControls, setShowControls] = useState(false);

	const scroll = (direction: 'left' | 'right') => {
		if (scrollRef.current) {
			const { clientWidth } = scrollRef.current;
			const scrollAmount = clientWidth * 0.75;
			scrollRef.current.scrollBy({
				left: direction === 'left' ? -scrollAmount : scrollAmount,
				behavior: 'smooth'
			});
		}
	};

	if (!movies.length) return null;

	return (
		<section
			className="mb-14 relative group z-0"
			onMouseEnter={() => setShowControls(true)}
			onMouseLeave={() => setShowControls(false)}
		>
			<div className="flex items-end justify-between px-6 md:px-12 mb-5">
				<h2 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
					{title}
				</h2>
				{viewAllLink && (
					<Link
						href={viewAllLink}
						className="text-xs font-semibold text-primary/80 hover:text-primary tracking-widest uppercase transition-colors opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 duration-300"
					>
						View All
					</Link>
				)}
			</div>

			<div className="relative">
				{/* Left Control */}
				<button
					onClick={() => scroll('left')}
					className={`hidden md:flex absolute left-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-r from-black via-black/60 to-transparent items-center justify-center transition-all duration-500 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 pointer-events-none'}`}
					aria-label="Scroll left"
				>
					<ChevronLeft className="text-white w-10 h-10 drop-shadow-lg hover:scale-125 transition-transform" />
				</button>

				{/* Carousel Track */}
				<div
					ref={scrollRef}
					className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-6 md:px-12 pb-8 pt-4 snap-x"
					style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
				>
					{movies.map((movie) => (
						<div key={movie.id} className="flex-shrink-0 w-[150px] md:w-[220px] snap-start">
							<MovieCard {...movie} />
						</div>
					))}
				</div>

				{/* Right Control */}
				<button
					onClick={() => scroll('right')}
					className={`hidden md:flex absolute right-0 top-0 bottom-0 z-20 w-16 bg-gradient-to-l from-black via-black/60 to-transparent items-center justify-center transition-all duration-500 ${showControls ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none'}`}
					aria-label="Scroll right"
				>
					<ChevronRight className="text-white w-10 h-10 drop-shadow-lg hover:scale-125 transition-transform" />
				</button>
			</div>
		</section>
	);
}
