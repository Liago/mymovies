import type { Metadata } from 'next';
import PageShell from '@/components/ui/PageShell';
import PageHeader from '@/components/ui/PageHeader';
import ExploreSearch from '@/components/catalog/ExploreSearch';
import CatalogView, { type CatalogParams } from '@/components/catalog/CatalogView';
import { isCatalogList } from '@/lib/tmdb-catalog';

export const metadata: Metadata = { title: 'Esplora - CineScope' };

function hrefFor({ list, type }: CatalogParams): string {
	const q = new URLSearchParams();
	if (list !== 'trending') q.set('list', list);
	if (type === 'tv') q.set('type', 'tv');
	const qs = q.toString();
	return `/esplora${qs ? `?${qs}` : ''}`;
}

/** Esplora: ricerca + catalogo in due colonne (la tab della navigazione mobile). */
export default async function ExplorePage({ searchParams }: { searchParams: Promise<{ list?: string; type?: string }> }) {
	const { list: rawList, type: rawType } = await searchParams;
	const list = rawList && isCatalogList(rawList) ? rawList : 'trending';
	const type = rawType === 'tv' ? 'tv' : 'movie';

	return (
		<PageShell width="wide">
			<PageHeader eyebrow="Cerca e scopri" title="Esplora" />
			<ExploreSearch>
				<CatalogView list={list} type={type} genre={null} hrefFor={hrefFor} showGenres={false} inlineTypeSwitch />
			</ExploreSearch>
		</PageShell>
	);
}
