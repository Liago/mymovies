'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { useLists } from '@/context/ListsContext';
import MovieCard from './MovieCard';

interface ListItemCardProps {
	listId: number;
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	type: 'movie' | 'tv';
}

export default function ListItemCard({ listId, id, title, poster, rating, year, type }: ListItemCardProps) {
	const [isDeleting, setIsDeleting] = useState(false);
	const { removeFromList } = useLists();

	const handleDelete = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setIsDeleting(true);
		try {
			await removeFromList(listId, id, type);
		} catch (error) {
			console.error('Error removing item from list:', error);
			setIsDeleting(false);
		}
	};

	return (
		<div className="relative group/item">
			<MovieCard
				id={id}
				title={title}
				poster={poster}
				rating={rating}
				year={year}
				type={type}
			/>

			{/* Delete Button - sempre visibile su mobile, hover su desktop */}
			<button
				onClick={handleDelete}
				disabled={isDeleting}
				className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-red-500/90 hover:bg-red-600 text-white flex items-center justify-center transition-all opacity-100 md:opacity-0 md:group-hover/item:opacity-100 disabled:opacity-50 shadow-lg"
				title="Rimuovi dalla lista"
			>
				{isDeleting ? (
					<div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
				) : (
					<X size={16} strokeWidth={3} />
				)}
			</button>
		</div>
	);
}
