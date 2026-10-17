'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useLists } from '@/context/ListsContext';
import { useRouter } from 'next/navigation';

export default function DeleteListButton({ listId }: { listId: number }) {
	const [isConfirming, setIsConfirming] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();
	const { deleteList } = useLists();

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteList(listId);
			router.push('/profile?tab=liste');
			router.refresh();
		} catch (error) {
			console.error('Error deleting list:', error);
		} finally {
			setIsDeleting(false);
			setIsConfirming(false);
		}
	};

	if (!isConfirming) {
		return (
			<button
				type="button"
				onClick={() => setIsConfirming(true)}
				className="h-10 px-4 rounded-full bg-bg2 text-red-500 text-[13px] font-bold flex items-center gap-2 hover:opacity-80"
			>
				<Trash2 size={15} />
				Elimina lista
			</button>
		);
	}

	return (
		<div className="flex items-center gap-2 h-10 pl-4 pr-1 rounded-full bg-red-500/10">
			<span className="text-[13px] font-bold text-red-500">Eliminare la lista?</span>
			<button
				type="button"
				onClick={handleDelete}
				disabled={isDeleting}
				className="h-8 px-3 rounded-full bg-red-500 text-white text-[13px] font-bold disabled:opacity-50"
			>
				{isDeleting ? 'Eliminazione…' : 'Elimina'}
			</button>
			<button
				type="button"
				onClick={() => setIsConfirming(false)}
				disabled={isDeleting}
				className="h-8 px-3 rounded-full bg-card text-fg text-[13px] font-bold disabled:opacity-50"
			>
				Annulla
			</button>
		</div>
	);
}
