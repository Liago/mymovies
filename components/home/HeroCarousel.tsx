'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Info, Newspaper, Play, Plus, Search, User } from 'lucide-react';
import TrailerModal from '../TrailerModal';
import UserAvatar from '../UserAvatar';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';

export interface HeroSlide {
	id: number;
	type: 'movie' | 'tv';
	title: string;
	kicker: string;
	chips: string[];
	/** Riga meta compatta per mobile ("Fantascienza · 2024 · IMDb 8.5"). */
	meta: string;
	overview: string;
	backdrop: string | null;
	poster: string | null;
	trailerUrl: string | null;
	service: string | null;
	serviceLogo: string | null;
}

const AUTOPLAY_MS = 8000;

/**
 * Hero della Home: carosello a tutto schermo dei titoli di tendenza con
 * autoplay ogni 8s (in pausa al passaggio del mouse) e puntini cliccabili.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
	const [index, setIndex] = useState(0);
	const [paused, setPaused] = useState(false);
	const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
	const timer = useRef<ReturnType<typeof setInterval> | null>(null);
	const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
	const { isLoggedIn, hasMounted } = useAuth();

	const count = slides.length;
	const slide = slides[Math.min(index, count - 1)];

	useEffect(() => {
		if (paused || count < 2 || trailerUrl) return;
		timer.current = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
		return () => {
			if (timer.current) clearInterval(timer.current);
		};
	}, [paused, count, trailerUrl, index]);

	const inWatchlist = slide ? isInWatchlist(slide.id, slide.type) : false;

	const toggleWatchlist = useCallback(() => {
		if (!slide) return;
		if (inWatchlist) removeFromWatchlist(slide.id, slide.type);
		else addToWatchlist({ id: slide.id, media_type: slide.type, title: slide.title, poster: slide.poster });
	}, [slide, inWatchlist, addToWatchlist, removeFromWatchlist]);

	if (!slide) return <section className="h-[470px] md:h-[min(82vh,780px)] md:min-h-[560px] bg-[#1d1a17]" />;

	const href = `/${slide.type}/${slide.id}`;

	return (
		<section
			className="relative h-[470px] md:h-[min(82vh,780px)] md:min-h-[560px] overflow-hidden bg-[#1d1a17] text-white"
			onMouseEnter={() => setPaused(true)}
			onMouseLeave={() => setPaused(false)}
			aria-roledescription="carosello"
		>
			{slides.map((s, i) => (
				<div
					key={s.id}
					className={cn(
						'absolute inset-0 transition-opacity duration-700 ease-out',
						i === index ? 'opacity-100' : 'opacity-0'
					)}
					aria-hidden={i !== index}
				>
					{s.backdrop ? (
						<img
							src={s.backdrop}
							alt=""
							className="absolute inset-0 w-full h-full object-cover"
							loading={i === 0 ? 'eager' : 'lazy'}
							fetchPriority={i === 0 ? 'high' : 'auto'}
						/>
					) : (
						<div className="absolute inset-0 bg-[repeating-linear-gradient(135deg,#2b2621_0_16px,#25211d_16px_32px)]" />
					)}
				</div>
			))}
			<div className="absolute inset-0 hero-fade" />

			{/* Barra superiore mobile (sul desktop c'è l'header globale) */}
			<div className="md:hidden absolute top-[max(16px,env(safe-area-inset-top))] inset-x-4 flex items-center justify-between">
				<span className="flex items-center gap-[5px] text-[20px] font-extrabold tracking-[-0.03em]">
					cinescope
					<span className="w-1.5 h-1.5 rounded-full bg-acc" />
				</span>
				<div className="flex gap-2">
					<Link href="/news" className="w-11 h-11 rounded-full glass-on-image flex items-center justify-center" aria-label="Notizie">
						<Newspaper size={19} />
					</Link>
					<Link href="/esplora" className="w-11 h-11 rounded-full glass-on-image flex items-center justify-center" aria-label="Cerca">
						<Search size={19} />
					</Link>
					{hasMounted && isLoggedIn ? (
						<UserAvatar size={44} />
					) : (
						<Link href="/profile" className="w-11 h-11 rounded-full bg-acc text-accfg flex items-center justify-center" aria-label="Profilo">
							<User size={19} />
						</Link>
					)}
				</div>
			</div>

			<div className="absolute left-4 right-4 bottom-5 md:left-8 md:right-8 md:bottom-12 flex justify-between items-end gap-8">
				<div key={slide.id} className="max-w-[620px] flex flex-col gap-2.5 md:gap-4 animate-fade-in min-w-0">
					<span className="kicker text-[11px] md:text-[12px]">{slide.kicker}</span>
					<h1 className="m-0 text-[40px] md:text-[clamp(44px,5.6vw,76px)] font-extrabold leading-none md:leading-[0.98] tracking-[-0.04em] text-balance [text-shadow:0_1px_14px_rgba(0,0,0,0.28)]">
						<Link href={href} className="hover:opacity-90">{slide.title}</Link>
					</h1>
					<span className="md:hidden text-[13px] font-semibold text-white/80 [text-shadow:0_1px_14px_rgba(0,0,0,0.28)]">{slide.meta}</span>
					<div className="hidden md:flex flex-wrap gap-2 text-[13px] font-semibold">
						{slide.chips.map((chip) => (
							<span key={chip} className="px-2.5 py-[5px] whitespace-nowrap rounded-lg bg-white/[0.16] backdrop-blur-[10px]">
								{chip}
							</span>
						))}
					</div>
					{slide.overview && (
						<p className="hidden md:block m-0 text-[17px] leading-[1.5] font-medium text-white/[0.82] line-clamp-3 text-pretty">
							{slide.overview}
						</p>
					)}
					<div className="flex gap-2 md:gap-2.5 mt-1">
						{slide.trailerUrl ? (
							<button
								type="button"
								onClick={() => setTrailerUrl(slide.trailerUrl)}
								className="flex-1 md:flex-none h-12 md:h-[50px] px-6 rounded-full bg-white text-[#111] text-[15px] font-bold flex items-center justify-center gap-2.5 transition-opacity hover:opacity-90"
							>
								<Play size={16} />
								Trailer
							</button>
						) : (
							<Link
								href={href}
								className="flex-1 md:hidden h-12 px-6 rounded-full bg-white text-[#111] text-[15px] font-bold flex items-center justify-center"
							>
								Dettagli
							</Link>
						)}
						<Link
							href={href}
							className="hidden md:flex h-[50px] px-[22px] rounded-full glass-on-image text-[15px] font-bold items-center transition-opacity hover:opacity-80"
						>
							Dettagli
						</Link>
						<Link
							href={href}
							className="md:hidden w-12 h-12 shrink-0 rounded-full glass-on-image flex items-center justify-center"
							aria-label="Dettagli"
						>
							<Info size={20} />
						</Link>
						<button
							type="button"
							onClick={toggleWatchlist}
							className={cn(
								'hidden md:flex w-[50px] h-[50px] rounded-full items-center justify-center backdrop-blur-[12px] transition-colors',
								inWatchlist ? 'bg-acc text-accfg' : 'bg-white/[0.18] text-white hover:bg-white/25'
							)}
							aria-pressed={inWatchlist}
							aria-label={inWatchlist ? 'Rimuovi dalla watchlist' : 'Aggiungi alla watchlist'}
							title={inWatchlist ? 'In watchlist' : 'Aggiungi alla watchlist'}
						>
							{inWatchlist ? <Check size={19} /> : <Plus size={19} />}
						</button>
					</div>
				</div>

				<div className="hidden md:flex flex-col items-end gap-3.5 shrink-0">
					{slide.service && (
						<span className="flex items-center gap-2 text-[13px] font-semibold text-white/80">
							{slide.serviceLogo ? (
								<img src={slide.serviceLogo} alt="" className="w-[22px] h-[22px] rounded-md object-cover" />
							) : (
								<span className="w-[22px] h-[22px] rounded-md bg-white/25" />
							)}
							{slide.service}
						</span>
					)}
					{count > 1 && (
						<div className="flex gap-1.5">
							{slides.map((s, i) => (
								<button
									key={s.id}
									type="button"
									onClick={() => setIndex(i)}
									className={cn(
										'h-1.5 rounded-full p-0 transition-all duration-300',
										i === index ? 'w-[22px] bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
									)}
									aria-label={`Vai alla slide ${i + 1}`}
									aria-current={i === index}
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<TrailerModal isOpen={!!trailerUrl} onClose={() => setTrailerUrl(null)} youtubeUrl={trailerUrl} />
		</section>
	);
}
