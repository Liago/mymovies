import Link from 'next/link';
import Artwork from '../ui/Artwork';
import HScroll from '../ui/HScroll';
import SectionTitle from '../ui/SectionTitle';
import { formatRating } from '@/lib/format';

interface ChartItem {
	id: number;
	title: string;
	poster: string | null;
	year?: string;
	rating?: number;
	type: 'movie' | 'tv';
}

/** "Classifica della settimana": card orizzontali con il numero in accento. */
export default function WeeklyChart({ items }: { items: ChartItem[] }) {
	if (!items.length) return null;

	return (
		<section>
			<SectionTitle title="Classifica della settimana" href="/catalogo/trending" />
			<HScroll col="260px" mobileCol="260px" max="360px">
				{items.map((item, i) => (
					<Link
						key={`${item.type}-${item.id}`}
						href={`/${item.type}/${item.id}`}
						className="grid grid-cols-[96px_minmax(0,1fr)] gap-3.5 items-center p-2.5 rounded-[18px] bg-card border border-line transition-opacity hover:opacity-80"
					>
						<Artwork src={item.poster} alt={item.title} className="aspect-[2/3] rounded-[10px]" />
						<span className="flex flex-col gap-1 min-w-0">
							<span className="text-[34px] font-extrabold leading-none tracking-[-0.04em] text-acc">{i + 1}</span>
							<span className="text-[15px] font-bold line-clamp-2">{item.title}</span>
							<span className="text-[12px] font-medium text-fg3">
								{[item.type === 'tv' ? 'Serie' : 'Film', item.year, formatRating(item.rating) && `★ ${formatRating(item.rating)}`]
									.filter(Boolean)
									.join(' · ')}
							</span>
						</span>
					</Link>
				))}
			</HScroll>
		</section>
	);
}
