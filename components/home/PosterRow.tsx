import MovieCard from '../MovieCard';
import HScroll from '../ui/HScroll';
import SectionTitle from '../ui/SectionTitle';

interface PosterRowItem {
	id: number;
	title: string;
	poster: string | null;
	year?: string;
	rating?: number;
	type?: 'movie' | 'tv';
}

interface PosterRowProps {
	title: string;
	href?: string;
	items: PosterRowItem[];
	/** Badge fisso per tutta la riga (es. "Al cinema"). */
	badge?: string;
}

/** Riga di poster 2:3 standard (Al cinema, Serie popolari, Simili…). */
export default function PosterRow({ title, href, items, badge }: PosterRowProps) {
	if (!items.length) return null;

	return (
		<section>
			<SectionTitle title={title} href={href} />
			<HScroll col="150px" mobileCol="120px" max="200px">
				{items.map((m) => (
					<MovieCard key={`${m.type}-${m.id}`} {...m} badge={badge} subtitle={null} />
				))}
			</HScroll>
		</section>
	);
}
