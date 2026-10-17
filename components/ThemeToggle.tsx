'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/useMounted';

interface ThemeToggleProps {
	className?: string;
}

/** Pulsante sole/luna: alterna tra tema chiaro e scuro. */
export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
	const { resolvedTheme, setTheme } = useTheme();
	const mounted = useMounted();

	const isDark = mounted ? resolvedTheme === 'dark' : true;

	return (
		<button
			type="button"
			onClick={() => setTheme(isDark ? 'light' : 'dark')}
			className={className}
			aria-label={isDark ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
			title={isDark ? 'Tema chiaro' : 'Tema scuro'}
		>
			{isDark ? <Sun size={18} /> : <Moon size={18} />}
		</button>
	);
}
