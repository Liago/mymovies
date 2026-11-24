'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/** Per quanto tempo è possibile annullare una rimozione. */
export const UNDO_WINDOW_MS = 5000;

interface DeferredRemoval<T> {
	/** Chiavi da nascoste: in attesa di annullamento o con la rimozione in corso. */
	pendingKeys: ReadonlySet<string>;
	/** Numero di titoli nella rimozione ancora annullabile (0 = nessun avviso). */
	pendingCount: number;
	/** Nasconde subito gli elementi e li rimuove davvero allo scadere della finestra di annullamento. */
	remove: (items: T[]) => void;
	/** Ripristina la rimozione ancora annullabile. */
	undo: () => void;
	/** Conferma subito la rimozione annullabile (es. chiusura dell'avviso). */
	flush: () => void;
}

/**
 * Rimozione "ottimistica" con annullamento: gli elementi spariscono subito
 * dalla griglia, ma `commit` viene chiamato solo dopo `UNDO_WINDOW_MS`, alla
 * rimozione successiva, quando si lascia la pagina o l'app va in background.
 * Così "Annulla" non deve ricreare nulla sul server e l'ordine resta intatto.
 */
export function useDeferredRemoval<T>(
	getKey: (item: T) => string,
	commit: (items: T[]) => Promise<void>
): DeferredRemoval<T> {
	// Rimozione ancora annullabile
	const [undoable, setUndoable] = useState<T[] | null>(null);
	const undoableRef = useRef<T[] | null>(null);
	// Chiavi già confermate, nascoste finché il commit (e l'eventuale refresh) non termina
	const [committingKeys, setCommittingKeys] = useState<ReadonlySet<string>>(EMPTY_KEYS);
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const commitRef = useRef(commit);
	const getKeyRef = useRef(getKey);

	useEffect(() => {
		commitRef.current = commit;
		getKeyRef.current = getKey;
	}, [commit, getKey]);

	const setUndoableItems = useCallback((items: T[] | null): void => {
		undoableRef.current = items;
		setUndoable(items);
	}, []);

	const clearTimer = useCallback((): void => {
		if (timer.current) clearTimeout(timer.current);
		timer.current = null;
	}, []);

	const flush = useCallback((): void => {
		clearTimer();
		const items = undoableRef.current;
		if (!items) return;
		const keys = items.map((item) => getKeyRef.current(item));
		setUndoableItems(null);
		setCommittingKeys((prev) => new Set([...prev, ...keys]));
		commitRef
			.current(items)
			.catch((error: unknown) => console.error('Errore durante la rimozione:', error))
			.finally(() =>
				setCommittingKeys((prev) => {
					const next = new Set(prev);
					keys.forEach((key) => next.delete(key));
					return next;
				})
			);
	}, [clearTimer, setUndoableItems]);

	const remove = useCallback(
		(items: T[]): void => {
			if (!items.length) return;
			flush();
			setUndoableItems(items);
			timer.current = setTimeout(flush, UNDO_WINDOW_MS);
		},
		[flush, setUndoableItems]
	);

	const undo = useCallback((): void => {
		clearTimer();
		setUndoableItems(null);
	}, [clearTimer, setUndoableItems]);

	// App in background / chiusa dalla Home: conferma subito, potrebbe non tornare
	useEffect(() => {
		const onVisibility = (): void => {
			if (document.visibilityState === 'hidden') flush();
		};
		document.addEventListener('visibilitychange', onVisibility);
		window.addEventListener('pagehide', flush);
		return () => {
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('pagehide', flush);
		};
	}, [flush]);

	// Navigazione verso un'altra pagina: conferma la rimozione in sospeso
	useEffect(() => flush, [flush]);

	const pendingKeys = useMemo<ReadonlySet<string>>(() => {
		if (!undoable) return committingKeys;
		return new Set([...committingKeys, ...undoable.map(getKey)]);
	}, [undoable, committingKeys, getKey]);

	return {
		pendingKeys,
		pendingCount: undoable?.length ?? 0,
		remove,
		undo,
		flush,
	};
}

const EMPTY_KEYS: ReadonlySet<string> = new Set<string>();
