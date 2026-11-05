'use client';

import { useEffect } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

/** Colori della barra del browser/PWA, allineati a `--bg` in globals.css. */
const THEME_COLORS = { light: '#f5f5f3', dark: '#0e0e10' } as const;

/**
 * Allinea i <meta name="theme-color"> al tema effettivo: senza questo, con un
 * tema forzato (es. chiaro su OS scuro) la barra seguirebbe ancora l'OS.
 * In modalità "sistema" `resolvedTheme` segue già `prefers-color-scheme`.
 */
function ThemeColorSync() {
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		if (resolvedTheme !== 'light' && resolvedTheme !== 'dark') return;
		const color = THEME_COLORS[resolvedTheme];
		document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
			meta.content = color;
		});
	}, [resolvedTheme]);

	return null;
}

/**
 * Tema chiaro / scuro / sistema: classe `dark` su <html>, default = preferenza
 * di sistema (aggiornata in tempo reale al cambio dell'OS), scelta persistita
 * in localStorage da next-themes.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider
			attribute="class"
			themes={['light', 'dark']}
			defaultTheme="system"
			enableSystem
			disableTransitionOnChange
		>
			<ThemeColorSync />
			{children}
		</NextThemesProvider>
	);
}
