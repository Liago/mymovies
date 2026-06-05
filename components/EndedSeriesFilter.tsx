'use client';

import { LayoutGrid, CheckCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface EndedSeriesFilterProps {
	endedOnly: boolean;
	onChange: (endedOnly: boolean) => void;
	/** Optional count shown next to the "ended" option. */
	endedCount?: number;
}

/**
 * Segmented control that toggles between showing all series and showing only
 * terminated ("ended") series the user hasn't finished yet.
 */
export default function EndedSeriesFilter({ endedOnly, onChange, endedCount }: EndedSeriesFilterProps) {
	const { t } = useLanguage();

	return (
		<div className="flex flex-col gap-2">
			<div className="inline-flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10 self-start">
				<button
					type="button"
					onClick={() => onChange(false)}
					className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
						!endedOnly ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'
					}`}
				>
					<LayoutGrid size={15} />
					{t('following.filter_all')}
				</button>
				<button
					type="button"
					onClick={() => onChange(true)}
					className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
						endedOnly ? 'bg-primary text-white shadow-lg shadow-primary/25' : 'text-gray-400 hover:text-white'
					}`}
				>
					<CheckCheck size={15} />
					{t('following.filter_ended')}
					{typeof endedCount === 'number' && (
						<span
							className={`text-xs px-1.5 py-0.5 rounded-full ${
								endedOnly ? 'bg-white/20' : 'bg-white/10'
							}`}
						>
							{endedCount}
						</span>
					)}
				</button>
			</div>
			{endedOnly && <p className="text-xs text-gray-500">{t('following.filter_hint')}</p>}
		</div>
	);
}
