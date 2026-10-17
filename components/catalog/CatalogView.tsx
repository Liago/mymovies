import { cookies } from 'next/headers';
import CatalogGrid from './CatalogGrid';
import Segmented from '../ui/Segmented';
import { CATALOG_LISTS, getCatalog, getGenres, type CatalogList, type CatalogType } from '@/lib/tmdb-catalog';
import { formatCount } from '@/lib/format';

export interface CatalogParams {
	list: CatalogList;
	type: CatalogType;
	genre: number | null;
}

/** Etichetta della lista, declinata per le serie dove serve. */
export function catalogLabel(list: CatalogList, type: CatalogType): string {
	if (type === 'tv') {
		if (list === 'top-rated') return 'Più votate';
		if (list === 'now-playing') return 'In onda';
		if (list === 'upcoming') return 'In arrivo';
	}
	return CATALOG_LISTS.find((l) => l.slug === list)?.label ?? 'Di tendenza';
}

interface CatalogViewProps extends CatalogParams {
	hrefFor: (params: CatalogParams) => string;
	/** Mostra i tab dei generi e il contatore (desktop/catalogo completo). */
	showGenres?: boolean;
	/** Segmented Film/Serie TV dentro la pagina (Esplora mobile). */
	inlineTypeSwitch?: boolean;
}

/** Filtri (liste, tipo, generi) e griglia del catalogo, dati da TMDB. */
export default async function CatalogView({ list, type, genre, hrefFor, showGenres = true, inlineTypeSwitch = false }: CatalogViewProps) {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value === 'en-US' ? 'en-US' : 'it-IT';
	const [page, genres] = await Promise.all([getCatalog(list, type, genre, 1, lang), getGenres(type, lang)]);
	const genreNames = Object.fromEntries(genres.map((g) => [g.id, g.name]));
	const badge = type === 'movie' && list === 'now-playing' ? 'Al cinema' : null;

	return (
		<>
			<Segmented
				variant="chips"
				ariaLabel="Liste"
				className="-mx-4 px-4 md:mx-0 md:px-0"
				items={CATALOG_LISTS.map((l) => ({
					key: l.slug,
					label: catalogLabel(l.slug, type),
					active: l.slug === list,
					href: hrefFor({ list: l.slug, type, genre: null }),
				}))}
			/>

			{inlineTypeSwitch && (
				<Segmented
					fill
					ariaLabel="Tipo"
					items={(['movie', 'tv'] as const).map((t) => ({
						key: t,
						label: t === 'movie' ? 'Film' : 'Serie TV',
						active: t === type,
						href: hrefFor({ list, type: t, genre: null }),
					}))}
				/>
			)}

			{showGenres && genres.length > 0 && (
				<div className="flex items-center gap-3 pb-1.5 border-b border-line min-w-0">
					<Segmented
						variant="text"
						ariaLabel="Generi"
						className="flex-1 min-w-0"
						items={[{ id: 0, name: 'Tutti i generi' }, ...genres].map((g) => ({
							key: String(g.id),
							label: g.name,
							active: (genre ?? 0) === g.id,
							href: hrefFor({ list, type, genre: g.id || null }),
						}))}
					/>
					<span className="hidden md:block shrink-0 text-[13px] font-semibold text-fg3">
						{formatCount(page.totalResults)} titoli
					</span>
				</div>
			)}

			<CatalogGrid
				key={`${list}-${type}-${genre ?? 0}`}
				list={list}
				type={type}
				genre={genre}
				initialItems={page.results}
				totalPages={page.totalPages}
				genreNames={genreNames}
				badge={badge}
			/>
		</>
	);
}
