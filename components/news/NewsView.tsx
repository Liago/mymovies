'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { useRSS } from '@/context/RSSContext';
import type { RSSArticle } from '@/app/api/rss/parse/route';
import Artwork from '../ui/Artwork';
import BackButton from '../BackButton';
import PageHeader from '../ui/PageHeader';
import Segmented from '../ui/Segmented';
import { timeAgo } from '@/lib/format';

type Article = RSSArticle & { feedName: string };

const PER_FEED = 8;

/** Testo semplice da descrizioni RSS che possono contenere HTML. */
function plain(html?: string): string {
	return (html || '')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&#8217;|&rsquo;/g, '’')
		.replace(/&quot;/g, '"')
		.replace(/\s+/g, ' ')
		.trim();
}

/** Notizie: articoli dai feed RSS dell'utente, filtrabili per fonte. */
export default function NewsView({ initialSource }: { initialSource?: string | null }) {
	const { feeds, isLoading: feedsLoading } = useRSS();
	const [articles, setArticles] = useState<Article[] | null>(null);
	const [source, setSource] = useState<string>(initialSource || 'all');

	const feedsKey = feeds.map((f) => f.url).join('|');

	useEffect(() => {
		if (feedsLoading) return;
		if (!feeds.length) {
			setArticles([]);
			return;
		}
		let cancelled = false;
		setArticles(null);
		Promise.all(
			feeds.map(async (feed) => {
				try {
					const response = await fetch(`/api/rss/parse?url=${encodeURIComponent(feed.url)}`);
					const data = await response.json();
					if (!data.success || !data.articles) return [];
					return (data.articles as RSSArticle[]).slice(0, PER_FEED).map((a) => ({ ...a, feedName: feed.name }));
				} catch (err) {
					console.error(`Error fetching feed ${feed.name}:`, err);
					return [];
				}
			})
		).then((lists) => {
			if (cancelled) return;
			const all = lists.flat().sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
			setArticles(all);
		});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [feedsKey, feedsLoading]);

	const pick = (next: string) => {
		setSource(next);
		const url = new URL(window.location.href);
		if (next === 'all') url.searchParams.delete('source');
		else url.searchParams.set('source', next);
		window.history.replaceState(window.history.state, '', url.toString());
	};

	const visible = useMemo(
		() => (articles || []).filter((a) => source === 'all' || a.feedName === source).slice(0, 30),
		[articles, source]
	);
	const [top, ...rest] = visible;
	const loading = feedsLoading || articles === null;

	return (
		<>
			<PageHeader
				eyebrow="Notizie"
				leading={
					<span className="md:hidden">
						<BackButton variant="plain" fallbackHref="/" />
					</span>
				}
				title={
					<>
						<span className="md:hidden text-[26px]">Notizie</span>
						<span className="hidden md:inline">Dal mondo del cinema</span>
					</>
				}
				actions={
					<Link
						href="/profile/rss-feeds"
						className="hidden md:flex h-[38px] px-3.5 rounded-full bg-bg2 text-[13px] font-bold items-center gap-1.5 hover:opacity-80"
					>
						<Rss size={15} />
						Gestisci feed
					</Link>
				}
			/>

			{feeds.length > 1 && (
				<Segmented
					variant="chips"
					ariaLabel="Fonti"
					className="-mx-4 px-4 md:mx-0 md:px-0 [&>*]:h-9 [&>*]:md:h-9 [&>*]:px-3.5 [&>*]:text-[13px]"
					items={[{ key: 'all', label: 'Tutte' }, ...feeds.map((f) => ({ key: f.name, label: f.name }))].map((f) => ({
						key: f.key,
						label: f.label,
						active: source === f.key,
						onClick: () => pick(f.key),
					}))}
				/>
			)}

			{!feedsLoading && feeds.length === 0 ? (
				<div className="flex flex-col items-center text-center gap-3 py-14">
					<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
						<Rss size={28} />
					</span>
					<h2 className="m-0 text-[20px] font-bold">Nessun feed configurato</h2>
					<p className="m-0 max-w-sm text-[14px] font-medium text-fg3">
						Aggiungi i feed RSS delle tue testate di cinema preferite per leggere qui le ultime notizie.
					</p>
					<Link href="/profile/rss-feeds" className="mt-2 h-11 px-5 rounded-full bg-fg text-bg text-[14px] font-bold flex items-center gap-2">
						<Rss size={16} />
						Gestisci feed
					</Link>
				</div>
			) : loading ? (
				<div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-6 items-start">
					<div className="aspect-[16/10] rounded-[18px] md:rounded-[22px] placeholder-stripes" />
					<div className="flex flex-col gap-2.5">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="h-[104px] rounded-[18px] placeholder-stripes" />
						))}
					</div>
				</div>
			) : !top ? (
				<p className="m-0 py-10 text-center text-[14px] font-semibold text-fg3">Nessun articolo trovato nei tuoi feed.</p>
			) : (
				<div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4 md:gap-6 items-start">
					<a href={top.link} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2 md:gap-3.5 hover:opacity-90 transition-opacity">
						<Artwork src={top.thumbnail} alt="" className="aspect-[16/10] rounded-[18px] md:rounded-[22px]" />
						<span className="text-[11px] md:text-[12px] font-bold text-acc">
							{top.feedName} · {timeAgo(top.pubDate)}
						</span>
						<span className="text-[21px] md:text-[30px] font-extrabold leading-[1.2] md:leading-[1.15] tracking-[-0.02em] text-balance">
							{top.title}
						</span>
						{plain(top.description) && (
							<span className="hidden md:block text-[16px] leading-[1.5] font-medium text-fg2 line-clamp-3">{plain(top.description)}</span>
						)}
					</a>
					<div className="flex flex-col md:gap-2.5">
						{rest.map((n, i) => (
							<a
								key={`${n.link}-${i}`}
								href={n.link}
								target="_blank"
								rel="noopener noreferrer"
								className="grid grid-cols-[minmax(0,1fr)_84px] md:grid-cols-[110px_minmax(0,1fr)] gap-3 md:gap-3.5 items-center py-2.5 md:p-2.5 border-t border-line md:border md:rounded-[18px] md:bg-card transition-opacity hover:opacity-80"
							>
								<Artwork
									src={n.thumbnail}
									alt=""
									className="order-2 md:order-1 aspect-square md:aspect-[4/3] rounded-[12px]"
								/>
								<span className="order-1 md:order-2 flex flex-col gap-[3px] md:gap-1 min-w-0">
									<span className="text-[11px] font-bold text-acc">
										{n.feedName} · {timeAgo(n.pubDate)}
									</span>
									<span className="text-[14px] md:text-[15px] font-bold leading-[1.3] line-clamp-3">{n.title}</span>
								</span>
							</a>
						))}
					</div>
				</div>
			)}
		</>
	);
}
