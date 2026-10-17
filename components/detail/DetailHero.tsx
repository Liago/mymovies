import { cn } from '@/lib/cn';

interface DetailHeroProps {
	backdrop: string | null;
	/** Altezza desktop: film `min(78vh,740px)`, serie `min(70vh,640px)`. */
	variant: 'movie' | 'tv';
	/** Pulsante indietro: pill su desktop… */
	back: React.ReactNode;
	/** …e tondo 44px su mobile. */
	mobileBack: React.ReactNode;
	eyebrow?: string | null;
	title: string;
	/** Riga meta compatta mostrata solo su mobile. */
	mobileMeta?: string;
	chips: string[];
	actions?: React.ReactNode;
	ratings?: React.ReactNode;
}

/**
 * Hero delle schede film/serie: backdrop a tutto schermo che sfuma nello
 * sfondo della pagina, testo sempre bianco sull'immagine.
 */
export default function DetailHero({ backdrop, variant, back, mobileBack, eyebrow, title, mobileMeta, chips, actions, ratings }: DetailHeroProps) {
	return (
		<section
			className={cn(
				'relative overflow-hidden bg-[#1d1a17] text-white',
				variant === 'movie'
					? 'h-[440px] md:h-[min(78vh,740px)] md:min-h-[560px]'
					: 'h-[340px] md:h-[min(70vh,640px)] md:min-h-[520px]'
			)}
		>
			{backdrop ? (
				<img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover" fetchPriority="high" />
			) : (
				<div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#2b2621_0_16px,#25211d_16px_32px)]" />
			)}
			<div className="absolute inset-0 hero-fade-strong" />

			<div className="md:hidden absolute top-[max(16px,env(safe-area-inset-top))] left-4">{mobileBack}</div>

			<div
				className={cn(
					'absolute left-4 right-4 md:left-8 md:right-8 grid md:grid-cols-[minmax(0,1fr)_auto] gap-8 items-end',
					variant === 'movie' ? 'bottom-4 md:bottom-10' : 'bottom-3.5 md:bottom-9'
				)}
			>
				<div className="flex flex-col gap-2 md:gap-3.5 max-w-[720px] min-w-0">
					<div className="hidden md:block">{back}</div>
					{eyebrow && <span className="kicker text-[11px] md:text-[12px]">{eyebrow}</span>}
					<h1 className="m-0 text-[38px] md:text-[clamp(44px,5.6vw,80px)] font-extrabold leading-none md:leading-[0.96] tracking-[-0.04em] text-balance [text-shadow:0_1px_14px_rgba(0,0,0,0.28)]">
						{title}
					</h1>
					{mobileMeta && <span className="md:hidden text-[13px] font-semibold text-white/80 [text-shadow:0_1px_14px_rgba(0,0,0,0.28)]">{mobileMeta}</span>}
					{chips.length > 0 && (
						<div className="hidden md:flex flex-wrap gap-2 text-[13px] font-semibold">
							{chips.map((chip) => (
								<span key={chip} className="px-2.5 py-[5px] rounded-lg bg-white/[0.16] whitespace-nowrap">
									{chip}
								</span>
							))}
						</div>
					)}
					{actions && <div className="hidden md:flex gap-2.5 mt-1.5 flex-wrap">{actions}</div>}
				</div>
				{ratings && <div className="hidden md:flex gap-2.5">{ratings}</div>}
			</div>
		</section>
	);
}
