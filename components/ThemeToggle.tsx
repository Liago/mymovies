'use client';

import { Monitor, Moon, Sun, type LucideIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useMounted } from '@/hooks/useMounted';

interface ThemeToggleProps {
	className?: string;
}

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeModeInfo {
	icon: LucideIcon;
	label: string;
	next: ThemeMode;
}

/** Ciclo: Chiaro → Scuro → Sistema → Chiaro. */
const MODES: Record<ThemeMode, ThemeModeInfo> = {
	light: { icon: Sun, label: 'Tema chiaro', next: 'dark' },
	dark: { icon: Moon, label: 'Tema scuro', next: 'system' },
	system: { icon: Monitor, label: 'Tema di sistema', next: 'light' },
};

const isThemeMode = (value: string | undefined): value is ThemeMode =>
	value === 'light' || value === 'dark' || value === 'system';

/**
 * Pulsante tema a tre stati: chiaro, scuro e sistema (segue
 * `prefers-color-scheme` e si aggiorna in automatico quando cambia l'OS).
 */
export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
	const { theme, resolvedTheme, setTheme } = useTheme();
	const mounted = useMounted();

	// Prima dell'idratazione il tema non è noto: si mostra "sistema" (il default).
	const current: ThemeMode = mounted && isThemeMode(theme) ? theme : 'system';
	const { icon: Icon, label, next } = MODES[current];
	const nextLabel = MODES[next].label.toLowerCase();
	const detail = current === 'system' && mounted && resolvedTheme ? ` (ora ${resolvedTheme === 'dark' ? 'scuro' : 'chiaro'})` : '';

	return (
		<button
			type="button"
			onClick={() => setTheme(next)}
			className={className}
			aria-label={`${label}${detail}. Passa al ${nextLabel}`}
			title={`${label}${detail}`}
		>
			<Icon size={18} />
		</button>
	);
}
