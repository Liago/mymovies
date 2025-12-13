import { notFound } from 'next/navigation';
import { List, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { actionGetListDetails } from '@/app/actions';
import MovieCard from '@/components/MovieCard';
import DeleteListButton from '@/components/DeleteListButton';

async function getT(key: string) {
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'en-US';
	const translations: any = {
		'en-US': {
			'list.back': 'Back to Lists',
			'list.delete': 'Delete List',
			'list.empty': 'This list is empty.',
			'list.empty_desc': 'Start adding movies and TV shows to your list!',
			'list.items': 'items',
		},
		'it-IT': {
			'list.back': 'Torna alle Liste',
			'list.delete': 'Elimina Lista',
			'list.empty': 'Questa lista è vuota.',
			'list.empty_desc': 'Inizia ad aggiungere film e serie TV alla tua lista!',
			'list.items': 'elementi',
		}
	};
	return translations[lang]?.[key] || key;
}

export default async function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const listId = parseInt(id);

	if (isNaN(listId)) {
		notFound();
	}

	const listDetails = await actionGetListDetails(listId);

	if (!listDetails) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
			<div className="max-w-7xl mx-auto">
				{/* Back Button */}
				<Link
					href="/profile/lists"
					className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
				>
					<ArrowLeft size={20} />
					{await getT('list.back')}
				</Link>

				{/* Header */}
				<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
					<div>
						<h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
							<List className="text-purple-500" />
							{listDetails.name}
						</h1>
						{listDetails.description && (
							<p className="text-gray-400">{listDetails.description}</p>
						)}
						<p className="text-sm text-gray-500 mt-2">
							{listDetails.item_count} {await getT('list.items')}
						</p>
					</div>

					<DeleteListButton listId={listId} />
				</div>

				{/* Items Grid */}
				{listDetails.items && listDetails.items.length > 0 ? (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{listDetails.items.map((item: any) => (
							<MovieCard key={item.id} {...item} />
						))}
					</div>
				) : (
					<div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
						<List size={48} className="mx-auto text-gray-600 mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">{await getT('list.empty')}</h3>
						<p className="text-gray-400">{await getT('list.empty_desc')}</p>
					</div>
				)}
			</div>
		</main>
	);
}
