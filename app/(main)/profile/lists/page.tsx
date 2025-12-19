import Link from 'next/link';
import { List, Plus, Film } from 'lucide-react';
import { cookies } from 'next/headers';
import { actionGetUserLists } from '@/app/actions';
import CreateListButton from '@/components/CreateListButton';

async function getT(key: string) {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';
	const translations: any = {
		'en-US': {
			'lists.title': 'My Lists',
			'lists.create': 'Create New List',
			'lists.empty': 'No lists found.',
			'lists.empty_desc': 'Create your first custom list to organize your favorite movies and TV shows!',
			'lists.items': 'items',
		},
		'it-IT': {
			'lists.title': 'Le Mie Liste',
			'lists.create': 'Crea Nuova Lista',
			'lists.empty': 'Nessuna lista trovata.',
			'lists.empty_desc': 'Crea la tua prima lista personalizzata per organizzare i tuoi film e serie TV preferiti!',
			'lists.items': 'elementi',
		}
	};
	return translations[lang]?.[key] || key;
}

export default async function ListsPage() {
	const lists = await actionGetUserLists();
	const itemsLabel = await getT('lists.items');

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<List className="text-purple-500" />
						{await getT('lists.title')}
					</h1>

					<CreateListButton />
				</div>

				{lists.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{lists.map((list: any) => (
							<Link
								key={list.id}
								href={`/profile/lists/${list.id}`}
								className="group bg-white/5 hover:bg-white/10 rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
							>
								<div className="flex items-start justify-between mb-4">
									<div className="flex items-center gap-3">
										<div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/30">
											<Film className="text-purple-400" size={24} />
										</div>
										<div>
											<h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
												{list.name}
											</h3>
											<p className="text-sm text-gray-500">
												{list.count} {itemsLabel}
											</p>
										</div>
									</div>
								</div>
								{list.description && (
									<p className="text-sm text-gray-400 line-clamp-2">
										{list.description}
									</p>
								)}
							</Link>
						))}
					</div>
				) : (
					<div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
						<List size={48} className="mx-auto text-gray-600 mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">{await getT('lists.empty')}</h3>
						<p className="text-gray-400 mb-6">{await getT('lists.empty_desc')}</p>
						<CreateListButton />
					</div>
				)}
			</div>
		</main>
	);
}
