import { notFound } from 'next/navigation';
import { List } from 'lucide-react';
import { actionGetListDetails } from '@/app/actions';
import ListItemsGrid from '@/components/ListItemsGrid';
import DeleteListButton from '@/components/DeleteListButton';
import BackButton from '@/components/BackButton';
import PageShell from '@/components/ui/PageShell';
import PageHeader from '@/components/ui/PageHeader';

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

	const count = listDetails.item_count;

	return (
		<PageShell width="wide">
			<PageHeader
				eyebrow="Lista"
				leading={<BackButton variant="plain" fallbackHref="/profile?tab=liste" />}
				title={listDetails.name}
				subtitle={[listDetails.description, `${count} ${count === 1 ? 'titolo' : 'titoli'}`].filter(Boolean).join(' · ')}
				actions={<DeleteListButton listId={listId} />}
			/>

			{listDetails.items && listDetails.items.length > 0 ? (
				<ListItemsGrid listId={listId} items={listDetails.items} />
			) : (
				<div className="flex flex-col items-center text-center gap-3 py-14">
					<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
						<List size={28} />
					</span>
					<h2 className="m-0 text-[20px] font-bold">Questa lista è vuota</h2>
					<p className="m-0 max-w-sm text-[14px] font-medium text-fg3">
						Apri un film e usa il pulsante «Lista» per aggiungerlo qui.
					</p>
				</div>
			)}
		</PageShell>
	);
}
