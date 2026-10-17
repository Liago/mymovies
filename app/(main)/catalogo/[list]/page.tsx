import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PageShell from '@/components/ui/PageShell';
import PageHeader from '@/components/ui/PageHeader';
import Segmented from '@/components/ui/Segmented';
import CatalogView, { catalogLabel, type CatalogParams } from '@/components/catalog/CatalogView';
import { isCatalogList } from '@/lib/tmdb-catalog';

interface PageProps {
	params: Promise<{ list: string }>;
	searchParams: Promise<{ type?: string; genre?: string }>;
}

function hrefFor({ list, type, genre }: CatalogParams): string {
	const q = new URLSearchParams();
	if (type === 'tv') q.set('type', 'tv');
	if (genre) q.set('genre', String(genre));
	const qs = q.toString();
	return `/catalogo/${list}${qs ? `?${qs}` : ''}`;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
	const { list } = await params;
	const { type } = await searchParams;
	if (!isCatalogList(list)) return {};
	const label = catalogLabel(list, type === 'tv' ? 'tv' : 'movie');
	return { title: `${label} · ${type === 'tv' ? 'Serie TV' : 'Film'} - CineScope` };
}

/** Catalogo unico: Di tendenza, Più votati, Al cinema, In uscita × Film/Serie TV × genere. */
export default async function CatalogPage({ params, searchParams }: PageProps) {
	const { list } = await params;
	if (!isCatalogList(list)) notFound();
	const { type: rawType, genre: rawGenre } = await searchParams;
	const type = rawType === 'tv' ? 'tv' : 'movie';
	const genreNum = Number(rawGenre);
	const genre = Number.isInteger(genreNum) && genreNum > 0 ? genreNum : null;

	return (
		<PageShell width="wide" className="md:gap-[22px]">
			<PageHeader
				eyebrow="Catalogo"
				title={catalogLabel(list, type)}
				actions={
					<Segmented
						ariaLabel="Tipo"
						items={(['movie', 'tv'] as const).map((t) => ({
							key: t,
							label: t === 'movie' ? 'Film' : 'Serie TV',
							active: t === type,
							href: hrefFor({ list, type: t, genre: null }),
						}))}
					/>
				}
			/>
			<CatalogView list={list} type={type} genre={genre} hrefFor={hrefFor} />
		</PageShell>
	);
}
