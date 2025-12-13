import Link from 'next/link';
import { Heart, Bookmark, List, Film, Tv, User } from 'lucide-react';
import { cookies } from 'next/headers';
import { actionGetFavorites, actionGetWatchlist, actionGetUserLists } from '@/app/actions';

async function getT(key: string) {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';
	const translations: any = {
		'en-US': {
			'profile.title': 'My Profile',
			'profile.favorites': 'Favorites',
			'profile.watchlist': 'Watchlist',
			'profile.lists': 'My Lists',
			'profile.favorites_desc': 'Movies and TV shows you love',
			'profile.watchlist_desc': 'Content saved for later',
			'profile.lists_desc': 'Your custom collections',
			'profile.movies_count': 'movies',
			'profile.tv_count': 'TV shows',
			'profile.items_count': 'items',
		},
		'it-IT': {
			'profile.title': 'Il Mio Profilo',
			'profile.favorites': 'Preferiti',
			'profile.watchlist': 'Watchlist',
			'profile.lists': 'Le Mie Liste',
			'profile.favorites_desc': 'Film e serie TV che ami',
			'profile.watchlist_desc': 'Contenuti salvati per dopo',
			'profile.lists_desc': 'Le tue collezioni personalizzate',
			'profile.movies_count': 'film',
			'profile.tv_count': 'serie TV',
			'profile.items_count': 'elementi',
		}
	};
	return translations[lang]?.[key] || key;
}

async function getUserInfo() {
	const cookieStore = await cookies();
	const userCookie = cookieStore.get('tmdb_user')?.value;
	if (!userCookie) return null;
	try {
		return JSON.parse(userCookie);
	} catch {
		return null;
	}
}

export default async function ProfilePage() {
	const user = await getUserInfo();

	// Get counts for each section
	const favoritesMovies = await actionGetFavorites('movies');
	const favoritesTV = await actionGetFavorites('tv');
	const watchlistMovies = await actionGetWatchlist('movies');
	const watchlistTV = await actionGetWatchlist('tv');
	const lists = await actionGetUserLists();

	const favoritesCount = favoritesMovies.results.length + favoritesTV.results.length;
	const watchlistCount = watchlistMovies.results.length + watchlistTV.results.length;
	const listsCount = lists.length;

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
							<h1 className="text-3xl font-bold">{await getT('profile.title')}</h1>
							{user && (
								<p className="text-gray-400 mt-1">@{user.username}</p>
							)}
						</div>
					</div>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{/* Favorites Card */}
					<Link
						href="/profile/favorites"
						className="group relative bg-gradient-to-br from-pink-600/20 to-pink-900/20 rounded-2xl p-8 border border-pink-600/30 hover:border-pink-500/50 transition-all hover:scale-105"
					>
						<div className="absolute top-6 right-6 text-pink-600 group-hover:scale-110 transition-transform">
							<Heart size={40} className="fill-current" />
						</div>
						<div className="mb-4">
							<h2 className="text-2xl font-bold mb-2">{await getT('profile.favorites')}</h2>
							<p className="text-gray-400 text-sm">{await getT('profile.favorites_desc')}</p>
						</div>
						<div className="flex items-center gap-4 text-sm">
							<div className="flex items-center gap-2">
								<Film size={16} className="text-pink-400" />
								<span className="font-medium">{favoritesMovies.results.length}</span>
								<span className="text-gray-500">{await getT('profile.movies_count')}</span>
							</div>
							<div className="flex items-center gap-2">
								<Tv size={16} className="text-pink-400" />
								<span className="font-medium">{favoritesTV.results.length}</span>
								<span className="text-gray-500">{await getT('profile.tv_count')}</span>
							</div>
						</div>
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
							<h2 className="text-2xl font-bold mb-2">{await getT('profile.watchlist')}</h2>
							<p className="text-gray-400 text-sm">{await getT('profile.watchlist_desc')}</p>
						</div>
						<div className="flex items-center gap-4 text-sm">
							<div className="flex items-center gap-2">
								<Film size={16} className="text-emerald-400" />
								<span className="font-medium">{watchlistMovies.results.length}</span>
								<span className="text-gray-500">{await getT('profile.movies_count')}</span>
							</div>
							<div className="flex items-center gap-2">
								<Tv size={16} className="text-emerald-400" />
								<span className="font-medium">{watchlistTV.results.length}</span>
								<span className="text-gray-500">{await getT('profile.tv_count')}</span>
							</div>
						</div>
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
							<h2 className="text-2xl font-bold mb-2">{await getT('profile.lists')}</h2>
							<p className="text-gray-400 text-sm">{await getT('profile.lists_desc')}</p>
						</div>
						<div className="flex items-center gap-2 text-sm">
							<span className="text-3xl font-bold text-purple-400">{listsCount}</span>
							<span className="text-gray-500">{await getT('profile.items_count')}</span>
						</div>
					</Link>
				</div>
			</div>
		</main>
	);
}
