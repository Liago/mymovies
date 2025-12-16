'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Rss } from 'lucide-react';
import { getRSSFeeds } from '@/lib/rss-feeds';

export default function RSSFeedsCard() {
	const [feedsCount, setFeedsCount] = useState(0);

	useEffect(() => {
		const feeds = getRSSFeeds();
		setFeedsCount(feeds.length);
	}, []);

	return (
		<Link
			href="/profile/rss-feeds"
			className="group relative bg-gradient-to-br from-orange-600/20 to-red-900/20 rounded-2xl p-8 border border-orange-600/30 hover:border-orange-500/50 transition-all hover:scale-105"
		>
			<div className="absolute top-6 right-6 text-orange-500 group-hover:scale-110 transition-transform">
				<Rss size={40} />
			</div>
			<div className="mb-4">
				<h2 className="text-2xl font-bold mb-2">RSS Feeds</h2>
				<p className="text-gray-400 text-sm">Your cinema news sources</p>
			</div>
			<div className="flex items-center gap-2 text-sm">
				<span className="text-3xl font-bold text-orange-400">{feedsCount}</span>
				<span className="text-gray-500">feeds</span>
			</div>
		</Link>
	);
}
