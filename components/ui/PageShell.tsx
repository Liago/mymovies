import { cn } from '@/lib/cn';

const widths = {
	wide: 'max-w-[1480px]',
	news: 'max-w-[1280px]',
	narrow: 'max-w-[1100px]',
} as const;

interface PageShellProps {
	width?: keyof typeof widths;
	className?: string;
	children: React.ReactNode;
}

/**
 * Contenitore delle pagine senza hero: spazio per l'header (desktop) o per la
 * status bar (mobile) in alto e per la tab bar mobile in basso.
 */
export default function PageShell({ width = 'wide', className, children }: PageShellProps) {
	return (
		<main
			className={cn(
				'mx-auto w-full px-4 md:px-8 pt-[calc(env(safe-area-inset-top)+24px)] md:pt-[100px] pb-36 md:pb-[120px] flex flex-col gap-[14px] md:gap-6',
				widths[width],
				className
			)}
		>
			{children}
		</main>
	);
}
