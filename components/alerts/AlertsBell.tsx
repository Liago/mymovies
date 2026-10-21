'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import AlertsPanel from './AlertsPanel';
import { useWatchlistAlerts } from '@/context/WatchlistAlertsContext';
import { cn } from '@/lib/cn';

/** Campanella con il numero di avvisi non letti e il pannello a comparsa. */
export default function AlertsBell({ className, align = 'right' }: { className?: string; align?: 'right' | 'left' }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);
	const { unreadCount } = useWatchlistAlerts();

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

	const label = unreadCount ? `Avvisi watchlist (${unreadCount} non letti)` : 'Avvisi watchlist';

	return (
		<div className="relative" ref={ref}>
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				aria-expanded={open}
				aria-haspopup="dialog"
				aria-label={label}
				title={label}
				className={cn('relative', className)}
			>
				<Bell size={18} />
				{unreadCount > 0 && (
					<span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-acc text-accfg text-[10px] font-extrabold flex items-center justify-center">
						{unreadCount > 9 ? '9+' : unreadCount}
					</span>
				)}
			</button>

			{open && (
				<div
					role="dialog"
					aria-label="Avvisi watchlist"
					className={cn(
						'animate-pop-in absolute top-[calc(100%+10px)] z-50 w-[380px] max-md:fixed max-md:top-[max(76px,calc(env(safe-area-inset-top)+64px))] max-md:inset-x-3 max-md:w-auto p-3 bg-card border border-line rounded-[22px] shadow-popover text-fg',
						align === 'right' ? 'right-0' : 'left-0'
					)}
				>
					<AlertsPanel onNavigate={() => setOpen(false)} />
				</div>
			)}
		</div>
	);
}
