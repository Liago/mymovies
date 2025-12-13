'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { actionDeleteList } from '@/app/actions';
import { useRouter } from 'next/navigation';

export default function DeleteListButton({ listId }: { listId: number }) {
	const [isConfirming, setIsConfirming] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const router = useRouter();

	const handleDelete = async () => {
		setIsDeleting(true);
		const success = await actionDeleteList(listId);

		if (success) {
			router.push('/profile/lists');
			router.refresh();
		} else {
			setIsDeleting(false);
			setIsConfirming(false);
		}
	};

	if (!isConfirming) {
		return (
			<button
				onClick={() => setIsConfirming(true)}
				className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
			>
				<Trash2 size={18} />
				Elimina Lista
			</button>
		);
	}

	return (
		<div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/30">
			<span className="text-sm text-red-400">Sei sicuro?</span>
			<button
				onClick={handleDelete}
				disabled={isDeleting}
				className="px-3 py-1 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
			>
				{isDeleting ? 'Eliminazione...' : 'Sì'}
			</button>
			<button
				onClick={() => setIsConfirming(false)}
				disabled={isDeleting}
				className="px-3 py-1 rounded-lg border border-white/10 text-gray-400 text-sm hover:bg-white/5 transition-colors disabled:opacity-50"
			>
				No
			</button>
		</div>
	);
}
