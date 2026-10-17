'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useLists } from '@/context/ListsContext';
import MovieCard from './MovieCard';
import TVCardWithProgress from './TVCardWithProgress';

import { useRouter } from 'next/navigation';

interface ListItemCardProps {
	listId: number;
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	type: 'movie' | 'tv';
	totalEpisodes?: number;
	firstAirDate?: string | null;
}

export default function ListItemCard({ listId, id, title, poster, rating, year, type, totalEpisodes, firstAirDate }: ListItemCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const { removeFromList } = useLists();
	const router = useRouter();

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setIsDeleting(true);
		try {
			await removeFromList(listId, id, type);
			router.refresh();
		} catch (error) {
			console.error('Error removing item from list:', error);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className="relative group/item">
			{type === 'tv' ? (
				<TVCardWithProgress
					id={id}
					title={title}
					poster={poster}
					rating={rating}
					year={year}
					totalEpisodes={totalEpisodes}
					firstAirDate={firstAirDate}
				/>
			) : (
				<MovieCard
					id={id}
					title={title}
					poster={poster}
					rating={rating}
					year={year}
					type={type}
				/>
			)}

			{/* Delete Button - sempre visibile su mobile, hover su desktop */}
			<button
				onClick={handleDelete}
				disabled={isDeleting}
				className="absolute top-2 left-2 z-20 w-8 h-8 rounded-full glass text-fg flex items-center justify-center transition-opacity opacity-100 md:opacity-0 md:group-hover/item:opacity-100 focus-visible:opacity-100 disabled:opacity-50"
				title="Rimuovi dalla lista"
				aria-label={`Rimuovi ${title} dalla lista`}
			>
				{isDeleting ? (
					<div className="w-3 h-3 border-2 border-fg border-t-transparent rounded-full animate-spin" />
				) : (
					<X size={16} strokeWidth={2.5} />
				)}
			</button>
		</div>
	);
}
