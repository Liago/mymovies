'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Tv } from 'lucide-react';
import { useTracker } from '@/context/TrackerContext';
import { useLanguage } from '@/context/LanguageContext';
import { actionGetFollowedShowsInfo } from '@/app/actions';
import { isEndedToFinish } from '@/lib/tv-status';
import TVCardWithProgress from '@/components/TVCardWithProgress';
import EndedSeriesFilter from '@/components/EndedSeriesFilter';

interface ShowInfo {
	status: string | null;
	totalEpisodes: number | null;
}

export default function FollowingPage() {
	const { watchedShows, getWatchedCount, isLoading } = useTracker();
	const { t } = useLanguage();
	const [endedOnly, setEndedOnly] = useState(false);
	const [info, setInfo] = useState<Map<number, ShowInfo>>(new Map());
	const [infoLoading, setInfoLoading] = useState(true);

	// Stable list of followed shows, most recently updated first.
	const shows = useMemo(
		() => Array.from(watchedShows.values()).sort((a, b) => b.lastUpdated - a.lastUpdated),
		[watchedShows]
	);

	// Comma-joined ids so the effect only re-runs when the set of shows changes.
	const idsKey = useMemo(() => shows.map((s) => s.id).join(','), [shows]);

	useEffect(() => {
		if (isLoading) return;

		let cancelled = false;

		const load = async () => {
			const ids = idsKey ? idsKey.split(',').map(Number) : [];
			if (ids.length === 0) {
				if (!cancelled) {
					setInfo(new Map());
					setInfoLoading(false);
				}
				return;
			}

			setInfoLoading(true);
			try {
				const results = await actionGetFollowedShowsInfo(ids);
				if (!cancelled) {
					setInfo(new Map(results.map((r) => [r.id, { status: r.status, totalEpisodes: r.totalEpisodes }])));
				}
			} catch (err) {
				console.error('Error loading followed shows info:', err);
			} finally {
				if (!cancelled) setInfoLoading(false);
			}
		};

		load();

		return () => {
			cancelled = true;
		};
	}, [idsKey, isLoading]);

	const endedCount = useMemo(
		() =>
			shows.filter((s) => {
				const meta = info.get(s.id);
				return isEndedToFinish(meta?.status, getWatchedCount(s.id), meta?.totalEpisodes);
			}).length,
		[shows, info, getWatchedCount]
	);

	const visibleShows = endedOnly
		? shows.filter((s) => {
				const meta = info.get(s.id);
				return isEndedToFinish(meta?.status, getWatchedCount(s.id), meta?.totalEpisodes);
		  })
		: shows;

	const loading = isLoading || infoLoading;

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20 px-6 md:px-12">
			<div className="max-w-7xl mx-auto">
				<Link
					href="/tv"
					className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
				>
					<ArrowLeft size={20} />
					{t('nav.tv')}
				</Link>

				<header className="mb-8">
					<h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
						{t('following.title')}
						<span className="text-secondary">.</span>
					</h1>
					<p className="text-zinc-400">{t('following.desc')}</p>
				</header>

				{/* Filter */}
				<div className="mb-10">
					<EndedSeriesFilter endedOnly={endedOnly} onChange={setEndedOnly} endedCount={endedCount} />
				</div>

				{loading ? (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{Array.from({ length: 10 }).map((_, i) => (
							<div key={i} className="aspect-[2/3] rounded-md bg-zinc-900 animate-pulse" />
						))}
					</div>
				) : visibleShows.length === 0 ? (
					<EmptyState endedOnly={endedOnly} />
				) : (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{visibleShows.map((show) => (
							<TVCardWithProgress
								key={show.id}
								id={show.id}
								title={show.name}
								poster={show.poster}
								totalEpisodes={info.get(show.id)?.totalEpisodes ?? undefined}
							/>
						))}
					</div>
				)}
			</div>
		</main>
	);
}

function EmptyState({ endedOnly }: { endedOnly: boolean }) {
	const { t } = useLanguage();
	return (
		<div className="flex flex-col items-center justify-center text-center py-20">
			<div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mb-6">
				<Tv size={48} className="text-zinc-600" />
			</div>
			<h2 className="text-2xl font-bold text-white mb-2">
				{endedOnly ? t('following.no_ended') : t('following.empty')}
			</h2>
			<p className="text-zinc-400 max-w-md mb-8">
				{endedOnly ? t('following.no_ended_desc') : t('following.empty_desc')}
			</p>
			<Link
				href="/tv"
				className="px-6 py-3 bg-primary text-white font-medium rounded-full hover:bg-primary/90 transition-colors"
			>
				{t('following.browse')}
			</Link>
		</div>
	);
}
