'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/cn';
import { canGoBackInApp, markInAppBack } from '@/lib/in-app-history';

interface BackButtonProps {
	fallbackHref?: string;
	label?: string;
	/** `pill` (vetro su immagine), `round` (44px su immagine), `plain` (44px su sfondo pagina). */
	variant?: 'pill' | 'round' | 'plain';
	className?: string;
}

export default function BackButton({ fallbackHref = '/', label = 'Indietro', variant = 'pill', className }: BackButtonProps) {
	const router = useRouter();

	const handleBack = () => {
		// Torna indietro solo se la pagina precedente è dell'app (non una nuova scheda o un sito esterno)
		if (canGoBackInApp()) {
			markInAppBack();
			router.back();
		} else {
			router.push(fallbackHref);
		}
	};

	if (variant === 'pill') {
		return (
			<button
				type="button"
				onClick={handleBack}
				className={cn(
					'self-start h-9 pl-2.5 pr-3.5 rounded-full glass-on-image text-[13px] font-semibold flex items-center gap-1 transition-opacity hover:opacity-80',
					className
				)}
			>
				<ChevronLeft size={16} />
				{label}
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={handleBack}
			aria-label={label}
			className={cn(
				'w-11 h-11 shrink-0 rounded-full flex items-center justify-center transition-opacity hover:opacity-80',
				variant === 'round' ? 'glass-on-image' : 'bg-bg2 text-fg',
				className
			)}
		>
			<ChevronLeft size={20} />
		</button>
	);
}
