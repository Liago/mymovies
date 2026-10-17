import Link from 'next/link';
import { cn } from '@/lib/cn';

export interface SegmentedItem {
	key: string;
	label: React.ReactNode;
	active: boolean;
	href?: string;
	onClick?: () => void;
	/** Contatore mostrato accanto all'etichetta (solo variante `tabs`). */
	count?: number;
}

type Variant = 'segmented' | 'chips' | 'tabs' | 'text';

interface SegmentedProps {
	items: SegmentedItem[];
	variant?: Variant;
	/** Gli elementi si allargano per occupare tutta la riga (mobile). */
	fill?: boolean;
	/** Dimensione ridotta delle chip (filtri della ricerca). */
	size?: 'sm' | 'md';
	className?: string;
	ariaLabel?: string;
}

const container: Record<Variant, string> = {
	segmented: 'flex gap-0.5 p-1 rounded-full bg-bg2 max-w-full overflow-x-auto no-scrollbar',
	chips: 'flex gap-2 overflow-x-auto no-scrollbar md:flex-wrap',
	tabs: 'flex gap-[18px] md:gap-7 border-b border-line overflow-x-auto no-scrollbar',
	text: 'flex gap-1.5 overflow-x-auto no-scrollbar',
};

const base: Record<Variant, string> = {
	segmented: 'h-9 md:h-9 px-4 md:px-[18px] rounded-full text-[13px] md:text-[14px] font-bold whitespace-nowrap transition-[background-color,color] duration-150',
	chips: 'h-[38px] px-4 rounded-full text-[13px] md:text-[14px] font-bold whitespace-nowrap shrink-0 transition-[background-color,color] duration-150',
	tabs: 'h-11 md:h-auto md:pt-[14px] md:pb-3 -mb-px border-b-2 text-[14px] md:text-[15px] font-bold whitespace-nowrap shrink-0 flex items-center gap-1.5 transition-colors duration-150',
	text: 'h-8 px-3 rounded-[10px] text-[13px] font-semibold whitespace-nowrap shrink-0 transition-[color,box-shadow] duration-150',
};

const active: Record<Variant, string> = {
	segmented: 'bg-card text-fg shadow-segment',
	chips: 'bg-fg text-bg',
	tabs: 'text-fg border-acc',
	text: 'text-fg shadow-[inset_0_-2px_0_var(--fg)]',
};

const inactive: Record<Variant, string> = {
	segmented: 'text-fg3 hover:text-fg',
	chips: 'bg-bg2 text-fg2 hover:text-fg',
	tabs: 'text-fg3 border-transparent hover:text-fg',
	text: 'text-fg2 hover:text-fg',
};

/**
 * Controlli di selezione del design: segmented control, chip, tab sottolineati
 * e tab testuali (generi). Ogni voce può essere un link o un pulsante.
 */
export default function Segmented({ items, variant = 'segmented', fill = false, size = 'md', className, ariaLabel }: SegmentedProps) {
	return (
		<div className={cn(container[variant], className)} role="tablist" aria-label={ariaLabel}>
			{items.map((item) => {
				const cls = cn(
					size === 'sm' && variant === 'chips'
						? 'h-8 px-3.5 rounded-full text-[13px] font-bold whitespace-nowrap shrink-0 transition-[background-color,color] duration-150'
						: base[variant],
					item.active ? active[variant] : inactive[variant],
					fill && 'flex-1 justify-center text-center'
				);
				const content = (
					<>
						{item.label}
						{variant === 'tabs' && typeof item.count === 'number' && (
							<span className="text-[11px] font-bold px-[7px] py-0.5 rounded-full bg-bg2 text-fg2">{item.count}</span>
						)}
					</>
				);
				return item.href ? (
					<Link
						key={item.key}
						href={item.href}
						scroll={false}
						replace
						role="tab"
						aria-selected={item.active}
						className={cn(cls, 'inline-flex items-center')}
					>
						{content}
					</Link>
				) : (
					<button
						key={item.key}
						type="button"
						role="tab"
						aria-selected={item.active}
						onClick={item.onClick}
						className={cls}
					>
						{content}
					</button>
				);
			})}
		</div>
	);
}
