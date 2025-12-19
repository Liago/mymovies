'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Plus, Trash2, Rss, ExternalLink, CheckCircle } from 'lucide-react';
import { POPULAR_CINEMA_FEEDS } from '@/lib/rss-feeds';
import { useRSS } from '@/context/RSSContext';

export default function RSSFeedsPage() {
	const { feeds, addFeed, removeFeed, isSubscribed } = useRSS();
	const [showAddForm, setShowAddForm] = useState(false);
	const [showPopularFeeds, setShowPopularFeeds] = useState(false);
	const [newFeed, setNewFeed] = useState({ name: '', url: '', description: '', category: '' });
	const [error, setError] = useState('');

	const handleAddFeed = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			if (!newFeed.name || !newFeed.url) {
				setError('Name and URL are required');
				return;
			}

			// Basic URL validation
			try {
				new URL(newFeed.url);
			} catch {
				setError('Invalid URL format');
				return;
			}

			await addFeed({
				name: newFeed.name,
				url: newFeed.url,
				description: newFeed.description || undefined,
				category: newFeed.category || undefined
			});

			setNewFeed({ name: '', url: '', description: '', category: '' });
			setShowAddForm(false);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add feed');
		}
	};

	const handleRemoveFeed = async (id: string) => {
		if (confirm('Are you sure you want to remove this feed?')) {
			await removeFeed(id);
		}
	};

	const handleAddPopularFeed = async (feed: typeof POPULAR_CINEMA_FEEDS[0]) => {
		try {
			await addFeed({
				name: feed.name,
				url: feed.url,
				description: feed.description,
				category: feed.category
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to add feed');
		}
	};

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<Link
						href="/profile"
						className="inline-flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors group"
					>
						<ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
						<span>Back to Profile</span>
					</Link>

					<div className="flex items-center gap-4 mb-4">
						<div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
							<Rss size={32} className="text-white" />
						</div>
						<div>
							<h1 className="text-4xl font-bold">RSS Feeds</h1>
							<p className="text-zinc-400 mt-1">Manage your cinema news sources</p>
						</div>
					</div>
				</div>

				{/* Add Feed Button */}
				<div className="flex gap-4 mb-8">
					<button
						onClick={() => setShowAddForm(!showAddForm)}
						className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 rounded-xl font-semibold transition-colors"
					>
						<Plus size={20} />
						Add Custom Feed
					</button>
					<button
						onClick={() => setShowPopularFeeds(!showPopularFeeds)}
						className="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl font-semibold transition-colors"
					>
						<Rss size={20} />
						Popular Feeds
					</button>
				</div>

				{/* Error Message */}
				{error && (
					<div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
						{error}
					</div>
				)}

				{/* Add Feed Form */}
				{showAddForm && (
					<div className="mb-8 p-6 bg-zinc-900 border border-white/10 rounded-2xl">
						<h2 className="text-xl font-bold mb-4">Add Custom RSS Feed</h2>
						<form onSubmit={handleAddFeed} className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-zinc-400 mb-2">
									Feed Name *
								</label>
								<input
									type="text"
									value={newFeed.name}
									onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
									className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-primary focus:outline-none"
									placeholder="e.g., My Favorite Movie Blog"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-400 mb-2">
									RSS Feed URL *
								</label>
								<input
									type="url"
									value={newFeed.url}
									onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
									className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-primary focus:outline-none"
									placeholder="https://example.com/feed/"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-400 mb-2">
									Description (optional)
								</label>
								<input
									type="text"
									value={newFeed.description}
									onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
									className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-primary focus:outline-none"
									placeholder="Brief description"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-zinc-400 mb-2">
									Category (optional)
								</label>
								<input
									type="text"
									value={newFeed.category}
									onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
									className="w-full px-4 py-2 bg-black border border-white/20 rounded-lg text-white focus:border-primary focus:outline-none"
									placeholder="e.g., News, Reviews, Interviews"
								/>
							</div>
							<div className="flex gap-4">
								<button
									type="submit"
									className="px-6 py-2 bg-primary hover:bg-primary/80 rounded-lg font-semibold transition-colors"
								>
									Add Feed
								</button>
								<button
									type="button"
									onClick={() => {
										setShowAddForm(false);
										setError('');
									}}
									className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg font-semibold transition-colors"
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				)}

				{/* Popular Feeds */}
				{showPopularFeeds && (
					<div className="mb-8 p-6 bg-zinc-900 border border-white/10 rounded-2xl">
						<h2 className="text-xl font-bold mb-4">Popular Cinema News Feeds</h2>
						<div className="space-y-3">
							{POPULAR_CINEMA_FEEDS.map((feed, index) => {
								const subscribed = isSubscribed(feed.url);
								return (
									<div
										key={index}
										className="flex items-center justify-between p-4 bg-black/50 rounded-xl border border-white/5 hover:border-white/20 transition-colors"
									>
										<div className="flex-1">
											<h3 className="font-semibold text-white">{feed.name}</h3>
											<p className="text-sm text-zinc-400">{feed.description}</p>
											{feed.category && (
												<span className="inline-block mt-2 px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
													{feed.category}
												</span>
											)}
										</div>
										<button
											onClick={() => handleAddPopularFeed(feed)}
											disabled={subscribed}
											className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-colors ${subscribed
													? 'bg-green-600/20 text-green-400 cursor-not-allowed'
													: 'bg-primary hover:bg-primary/80 text-white'
												}`}
										>
											{subscribed ? (
												<span className="flex items-center gap-2">
													<CheckCircle size={16} />
													Subscribed
												</span>
											) : (
												<span className="flex items-center gap-2">
													<Plus size={16} />
													Add
												</span>
											)}
										</button>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Feeds List */}
				<div className="space-y-4">
					<h2 className="text-2xl font-bold mb-4">
						Your Feeds ({feeds.length})
					</h2>

					{feeds.length === 0 ? (
						<div className="text-center py-12">
							<Rss size={64} className="mx-auto text-zinc-700 mb-4" />
							<p className="text-zinc-500 text-lg">No RSS feeds yet</p>
							<p className="text-zinc-600 text-sm mt-2">
								Add custom feeds or choose from popular sources
							</p>
						</div>
					) : (
						feeds.map((feed) => (
							<div
								key={feed.id}
								className="p-6 bg-zinc-900 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group"
							>
								<div className="flex items-start justify-between">
									<div className="flex-1">
										<div className="flex items-center gap-3 mb-2">
											<Rss size={20} className="text-primary" />
											<h3 className="text-xl font-bold text-white">{feed.name}</h3>
										</div>
										{feed.description && (
											<p className="text-zinc-400 mb-2">{feed.description}</p>
										)}
										<div className="flex items-center gap-4 text-sm text-zinc-500">
											<a
												href={feed.url}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-1 hover:text-primary transition-colors"
											>
												<ExternalLink size={14} />
												View Feed
											</a>
											{feed.category && (
												<span className="px-2 py-1 bg-primary/20 text-primary rounded-full">
													{feed.category}
												</span>
											)}
											<span className="text-xs">
												Added {feed.added_at ? new Date(feed.added_at).toLocaleDateString() : 'N/A'}
											</span>
										</div>
									</div>
									<button
										onClick={() => handleRemoveFeed(feed.id)}
										className="ml-4 p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
										title="Remove feed"
									>
										<Trash2 size={20} />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</main>
	);
}
