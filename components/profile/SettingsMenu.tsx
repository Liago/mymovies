'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, History, LogIn, LogOut, Monitor, Moon, Rss, Settings, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/cn';

/**
 * Menu "Impostazioni" del profilo: tema, lingua dei contenuti, feed RSS,
 * cronologia e accesso/uscita (prima nel vecchio header).
 */
export default function SettingsMenu({ compact = false }: { compact?: boolean }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useTheme();
	const { language, setLanguage } = useLanguage();
	const { isLoggedIn, login, logout } = useAuth();

	useEffect(() => {
		if (!open) return;
		const onPointer = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
		document.addEventListener('mousedown', onPointer);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onPointer);
			document.removeEventListener('keydown', onKey);
		};
	}, [open]);

	const option = (active: boolean) =>
		cn(
			'flex-1 h-9 rounded-full text-[13px] font-bold flex items-center justify-center gap-1.5 transition-colors',
			active ? 'bg-card text-fg shadow-segment' : 'text-fg3 hover:text-fg'
		);
	const row = 'flex items-center gap-3 px-3 h-11 rounded-[12px] text-[14px] font-semibold transition-colors hover:bg-bg2';

	return (
		<div className="relative ml-auto" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-haspopup="menu"
				aria-label="Impostazioni"
				className={cn(
					'rounded-full bg-bg2 flex items-center justify-center gap-2 text-[14px] font-bold transition-opacity hover:opacity-80',
					compact ? 'w-11 h-11' : 'h-10 px-4'
				)}
			>
				<Settings size={compact ? 19 : 16} />
				{!compact && 'Impostazioni'}
			</button>

			{open && (
				<div
					role="menu"
					className="animate-pop-in absolute right-0 top-[calc(100%+8px)] z-40 w-[290px] p-3 flex flex-col gap-3 bg-card border border-line rounded-[22px] shadow-popover"
				>
					<div className="flex flex-col gap-1.5">
						<span className="px-1 text-[12px] font-bold text-fg3">Tema</span>
						<div className="flex gap-0.5 p-1 rounded-full bg-bg2">
							<button type="button" className={option(theme === 'light')} onClick={() => setTheme('light')}>
								<Sun size={14} /> Chiaro
							</button>
							<button type="button" className={option(theme === 'dark')} onClick={() => setTheme('dark')}>
								<Moon size={14} /> Scuro
							</button>
							<button type="button" className={option(theme === 'system' || !theme)} onClick={() => setTheme('system')}>
								<Monitor size={14} /> Auto
							</button>
						</div>
					</div>

					<div className="flex flex-col gap-1.5">
						<span className="px-1 text-[12px] font-bold text-fg3">Lingua di titoli e trame</span>
						<div className="flex gap-0.5 p-1 rounded-full bg-bg2">
							<button type="button" className={option(language === 'it-IT')} onClick={() => language !== 'it-IT' && setLanguage('it-IT')}>
								{language === 'it-IT' && <Check size={14} />} Italiano
							</button>
							<button type="button" className={option(language === 'en-US')} onClick={() => language !== 'en-US' && setLanguage('en-US')}>
								{language === 'en-US' && <Check size={14} />} English
							</button>
						</div>
					</div>

					<div className="flex flex-col border-t border-line pt-2">
						<Link href="/profile/rss-feeds" className={row} role="menuitem" onClick={() => setOpen(false)}>
							<Rss size={17} className="text-fg3" />
							Gestisci feed RSS
						</Link>
						<Link href="/history" className={row} role="menuitem" onClick={() => setOpen(false)}>
							<History size={17} className="text-fg3" />
							Cronologia
						</Link>
						{isLoggedIn ? (
							<button
								type="button"
								role="menuitem"
								className={cn(row, 'text-left text-red-500')}
								onClick={() => {
									setOpen(false);
									logout();
								}}
							>
								<LogOut size={17} />
								Esci
							</button>
						) : (
							<button type="button" role="menuitem" className={cn(row, 'text-left')} onClick={() => login()}>
								<LogIn size={17} className="text-acc" />
								Accedi con TMDB
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
