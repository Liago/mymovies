'use client';

import { LayoutGrid, CheckCheck, Hourglass, RefreshCw, PlayCircle, CalendarClock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { SeriesFilterMode } from '@/lib/tv-status';

interface SeriesStatusFilterProps {
	mode: SeriesFilterMode;
	onChange: (mode: SeriesFilterMode) => void;
	counts?: { watching: number; ended: number; returning: number; ongoing: number; upcoming: number };
}

/**
 * Segmented control that switches between:
 *  - watching: already-airing series with episodes still left to watch
 *    (default view; series that have not premiered yet are excluded)
 *  - all: every series
 *  - ended: terminated series the user still has episodes left to watch
 *  - returning: completed series waiting for a new season
 *  - ongoing: renewed series the user is still catching up on
 *  - upcoming: series that have not premiered yet
 */
export default function SeriesStatusFilter({ mode, onChange, counts }: SeriesStatusFilterProps) {
	const { t } = useLanguage();

	const buttons: { value: SeriesFilterMode; label: string; icon: typeof LayoutGrid; count?: number }[] = [
		{ value: 'watching', label: t('following.filter_watching'), icon: PlayCircle, count: counts?.watching },
		{ value: 'all', label: t('following.filter_all'), icon: LayoutGrid },
		{ value: 'ended', label: t('following.filter_ended'), icon: CheckCheck, count: counts?.ended },
		{ value: 'returning', label: t('following.filter_returning'), icon: Hourglass, count: counts?.returning },
		{ value: 'ongoing', label: t('following.filter_ongoing'), icon: RefreshCw, count: counts?.ongoing },
		{ value: 'upcoming', label: t('following.filter_upcoming'), icon: CalendarClock, count: counts?.upcoming },
	];

	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
				{buttons.map(({ value, label, icon: Icon, count }) => {
					const active = mode === value;
					return (
						<button
							key={value}
							type="button"
							onClick={() => onChange(value)}
							className={`shrink-0 h-[38px] flex items-center gap-2 px-4 rounded-full text-[13px] md:text-[14px] font-bold whitespace-nowrap transition-colors ${
								active ? 'bg-fg text-bg' : 'bg-bg2 text-fg2 hover:text-fg'
							}`}
						>
							<Icon size={15} />
							{label}
							{typeof count === 'number' && (
								<span className={`text-[11px] px-1.5 py-0.5 rounded-full ${active ? 'bg-bg/20' : 'bg-card'}`}>
									{count}
								</span>
							)}
						</button>
					);
				})}
			</div>
			{mode === 'watching' && <p className="text-[12px] font-medium text-fg3">{t('following.filter_watching_hint')}</p>}
			{mode === 'ended' && <p className="text-[12px] font-medium text-fg3">{t('following.filter_ended_hint')}</p>}
			{mode === 'returning' && <p className="text-[12px] font-medium text-fg3">{t('following.filter_returning_hint')}</p>}
			{mode === 'ongoing' && <p className="text-[12px] font-medium text-fg3">{t('following.filter_ongoing_hint')}</p>}
			{mode === 'upcoming' && <p className="text-[12px] font-medium text-fg3">{t('following.filter_upcoming_hint')}</p>}
		</div>
	);
}
