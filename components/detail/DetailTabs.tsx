'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/cn';

export interface DetailTab {
	key: string;
	label: string;
	content: React.ReactNode;
}

interface DetailTabsProps {
	tabs: DetailTab[];
	defaultTab?: string;
	/** Colonna laterale (sticky su desktop, sotto il contenuto sotto i 1024px). */
	aside?: React.ReactNode;
	/** Contenuto sopra i tab, solo mobile (voti, azioni). */
	mobileIntro?: React.ReactNode;
}

/** Tab sticky delle schede + layout a due colonne con aside sticky. */
export default function DetailTabs({ tabs, defaultTab, aside, mobileIntro }: DetailTabsProps) {
	const [active, setActive] = useState(defaultTab && tabs.some((t) => t.key === defaultTab) ? defaultTab : tabs[0]?.key);
	const barRef = useRef<HTMLDivElement>(null);

	const select = (key: string) => {
		setActive(key);
		// Se la barra è "incollata" in alto, riporta l'inizio del contenuto in vista
		const bar = barRef.current;
		if (bar && bar.getBoundingClientRect().top <= 1) {
			window.scrollTo({ top: bar.offsetTop, behavior: 'smooth' });
		}
	};

	const current = tabs.find((t) => t.key === active) ?? tabs[0];

	return (
		<>
			{mobileIntro && <div className="md:hidden px-4 pt-4 flex flex-col gap-4">{mobileIntro}</div>}
			<div
				ref={barRef}
				className="sticky top-0 z-20 bg-bg border-b border-line px-4 md:px-8 flex gap-5 md:gap-7 overflow-x-auto no-scrollbar mt-2 md:mt-0"
				role="tablist"
			>
				{tabs.map((t) => (
					<button
						key={t.key}
						type="button"
						role="tab"
						aria-selected={t.key === current?.key}
						onClick={() => select(t.key)}
						className={cn(
							'shrink-0 pt-4 pb-3.5 -mb-px border-b-2 text-[14px] md:text-[15px] font-bold whitespace-nowrap transition-colors duration-150',
							t.key === current?.key ? 'text-fg border-acc' : 'text-fg3 border-transparent hover:text-fg'
						)}
					>
						{t.label}
					</button>
				))}
			</div>
			<main className="px-4 md:px-8 pt-6 md:pt-8 pb-36 md:pb-[120px] grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] gap-8 lg:gap-10 items-start">
				<div className="flex flex-col gap-7 md:gap-9 min-w-0" role="tabpanel">
					{current?.content}
				</div>
				{aside && <aside className="lg:sticky lg:top-[76px] flex flex-col gap-4 min-w-0">{aside}</aside>}
			</main>
		</>
	);
}
