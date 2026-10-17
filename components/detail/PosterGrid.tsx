import MovieCard from '../MovieCard';

interface PosterGridItem {
	id: number;
	title: string;
	poster: string | null;
	year?: string;
	rating?: number;
	type?: 'movie' | 'tv';
}

/** Griglia di poster per il tab "Simili". */
export default function PosterGrid({ items }: { items: PosterGridItem[] }) {
	if (!items.length) return <p className="m-0 text-[15px] font-medium text-fg3">Nessun titolo simile trovato.</p>;
	return (
		<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-x-2.5 gap-y-4 md:gap-x-[18px] md:gap-y-6">
			{items.map((m) => (
				<MovieCard key={`${m.type}-${m.id}`} {...m} compact />
			))}
		</div>
	);
}
