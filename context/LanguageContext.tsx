'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

type Language = 'en-US' | 'it-IT';

interface LanguageContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
	'en-US': {
		'nav.home': 'Home',
		'nav.movies': 'Movies',
		'nav.tv': 'TV Series',
		'nav.new': 'New & Popular',
		'nav.list': 'My List',
		'nav.login': 'Login with TMDB',
		'nav.profile': 'Profile',
		'nav.favorites': 'Favorites',
		'nav.watchlist': 'Watchlist',
		'nav.logout': 'Logout',
		'hero.watch_trailer': 'Watch Trailer',
		'hero.more_info': 'More Info',
		'section.trending': 'Trending Now',
		'section.top_rated': 'Top Rated',
		'section.action': 'Action',
		'section.comedy': 'Comedy',
		'section.drama': 'Drama',
		'section.horror': 'Horror',
		'section.scifi': 'Sci-Fi',
		'footer.copyright': '© 2024 MovieApp. All rights reserved.',
		'following.button': 'Following',
		'following.title': 'Series You Follow',
		'following.desc': 'The TV shows you are currently following.',
		'following.empty': "You aren't following any series yet",
		'following.empty_desc': 'Start tracking a show from any TV series page to see it here.',
		'following.filter_all': 'All',
		'following.filter_ended': 'Ended to finish',
		'following.filter_hint': 'Terminated series you still have episodes left to watch.',
		'following.no_ended': 'No ended series left to finish',
		'following.no_ended_desc': "You're all caught up — every terminated series has been completed.",
		'following.browse': 'Browse TV Shows',
		'following.loading': 'Loading your series…',
	},
	'it-IT': {
		'nav.home': 'Home',
		'nav.movies': 'Film',
		'nav.tv': 'Serie TV',
		'nav.new': 'Novità',
		'nav.list': 'La mia lista',
		'nav.login': 'Accedi con TMDB',
		'nav.profile': 'Profilo',
		'nav.favorites': 'Preferiti',
		'nav.watchlist': 'Watchlist',
		'nav.logout': 'Esci',
		'hero.watch_trailer': 'Guarda Trailer',
		'hero.more_info': 'Altre Info',
		'section.trending': 'Di Tendenza',
		'section.top_rated': 'Più Votati',
		'section.action': 'Azione',
		'section.comedy': 'Commedia',
		'section.drama': 'Drammatico',
		'section.horror': 'Horror',
		'section.scifi': 'Fantascienza',
		'footer.copyright': '© 2024 MovieApp. Tutti i diritti riservati.',
		'following.button': 'Serie seguite',
		'following.title': 'Serie che segui',
		'following.desc': 'Le serie TV che stai seguendo.',
		'following.empty': 'Non stai ancora seguendo nessuna serie',
		'following.empty_desc': 'Inizia a seguire una serie da una qualsiasi pagina per vederla qui.',
		'following.filter_all': 'Tutte',
		'following.filter_ended': 'Terminate da finire',
		'following.filter_hint': 'Serie terminate di cui hai ancora episodi da vedere.',
		'following.no_ended': 'Nessuna serie terminata da finire',
		'following.no_ended_desc': 'Sei in pari: hai completato tutte le serie terminate.',
		'following.browse': 'Esplora le Serie TV',
		'following.loading': 'Caricamento delle tue serie…',
	}
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
	const [language, setLanguage] = useState<Language>('it-IT');
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const savedLang = Cookies.get('app_language') as Language;
		if (savedLang && (savedLang === 'en-US' || savedLang === 'it-IT')) {
			setLanguage(savedLang);
		}
		setIsLoaded(true);
	}, []);

	const changeLanguage = (lang: Language) => {
		setLanguage(lang);
		Cookies.set('app_language', lang, { expires: 365 });
		window.location.reload(); // Reload to refresh server components with new language
	};

	const t = (key: string) => {
		return translations[language][key] || key;
	};

	// Always provide context, but use default language if not loaded yet to prevent "must be used within Provider" errors
	// during SSR or initial client render.
	return (
		<LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
			{children}
		</LanguageContext.Provider>
	);
}

export function useLanguage() {
	const context = useContext(LanguageContext);
	if (context === undefined) {
		throw new Error('useLanguage must be used within a LanguageProvider');
	}
	return context;
}
