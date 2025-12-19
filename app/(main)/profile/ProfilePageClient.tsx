'use client';

import { Heart, Bookmark, List, Film, Tv, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useWatchlist } from '@/context/WatchlistContext';
import { useLists } from '@/context/ListsContext';
import RSSFeedsCard from '@/components/RSSFeedsCard';

export default function ProfilePageClient() {
	const { user } = useAuth();
	const { favorites, isLoading: favoritesLoading } = useFavorites();
	const { watchlist, isLoading: watchlistLoading } = useWatchlist();
	const { lists, isLoading: listsLoading } = useLists();

	const favoritesMovies = favorites.filter(f => f.media_type === 'movie');
	const favoritesTV = favorites.filter(f => f.media_type === 'tv');
	const watchlistMovies = watchlist.filter(w => w.media_type === 'movie');
	const watchlistTV = watchlist.filter(w => w.media_type === 'tv');

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-12">
					<div className="flex items-center gap-4 mb-3">
						<div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
							<User size={32} className="text-white" />
						</div>
						<div>
							<h1 className="text-3xl font-bold">My Profile</h1>
							{user && (
								<p className="text-gray-400 mt-1">@{user.username}</p>
							)}
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{/* Favorites Card */}
					<Link
						href="/profile/favorites"
						className="group relative bg-gradient-to-br from-pink-600/20 to-pink-900/20 rounded-2xl p-8 border border-pink-600/30 hover:border-pink-500/50 transition-all hover:scale-105"
					>
						<div className="absolute top-6 right-6 text-pink-600 group-hover:scale-110 transition-transform">
							<Heart size={40} className="fill-current" />
						</div>
						<div className="mb-4">
							<h2 className="text-2xl font-bold mb-2">Favorites</h2>
							<p className="text-gray-400 text-sm">Movies and TV shows you love</p>
						</div>
						{favoritesLoading ? (
							<div className="flex items-center justify-center py-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
							</div>
						) : (
							<div className="flex items-center gap-4 text-sm">
								<div className="flex items-center gap-2">
									<Film size={16} className="text-pink-400" />
									<span className="font-medium">{favoritesMovies.length}</span>
									<span className="text-gray-500">movies</span>
								</div>
								<div className="flex items-center gap-2">
									<Tv size={16} className="text-pink-400" />
									<span className="font-medium">{favoritesTV.length}</span>
									<span className="text-gray-500">TV shows</span>
								</div>
							</div>
						)}
					</Link>

					{/* Watchlist Card */}
					<Link
						href="/profile/watchlist"
						className="group relative bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 rounded-2xl p-8 border border-emerald-600/30 hover:border-emerald-500/50 transition-all hover:scale-105"
					>
						<div className="absolute top-6 right-6 text-emerald-500 group-hover:scale-110 transition-transform">
							<Bookmark size={40} className="fill-current" />
						</div>
						<div className="mb-4">
							<h2 className="text-2xl font-bold mb-2">Watchlist</h2>
							<p className="text-gray-400 text-sm">Content saved for later</p>
						</div>
						{watchlistLoading ? (
							<div className="flex items-center justify-center py-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
							</div>
						) : (
							<div className="flex items-center gap-4 text-sm">
								<div className="flex items-center gap-2">
									<Film size={16} className="text-emerald-400" />
									<span className="font-medium">{watchlistMovies.length}</span>
									<span className="text-gray-500">movies</span>
								</div>
								<div className="flex items-center gap-2">
									<Tv size={16} className="text-emerald-400" />
									<span className="font-medium">{watchlistTV.length}</span>
									<span className="text-gray-500">TV shows</span>
								</div>
							</div>
						)}
					</Link>

					{/* Lists Card */}
					<Link
						href="/profile/lists"
						className="group relative bg-gradient-to-br from-purple-600/20 to-purple-900/20 rounded-2xl p-8 border border-purple-600/30 hover:border-purple-500/50 transition-all hover:scale-105"
					>
						<div className="absolute top-6 right-6 text-purple-500 group-hover:scale-110 transition-transform">
							<List size={40} />
						</div>
						<div className="mb-4">
							<h2 className="text-2xl font-bold mb-2">My Lists</h2>
							<p className="text-gray-400 text-sm">Your custom collections</p>
						</div>
						{listsLoading ? (
							<div className="flex items-center justify-center py-4">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
							</div>
						) : (
							<div className="flex items-center gap-2 text-sm">
								<span className="text-3xl font-bold text-purple-400">{lists.length}</span>
								<span className="text-gray-500">items</span>
							</div>
						)}
					</Link>

					{/* RSS Feeds Card */}
					<RSSFeedsCard />
				</div>
			</div>
		</main>
	);
}
