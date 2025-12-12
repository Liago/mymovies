import { actionGetFavorites } from '@/app/actions';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';
import { Heart, Film, Tv } from 'lucide-react';
import { cookies } from 'next/headers';

// Get translation from cookies helper since we are in server component
async function getT(key: string) {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';
	const translations: any = {
		'en-US': {
			'favorites.title': 'My Favorites',
			'favorites.movies': 'Movies',
			'favorites.tv': 'TV Series',
			'favorites.empty': 'No favorites found.',
			'favorites.empty_desc': 'Start adding movies and TV shows to your favorites!',
		},
		'it-IT': {
			'favorites.title': 'I Miei Preferiti',
			'favorites.movies': 'Film',
			'favorites.tv': 'Serie TV',
			'favorites.empty': 'Nessun preferito trovato.',
			'favorites.empty_desc': 'Inizia ad aggiungere film e serie TV ai tuoi preferiti!',
		}
	};
	return translations[lang]?.[key] || key;
}

export default async function FavoritesPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
	const { tab } = await searchParams;
	const activeTab = tab === 'tv' ? 'tv' : 'movies';
	const t = await getT;

	const { results } = await actionGetFavorites(activeTab as 'movies' | 'tv');

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<Heart className="text-pink-600 fill-current" />
						{await getT('favorites.title')}
					</h1>

					<div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
						<Link
							href="/profile/favorites?tab=movies"
							className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'movies'
								? 'bg-primary text-white shadow-lg'
								: 'text-gray-400 hover:text-white hover:bg-white/5'
								}`}
						>
							<Film size={16} />
							{await getT('favorites.movies')}
						</Link>
						<Link
							href="/profile/favorites?tab=tv"
							className={`px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'tv'
								? 'bg-primary text-white shadow-lg'
								: 'text-gray-400 hover:text-white hover:bg-white/5'
								}`}
						>
							<Tv size={16} />
							{await getT('favorites.tv')}
						</Link>
					</div>
				</div>

				{results.length > 0 ? (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{results.map((item: any) => (
							<MovieCard key={item.id} {...item} />
						))}
					</div>
				) : (
					<div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
						<Heart size={48} className="mx-auto text-gray-600 mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">{await getT('favorites.empty')}</h3>
						<p className="text-gray-400">{await getT('favorites.empty_desc')}</p>
					</div>
				)}
			</div>
		</main>
	);
}
