'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown, LogIn, Search } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import SearchOverlay from './SearchOverlay';
import ThemeToggle from './ThemeToggle';
import UserAvatar from './UserAvatar';
import { useAuth } from '@/context/AuthContext';
import { EXPLORE_ITEMS, isHeroPage } from '@/lib/navigation';
import { cn } from '@/lib/cn';

const roundButton =
	'w-[42px] h-[42px] rounded-full border border-line glass text-fg flex items-center justify-center transition-opacity duration-150 hover:opacity-80';

/**
 * Header desktop: logo, pill di navigazione in vetro con il popover "Esplora",
 * ricerca (anche con ⌘K), tema e avatar. Sotto i 768px è sostituito dalla
 * tab bar mobile.
 */
export default function Navbar() {
	const pathname = usePathname() || '/';
	const searchParams = useSearchParams();
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	// Il popover resta aperto solo sulla pagina in cui è stato aperto
	const [exploreOpenAt, setExploreOpenAt] = useState<string | null>(null);
	const exploreRef = useRef<HTMLDivElement>(null);
	const { isLoggedIn, user, isLoading, hasMounted, login } = useAuth();

	const routeKey = `${pathname}?${searchParams?.toString() ?? ''}`;
	const isExploreOpen = exploreOpenAt === routeKey;
	const setIsExploreOpen = useCallback(
		(open: boolean | ((prev: boolean) => boolean)) =>
			setExploreOpenAt((prev) => {
				const next = typeof open === 'function' ? open(prev === routeKey) : open;
				return next ? routeKey : null;
			}),
		[routeKey]
	);
	const onHero = isHeroPage(pathname);
	const catalogType = pathname.startsWith('/catalogo') ? (searchParams?.get('type') === 'tv' ? 'tv' : 'movie') : null;

	const mainNav = [
		{ label: 'Home', href: '/', active: pathname === '/' },
		{ label: 'Film', href: '/catalogo/trending?type=movie', active: pathname.startsWith('/movie/') || catalogType === 'movie' },
		{ label: 'Serie TV', href: '/catalogo/trending?type=tv', active: pathname.startsWith('/tv/') || catalogType === 'tv' },
	];

	// Click fuori / Esc chiudono il popover Esplora
	useEffect(() => {
		if (!isExploreOpen) return;
		const onPointer = (e: MouseEvent) => {
			if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) setIsExploreOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setIsExploreOpen(false);
		};
		document.addEventListener('mousedown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [isExploreOpen, setIsExploreOpen]);

	// Scorciatoia ⌘K / Ctrl+K per la ricerca
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setIsExploreOpen(false);
				setIsSearchOpen(true);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [setIsExploreOpen]);

	const closeSearch = useCallback(() => setIsSearchOpen(false), []);

	return (
		<>
			<header className="hidden md:grid absolute top-0 inset-x-0 z-50 px-8 py-[18px] grid-cols-[1fr_auto_1fr] items-center gap-4">
				<Link
					href="/"
					className={cn(
						'justify-self-start flex items-center gap-1.5 text-[22px] font-extrabold tracking-[-0.03em] transition-opacity hover:opacity-80',
						onHero ? 'text-white' : 'text-fg'
					)}
				>
					cinescope
					<span className="w-[7px] h-[7px] rounded-full bg-acc" />
				</Link>

				<nav className="relative flex gap-0.5 p-1 rounded-full glass border border-line text-[14px] font-semibold" ref={exploreRef}>
					{mainNav.map((item) => (
						<Link
							key={item.label}
							href={item.href}
							aria-current={item.active ? 'page' : undefined}
							className={cn(
								'px-[18px] py-[9px] rounded-full whitespace-nowrap transition-colors duration-150',
								item.active ? 'bg-fg text-bg' : 'text-fg hover:bg-bg2/70'
							)}
						>
							{item.label}
						</Link>
					))}
					<button
						type="button"
						onClick={() => setIsExploreOpen((v) => !v)}
						aria-expanded={isExploreOpen}
						aria-haspopup="true"
						className={cn(
							'px-4 py-[9px] rounded-full flex items-center gap-1.5 text-fg transition-colors duration-150',
							isExploreOpen ? 'bg-bg2' : 'hover:bg-bg2/70'
						)}
					>
						Esplora
						<ChevronDown size={14} className={cn('transition-transform duration-200', isExploreOpen && 'rotate-180')} />
					</button>

					{isExploreOpen && (
						<div className="animate-pop-in absolute top-[calc(100%+10px)] left-1/2 -translate-x-1/2 w-[560px] p-3 grid grid-cols-2 gap-1.5 bg-card border border-line rounded-[22px] shadow-popover">
							{EXPLORE_ITEMS.map(({ label, description, href, icon: Icon }) => (
								<Link
									key={label}
									href={href}
									onClick={() => setIsExploreOpen(false)}
									className="flex items-center gap-3 p-2.5 rounded-[14px] transition-colors duration-150 hover:bg-bg2"
								>
									<span className="w-10 h-10 shrink-0 rounded-xl bg-bg2 flex items-center justify-center">
										<Icon size={18} className="text-acc" />
									</span>
									<span className="flex flex-col">
										<span className="text-[14px] font-semibold text-fg">{label}</span>
										<span className="text-[12px] font-medium text-fg3">{description}</span>
									</span>
								</Link>
							))}
						</div>
					)}
				</nav>

				<div className="justify-self-end flex items-center gap-2">
					<button
						type="button"
						onClick={() => setIsSearchOpen(true)}
						className={roundButton}
						aria-label="Cerca (⌘K)"
						title="Cerca (⌘K)"
					>
						<Search size={18} />
					</button>
					<ThemeToggle className={roundButton} />
					{!hasMounted || isLoading ? (
						<span className="w-[42px] h-[42px] rounded-full bg-ph1 animate-pulse" />
					) : isLoggedIn && user ? (
						<UserAvatar size={42} />
					) : (
						<button
							type="button"
							onClick={() => login()}
							className="h-[42px] px-4 rounded-full bg-acc text-accfg text-[14px] font-bold flex items-center gap-2 transition-opacity hover:opacity-80"
						>
							<LogIn size={16} />
							Accedi
						</button>
					)}
				</div>
			</header>

			<SearchOverlay isOpen={isSearchOpen} onClose={closeSearch} />
		</>
	);
}
