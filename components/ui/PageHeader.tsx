import { cn } from '@/lib/cn';

interface PageHeaderProps {
	eyebrow?: string;
	title: React.ReactNode;
	subtitle?: React.ReactNode;
	/** Contenuto a destra (segmented control, pulsanti). */
	actions?: React.ReactNode;
	/** Elemento a sinistra del titolo (es. pulsante indietro su mobile). */
	leading?: React.ReactNode;
	className?: string;
}

/** Eyebrow in accento + H1 800/52px (30px su mobile) + azioni a destra. */
export default function PageHeader({ eyebrow, title, subtitle, actions, leading, className }: PageHeaderProps) {
	return (
		<div className={cn('flex items-end justify-between gap-5 flex-wrap', className)}>
			<div className="flex items-center gap-2 min-w-0">
				{leading}
				<div className="flex flex-col min-w-0">
					{eyebrow && <span className="kicker hidden md:block">{eyebrow}</span>}
					<h1 className="text-[30px] md:text-[52px] font-extrabold leading-none tracking-[-0.04em] md:mt-1.5 text-balance">
						{title}
					</h1>
					{subtitle && <p className="mt-1.5 text-[13px] md:text-[14px] font-medium text-fg3">{subtitle}</p>}
				</div>
			</div>
			{actions && <div className="flex items-center gap-2 max-w-full">{actions}</div>}
		</div>
	);
}
