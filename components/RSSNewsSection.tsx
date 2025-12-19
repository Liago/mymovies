'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rss, ExternalLink, Calendar, Loader2, Settings } from 'lucide-react';
import { useRSS } from '@/context/RSSContext';
import type { RSSArticle } from '@/app/api/rss/parse/route';

export default function RSSNewsSection() {
	const { feeds } = useRSS();
	const [articles, setArticles] = useState<(RSSArticle & { feedName: string })[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		if (feeds.length > 0) {
			loadRSSArticles();
		} else {
			setLoading(false);
		}
	}, [feeds]);

	const loadRSSArticles = async () => {
		setLoading(true);
		setError('');

		try {
			// Fetch articles from all feeds
			const allArticles: (RSSArticle & { feedName: string })[] = [];

			for (const feed of feeds) {
				try {
					const response = await fetch(`/api/rss/parse?url=${encodeURIComponent(feed.url)}`);
					const data = await response.json();

					if (data.success && data.articles) {
						const articlesWithFeed = data.articles.map((article: RSSArticle) => ({
							...article,
							feedName: feed.name
						}));
						allArticles.push(...articlesWithFeed.slice(0, 5)); // Take first 5 from each feed
					}
				} catch (err) {
					console.error(`Error fetching feed ${feed.name}:`, err);
				}
			}

			// Sort by date (newest first)
			allArticles.sort((a, b) => {
				return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
			});

			setArticles(allArticles.slice(0, 20)); // Show top 20 most recent
		} catch (err) {
			setError('Failed to load RSS feeds');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	if (feeds.length === 0 && !loading) {
		return (
			<section className="mb-16">
				<div className="flex items-center gap-3 mb-8">
					<Rss className="text-orange-500" size={28} />
					<h2 className="text-3xl font-bold text-white">Your RSS Feeds</h2>
					<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
				</div>
				<div className="text-center py-12 bg-zinc-900 border border-white/10 rounded-2xl">
					<Rss size={64} className="mx-auto text-zinc-700 mb-4" />
					<p className="text-zinc-400 text-lg mb-4">No RSS feeds configured</p>
					<p className="text-zinc-500 text-sm mb-6">
						Add cinema news feeds to see the latest articles here
					</p>
					<Link
						href="/profile/rss-feeds"
						className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 rounded-xl font-semibold transition-colors"
					>
						<Settings size={20} />
						Manage RSS Feeds
					</Link>
				</div>
			</section>
		);
	}

	return (
		<section className="mb-16">
			<div className="flex items-center gap-3 mb-8">
				<Rss className="text-orange-500" size={28} />
				<h2 className="text-3xl font-bold text-white">Latest from Your Feeds</h2>
				<div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
				<Link
					href="/profile/rss-feeds"
					className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
				>
					<Settings size={16} />
					Manage
				</Link>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-12">
					<Loader2 size={48} className="text-orange-500 animate-spin" />
					<span className="ml-4 text-zinc-400">Loading RSS articles...</span>
				</div>
			) : error ? (
				<div className="text-center py-12 bg-red-500/10 border border-red-500/30 rounded-2xl">
					<p className="text-red-400">{error}</p>
				</div>
			) : articles.length === 0 ? (
				<div className="text-center py-12 bg-zinc-900 border border-white/10 rounded-2xl">
					<p className="text-zinc-400">No articles found in your feeds</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{articles.map((article, index) => (
						<a
							key={`${article.link}-${index}`}
							href={article.link}
							target="_blank"
							rel="noopener noreferrer"
							className="group block bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20"
						>
							{/* Thumbnail if available */}
							{article.thumbnail && (
								<div className="aspect-video bg-zinc-800 overflow-hidden">
									<img
										src={article.thumbnail}
										alt={article.title}
										className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
									/>
								</div>
							)}

							{/* Content */}
							<div className="p-6 space-y-3">
								{/* Feed Source Badge */}
								<div className="flex items-center gap-2 text-xs">
									<Rss size={12} className="text-orange-500" />
									<span className="text-orange-400 font-semibold">{article.feedName}</span>
								</div>

								{/* Title */}
								<h3 className="font-bold text-white line-clamp-2 group-hover:text-orange-400 transition-colors text-lg">
									{article.title}
								</h3>

								{/* Description */}
								{article.description && (
									<p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed">
										{article.description}
									</p>
								)}

								{/* Meta Info */}
								<div className="flex items-center justify-between text-xs text-zinc-500 pt-3 border-t border-white/5">
									<div className="flex items-center gap-2">
										<Calendar size={12} />
										<span>{new Date(article.pubDate).toLocaleDateString()}</span>
									</div>
									{article.author && (
										<span className="text-zinc-600 truncate max-w-[120px]">
											by {article.author}
										</span>
									)}
									<ExternalLink size={12} className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
							</div>
						</a>
					))}
				</div>
			)}
		</section>
	);
}
