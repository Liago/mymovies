'use client';

import { Play, ShoppingBag, Timer } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { AvailabilityProvider, MediaAvailability } from '@/lib/availability';

interface AvailabilityBadgesProps {
	availability: MediaAvailability | null | undefined;
	className?: string;
}

interface BadgeConfig {
	key: 'stream' | 'rent' | 'buy';
	providers: AvailabilityProvider[];
	label: string;
	titlePrefix: string;
	icon: LucideIcon;
	tone: string;
	showLogos: boolean;
}

function ProviderLogos({ providers }: { providers: AvailabilityProvider[] }) {
	return (
		<span className="flex -space-x-1">
			{providers.slice(0, 2).map((p) => (
				<img
					key={p.id}
					src={`https://image.tmdb.org/t/p/w92${p.logoPath}`}
					alt=""
					className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-[3px] object-cover ring-1 ring-black/60"
					loading="lazy"
				/>
			))}
		</span>
	);
}

/**
 * Stack of small pills telling at a glance whether a title can be streamed,
 * rented or bought in the user's region (data from TMDB / JustWatch).
 */
export default function AvailabilityBadges({ availability, className = '' }: AvailabilityBadgesProps) {
	const { t } = useLanguage();

	if (!availability) return null;

	const badges: BadgeConfig[] = [
		{
			key: 'stream',
			providers: availability.stream,
			label: t('availability.stream'),
			titlePrefix: t('availability.stream_on'),
			icon: Play,
			tone: 'bg-emerald-500/90 text-white',
			showLogos: true,
		},
		{
			key: 'rent',
			providers: availability.rent,
			label: t('availability.rent'),
			titlePrefix: t('availability.rent_on'),
			icon: Timer,
			tone: 'bg-amber-400/90 text-black',
			showLogos: false,
		},
		{
			key: 'buy',
			providers: availability.buy,
			label: t('availability.buy'),
			titlePrefix: t('availability.buy_on'),
			icon: ShoppingBag,
			tone: 'bg-sky-500/90 text-white',
			showLogos: false,
		},
	];

	const visible = badges.filter((b) => b.providers.length > 0);
	if (!visible.length) return null;

	return (
		<div className={`flex flex-col items-end gap-1 pointer-events-none ${className}`}>
			{visible.map(({ key, providers, label, titlePrefix, icon: Icon, tone, showLogos }) => (
				<span
					key={key}
					title={`${titlePrefix} ${providers.map((p) => p.name).join(', ')}`}
					className={`inline-flex items-center gap-1 pl-1 pr-1.5 py-0.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wide shadow-md backdrop-blur-sm ${tone}`}
				>
					{showLogos ? <ProviderLogos providers={providers} /> : <Icon size={10} strokeWidth={2.5} className="ml-0.5" />}
					<span className="leading-none">{label}</span>
				</span>
			))}
		</div>
	);
}
