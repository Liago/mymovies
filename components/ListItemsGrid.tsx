'use client';

import ListItemCard from './ListItemCard';

interface ListItem {
	id: number;
	title: string;
	poster: string | null;
	rating?: number;
	year?: string;
	media_type: 'movie' | 'tv';
}

interface ListItemsGridProps {
	listId: number;
	items: ListItem[];
}

export default function ListItemsGrid({ listId, items }: ListItemsGridProps) {
	return (
		<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
			{items.map((item) => (
				<ListItemCard
					key={`${item.media_type}-${item.id}`}
					listId={listId}
					id={item.id}
					title={item.title}
					poster={item.poster}
					rating={item.rating}
					year={item.year}
					type={item.media_type}
				/>
			))}
		</div>
	);
}
