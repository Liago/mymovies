import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface SectionTitleProps {
	title: string;
	href?: string;
	/** Contenuto a destra del titolo (testo secondario o controlli). */
	aside?: React.ReactNode;
	className?: string;
}

/** H2 di sezione (700/22px) con chevron quando la sezione porta a una lista. */
export default function SectionTitle({ title, href, aside, className }: SectionTitleProps) {
	const heading = (
		<h2 className="text-[19px] md:text-[22px] font-bold tracking-[-0.02em] flex items-center gap-1.5">
			{title}
			{href && <ChevronRight size={20} className="text-fg3" />}
		</h2>
	);

	return (
		<div className={cn('flex items-center justify-between gap-4 flex-wrap px-4 md:px-8 mb-[10px] md:mb-[14px]', className)}>
			{href ? (
				<Link href={href} className="hover:opacity-80 transition-opacity">
					{heading}
				</Link>
			) : (
				heading
			)}
			{aside}
		</div>
	);
}
