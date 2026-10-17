import {
	Award,
	Bookmark,
	CalendarClock,
	CalendarDays,
	CircleCheck,
	Clapperboard,
	Compass,
	House,
	Newspaper,
	TrendingUp,
	User,
	type LucideIcon,
} from 'lucide-react';

export interface ExploreItem {
	label: string;
	description: string;
	href: string;
	icon: LucideIcon;
}

/** Voci del popover "Esplora" (ordine a due colonne del design). */
export const EXPLORE_ITEMS: ExploreItem[] = [
	{ label: 'Di tendenza', description: 'Più visti della settimana', href: '/catalogo/trending', icon: TrendingUp },
	{ label: 'Timeline', description: 'Nuovi episodi in arrivo', href: '/timeline', icon: CalendarDays },
	{ label: 'Più votati', description: 'I voti più alti di sempre', href: '/catalogo/top-rated', icon: Award },
	{ label: 'Tracker', description: 'I tuoi progressi', href: '/tracker', icon: CircleCheck },
	{ label: 'Al cinema', description: 'In sala adesso', href: '/catalogo/now-playing', icon: Clapperboard },
	{ label: 'Watchlist e liste', description: 'Salvati e preferiti', href: '/profile?tab=watchlist', icon: Bookmark },
	{ label: 'In uscita', description: 'Prossime prime visioni', href: '/catalogo/upcoming', icon: CalendarClock },
	{ label: 'Notizie', description: 'Dai tuoi feed RSS', href: '/news', icon: Newspaper },
];

export interface TabItem {
	label: string;
	href: string;
	icon: LucideIcon;
	match: (pathname: string) => boolean;
}

/** Tab bar mobile: 5 voci, Film/Serie/Notizie sono schermate "push". */
export const MOBILE_TABS: TabItem[] = [
	{ label: 'Home', href: '/', icon: House, match: (p) => p === '/' },
	{ label: 'Esplora', href: '/esplora', icon: Compass, match: (p) => p.startsWith('/esplora') || p.startsWith('/catalogo') },
	{ label: 'Timeline', href: '/timeline', icon: CalendarDays, match: (p) => p.startsWith('/timeline') },
	{ label: 'Tracker', href: '/tracker', icon: CircleCheck, match: (p) => p.startsWith('/tracker') },
	{ label: 'Profilo', href: '/profile', icon: User, match: (p) => p.startsWith('/profile') || p.startsWith('/history') },
];

/** Pagine con hero a tutto schermo: header bianco sopra l'immagine. */
export function isHeroPage(pathname: string): boolean {
	return pathname === '/' || /^\/(movie|tv)\/[^/]+$/.test(pathname);
}
