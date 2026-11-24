'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, CheckCheck, Trash2, Undo2, X } from 'lucide-react';
import { useDeferredRemoval } from '@/hooks/useDeferredRemoval';
import { useLongPress } from '@/hooks/useLongPress';
import { cn } from '@/lib/cn';

export const POSTER_GRID_CLASS =
	'grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-2.5 gap-y-3.5 md:gap-x-[18px] md:gap-y-[22px]';

interface RemovableGridProps<T> {
	items: T[];
	/** Chiave stabile dell'elemento: va definita fuori dal render o con useCallback. */
	getKey: (item: T) => string;
	getTitle: (item: T) => string;
	renderItem: (item: T) => React.ReactNode;
	/** Rimozione definitiva, chiamata solo allo scadere della finestra di annullamento. */
	onRemove: (items: T[]) => Promise<void>;
	/** Complemento per testi e aria-label, es. "dalla lista", "dalla watchlist". */
	fromLabel: string;
	/** Mostrato quando, dopo le rimozioni, non resta nessun elemento visibile. */
	empty?: React.ReactNode;
}

/**
 * Griglia di locandine con rimozione in stile iOS (Foto/File):
 * - «Seleziona» o pressione prolungata su una locandina → modalità modifica;
 * - in modifica il tocco seleziona invece di aprire la scheda;
 * - barra in basso con «Seleziona tutti» e «Rimuovi»;
 * - avviso con «Annulla» per 5 secondi prima della rimozione definitiva.
 * Con un mouse resta anche la «X» rapida al passaggio sulla locandina.
 */
export default function RemovableGrid<T>({
	items,
	getKey,
	getTitle,
	renderItem,
	onRemove,
	fromLabel,
	empty,
}: RemovableGridProps<T>) {
	const [editing, setEditing] = useState<boolean>(false);
	const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set<string>());
	const { pendingKeys, pendingCount, remove, undo, flush } = useDeferredRemoval(getKey, onRemove);

	const visibleItems = useMemo(() => items.filter((item) => !pendingKeys.has(getKey(item))), [items, pendingKeys, getKey]);
	const visibleKeys = useMemo(() => new Set(visibleItems.map(getKey)), [visibleItems, getKey]);
	// La selezione considera solo ciò che è visibile (es. dopo un cambio di filtro)
	const selectedVisible = useMemo(() => visibleItems.filter((item) => selected.has(getKey(item))), [visibleItems, selected, getKey]);
	const allSelected = visibleItems.length > 0 && selectedVisible.length === visibleItems.length;

	const exitEditing = useCallback((): void => {
		setEditing(false);
		setSelected(new Set<string>());
	}, []);

	const toggle = useCallback((key: string): void => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}, []);

	const startWith = useCallback((key: string): void => {
		setEditing(true);
		setSelected(new Set<string>([key]));
	}, []);

	const toggleAll = (): void => {
		setSelected(allSelected ? new Set<string>() : new Set<string>(visibleKeys));
	};

	const removeItems = useCallback(
		(toRemove: T[]): void => {
			remove(toRemove);
			exitEditing();
		},
		[remove, exitEditing]
	);

	// Esc esce dalla modalità modifica
	useEffect(() => {
		if (!editing) return;
		const onKey = (e: KeyboardEvent): void => {
			if (e.key === 'Escape') exitEditing();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [editing, exitEditing]);

	const showEmpty = visibleItems.length === 0;

	return (
		<div className="flex flex-col gap-4 md:gap-5">
			{!showEmpty && (
				<div className="flex items-center justify-between gap-3">
					<p className="m-0 text-[12px] md:text-[13px] font-semibold text-fg3">
						{editing ? 'Tocca i titoli da rimuovere' : 'Tieni premuto un titolo per selezionarlo'}
					</p>
					<button
						type="button"
						onClick={() => (editing ? exitEditing() : setEditing(true))}
						aria-pressed={editing}
						className={cn(
							'h-9 px-4 shrink-0 rounded-full text-[13px] font-bold transition-colors duration-150',
							editing ? 'bg-fg text-bg' : 'bg-bg2 text-fg hover:opacity-80'
						)}
					>
						{editing ? 'Fine' : 'Seleziona'}
					</button>
				</div>
			)}

			{showEmpty ? (
				empty ?? null
			) : (
				<div className={POSTER_GRID_CLASS}>
					{visibleItems.map((item) => {
						const key = getKey(item);
						return (
							<RemovableItem
								key={key}
								title={getTitle(item)}
								fromLabel={fromLabel}
								editing={editing}
								selected={selected.has(key)}
								onToggle={() => toggle(key)}
								onLongPress={() => startWith(key)}
								onQuickRemove={() => removeItems([item])}
							>
								{renderItem(item)}
							</RemovableItem>
						);
					})}
				</div>
			)}

			{editing && (
				<div
					role="toolbar"
					aria-label="Azioni sui titoli selezionati"
					className="animate-fade-in fixed z-[55] left-3 right-3 bottom-[max(24px,env(safe-area-inset-bottom))] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[520px] md:bottom-8 h-16 pl-2 pr-2 rounded-full bg-card border border-line shadow-popover flex items-center gap-2"
				>
					<button
						type="button"
						onClick={exitEditing}
						className="w-11 h-11 shrink-0 rounded-full bg-bg2 text-fg flex items-center justify-center hover:opacity-80"
						aria-label="Esci dalla selezione"
					>
						<X size={18} />
					</button>
					<span className="flex-1 min-w-0 truncate text-[14px] font-bold" aria-live="polite">
						{selectedVisible.length === 0
							? 'Nessuno selezionato'
							: `${selectedVisible.length} ${selectedVisible.length === 1 ? 'selezionato' : 'selezionati'}`}
					</span>
					<button
						type="button"
						onClick={toggleAll}
						className="h-11 px-3 shrink-0 rounded-full text-[13px] font-bold text-fg flex items-center gap-1.5 hover:bg-bg2"
					>
						<CheckCheck size={16} />
						{allSelected ? 'Nessuno' : 'Tutti'}
					</button>
					<button
						type="button"
						onClick={() => removeItems(selectedVisible)}
						disabled={selectedVisible.length === 0}
						className="h-11 px-4 shrink-0 rounded-full bg-red-500 text-white text-[13px] font-bold flex items-center gap-1.5 transition-opacity disabled:opacity-40"
						aria-label={`Rimuovi ${selectedVisible.length} titoli ${fromLabel}`}
					>
						<Trash2 size={16} />
						Rimuovi
					</button>
				</div>
			)}

			{!editing && pendingCount > 0 && (
				<div
					role="status"
					className="animate-pop-in fixed z-[55] left-3 right-3 bottom-[max(24px,env(safe-area-inset-bottom))] md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[440px] md:bottom-8 h-16 pl-5 pr-2 rounded-full bg-fg text-bg shadow-popover flex items-center gap-2"
				>
					<span className="flex-1 min-w-0 truncate text-[14px] font-bold" title={`Rimossi ${fromLabel}`}>
						{pendingCount === 1 ? 'Titolo rimosso' : `${pendingCount} titoli rimossi`}
					</span>
					<button
						type="button"
						onClick={undo}
						className="h-11 px-4 shrink-0 rounded-full bg-acc text-accfg text-[13px] font-bold flex items-center gap-1.5 hover:opacity-90"
					>
						<Undo2 size={16} />
						Annulla
					</button>
					<button
						type="button"
						onClick={flush}
						className="w-11 h-11 shrink-0 rounded-full flex items-center justify-center opacity-70 hover:opacity-100"
						aria-label="Chiudi"
					>
						<X size={18} />
					</button>
				</div>
			)}
		</div>
	);
}

interface RemovableItemProps {
	title: string;
	fromLabel: string;
	editing: boolean;
	selected: boolean;
	onToggle: () => void;
	onLongPress: () => void;
	onQuickRemove: () => void;
	children: React.ReactNode;
}

function RemovableItem({ title, fromLabel, editing, selected, onToggle, onLongPress, onQuickRemove, children }: RemovableItemProps) {
	const longPress = useLongPress(onLongPress, !editing);

	return (
		<div
			{...longPress}
			className="relative group/item select-none [-webkit-touch-callout:none] [-webkit-user-select:none]"
		>
			{children}

			{editing ? (
				<button
					type="button"
					onClick={onToggle}
					aria-pressed={selected}
					aria-label={`${selected ? 'Deseleziona' : 'Seleziona'} ${title}`}
					className="absolute inset-0 z-30 outline-none"
				>
					{/* Copre solo la locandina 2:3, non il titolo sotto */}
					<span
						className={cn(
							'absolute inset-x-0 top-0 aspect-[2/3] rounded-[12px] md:rounded-[14px] transition-[background-color,box-shadow] duration-150',
							selected ? 'bg-black/25 ring-[3px] ring-inset ring-acc' : 'bg-black/0'
						)}
					>
						<span
							className={cn(
								'absolute bottom-2 right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-[0_1px_6px_rgba(0,0,0,0.35)] transition-colors duration-150',
								selected ? 'bg-acc text-accfg' : 'bg-black/30 border-2 border-white'
							)}
						>
							{selected && <Check size={16} strokeWidth={3} />}
						</span>
					</span>
				</button>
			) : (
				// Scorciatoia per chi usa il mouse; al tocco si usa la selezione
				<button
					type="button"
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onQuickRemove();
					}}
					className="hidden pointer-fine:flex absolute top-2 left-2 z-20 w-8 h-8 rounded-full glass text-fg items-center justify-center opacity-0 transition-opacity group-hover/item:opacity-100 focus-visible:opacity-100"
					title={`Rimuovi ${fromLabel}`}
					aria-label={`Rimuovi ${title} ${fromLabel}`}
				>
					<X size={16} strokeWidth={2.5} />
				</button>
			)}
		</div>
	);
}
