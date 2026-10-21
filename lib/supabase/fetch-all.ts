/** Righe per pagina: Supabase (PostgREST) restituisce al massimo 1000 righe per richiesta. */
const PAGE_SIZE = 1000;

type PageQuery<T> = (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>;

/**
 * Legge tutte le righe di una query paginando con `range`, oltre il limite
 * di 1000 righe per richiesta. La query deve avere un ordinamento stabile.
 */
export async function fetchAllRows<T>(query: PageQuery<T>): Promise<T[]> {
	const rows: T[] = [];
	for (let from = 0; ; from += PAGE_SIZE) {
		const { data, error } = await query(from, from + PAGE_SIZE - 1);
		if (error) throw error;
		rows.push(...(data ?? []));
		if (!data || data.length < PAGE_SIZE) return rows;
	}
}
