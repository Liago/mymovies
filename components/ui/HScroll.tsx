import { cn } from '@/lib/cn';

interface HScrollProps {
	/** Larghezza minima colonna su desktop (es. "170px"). */
	col: string;
	/** Larghezza fissa colonna su mobile (es. "120px"). */
	mobileCol?: string;
	/** Larghezza massima su desktop, per righe con pochi elementi (default 1fr). */
	max?: string;
	className?: string;
	children: React.ReactNode;
}

/**
 * Riga orizzontale scorrevole: colonne `minmax(col, 1fr)` su desktop,
 * larghezza fissa e scroll-snap sotto i 768px.
 */
export default function HScroll({ col, mobileCol, max, className, children }: HScrollProps) {
	return (
		<div
			className={cn(
				'grid grid-flow-col gap-3 md:gap-4 overflow-x-auto no-scrollbar px-4 md:px-8 scroll-px-4 snap-x snap-mandatory md:snap-none',
				'auto-cols-[var(--hs-col-m)] md:auto-cols-[minmax(var(--hs-col),var(--hs-max))]',
				'[&>*]:snap-start',
				className
			)}
			style={{ '--hs-col': col, '--hs-col-m': mobileCol ?? col, '--hs-max': max ?? '1fr' } as React.CSSProperties}
		>
			{children}
		</div>
	);
}
