'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { isHeroPage } from '@/lib/navigation';
import { cn } from '@/lib/cn';

/** Oltre questa soglia di scroll la fascia compare anche sulle pagine con hero. */
const HERO_SCROLL_THRESHOLD = 24;

/**
 * Fascia opaca dietro la status bar quando l'app è salvata nella Home di
 * iPhone/iPad (`black-translucent` + `viewport-fit=cover`): senza di essa il
 * contenuto scorre sotto l'orologio e iOS lo copre con la sua sfumatura,
 * rendendo la status bar poco leggibile. In Safari, o su dispositivi senza
 * safe area, l'altezza è 0 e il componente non ha alcun effetto.
 *
 * Sulle pagine con hero resta trasparente finché si è in cima, così
 * l'immagine continua a vedersi sotto la status bar.
 */
export default function StatusBarScrim() {
	const pathname = usePathname() || '/';
	const onHero = isHeroPage(pathname);
	const [scrolled, setScrolled] = useState<boolean>(false);

	useEffect(() => {
		if (!onHero) return;
		const update = (): void => setScrolled(window.scrollY > HERO_SCROLL_THRESHOLD);
		update();
		window.addEventListener('scroll', update, { passive: true });
		return () => window.removeEventListener('scroll', update);
	}, [onHero]);

	const visible = !onHero || scrolled;

	return (
		<div
			aria-hidden="true"
			className={cn(
				'fixed top-0 inset-x-0 z-[60] h-[env(safe-area-inset-top)] bg-bg pointer-events-none transition-opacity duration-200',
				visible ? 'opacity-100' : 'opacity-0'
			)}
		/>
	);
}
