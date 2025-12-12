import { actionGetWatchlist } from '@/app/actions';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';
import { Bookmark, Film, Tv } from 'lucide-react';
import { cookies } from 'next/headers';

async function getT(key: string) {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';
	const translations: any = {
		'en-US': {
			'watchlist.title': 'My Watchlist',
			'watchlist.movies': 'Movies',
			'watchlist.tv': 'TV Series',
			'watchlist.empty': 'Your watchlist is empty.',
			'watchlist.empty_desc': 'Discover movies and TV shows and save them for later!',
		},
		'it-IT': {
			'watchlist.title': 'La Mia Watchlist',
			'watchlist.movies': 'Film',
			'watchlist.tv': 'Serie TV',
			'watchlist.empty': 'La tua watchlist è vuota.',
			'watchlist.empty_desc': 'Scopri film e serie TV e salvali per dopo!',
		}
	};
	return translations[lang]?.[key] || key;
}

export default async function WatchlistPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
	const { tab } = await searchParams;
	const activeTab = tab === 'tv' ? 'tv' : 'movies';

	const { results } = await actionGetWatchlist(activeTab as 'movies' | 'tv');

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<Bookmark className="text-emerald-500 fill-current" />
						{await getT('watchlist.title')}
					</h1>

					<div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
						<Link
							href="/profile/watchlist?tab=movies"
							className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'movies'
									? 'bg-primary text-white shadow-lg'
									: 'text-gray-400 hover:text-white hover:bg-white/5'
								}`}
						>
							<Film size={16} />
							{await getT('watchlist.movies')}
						</Link>
						<Link
							href="/profile/watchlist?tab=tv"
							className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'tv'
									? 'bg-primary text-white shadow-lg'
									: 'text-gray-400 hover:text-white hover:bg-white/5'
								}`}
						>
							<Tv size={16} />
							{await getT('watchlist.tv')}
						</Link>
					</div>
				</div>

				{results.length > 0 ? (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{results.map((item: any) => (
							<MovieCard key={item.id} movie={item} />
						))}
					</div>
				) : (
					<div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
						<Bookmark size={48} className="mx-auto text-gray-600 mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">{await getT('watchlist.empty')}</h3>
						<p className="text-gray-400">{await getT('watchlist.empty_desc')}</p>
					</div>
				)}
			</div>
		</main>
	);
}
