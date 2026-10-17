'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

/**
 * Tema chiaro/scuro: classe `dark` su <html>, default = preferenza di sistema,
 * scelta persistita in localStorage da next-themes.
 */
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
	return (
		<NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
			{children}
		</NextThemesProvider>
	);
}
