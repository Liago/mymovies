'use client';

import { LayoutGrid, CheckCheck, Hourglass } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { SeriesFilterMode } from '@/lib/tv-status';

interface SeriesStatusFilterProps {
	mode: SeriesFilterMode;
	onChange: (mode: SeriesFilterMode) => void;
	counts?: { ended: number; returning: number };
}

/**
 * Segmented control that switches between:
 *  - all: every series
 *  - ended: terminated series the user still has episodes left to watch
 *  - returning: completed series waiting for a new season
 */
export default function SeriesStatusFilter({ mode, onChange, counts }: SeriesStatusFilterProps) {
	const { t } = useLanguage();

	const buttons: { value: SeriesFilterMode; label: string; icon: typeof LayoutGrid; count?: number }[] = [
		{ value: 'all', label: t('following.filter_all'), icon: LayoutGrid },
		{ value: 'ended', label: t('following.filter_ended'), icon: CheckCheck, count: counts?.ended },
		{ value: 'returning', label: t('following.filter_returning'), icon: Hourglass, count: counts?.returning },
	];

	return (
		<div className="flex flex-col gap-2">
			<div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 self-start">
				{buttons.map(({ value, label, icon: Icon, count }) => {
					const active = mode === value;
					return (
						<button
							key={value}
							type="button"
							onClick={() => onChange(value)}
							className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
								active ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'
							}`}
						>
							<Icon size={15} />
							{label}
							{typeof count === 'number' && (
								<span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-white/10'}`}>
									{count}
								</span>
							)}
						</button>
					);
				})}
			</div>
			{mode === 'ended' && <p className="text-xs text-gray-500">{t('following.filter_ended_hint')}</p>}
			{mode === 'returning' && <p className="text-xs text-gray-500">{t('following.filter_returning_hint')}</p>}
		</div>
	);
}
