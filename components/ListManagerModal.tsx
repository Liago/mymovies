'use client';

import { useMounted } from '@/hooks/useMounted';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Check } from 'lucide-react';
import { useLists } from '@/context/ListsContext';

interface ListManagerModalProps {
	isOpen: boolean;
	onClose: () => void;
	mediaType: 'movie' | 'tv';
	mediaId: number;
	title: string;
	poster: string | null;
}

const field =
	'w-full h-11 bg-bg2 border border-transparent rounded-[12px] px-3.5 text-[14px] font-semibold text-fg placeholder:text-fg3 outline-none focus:border-acc transition-colors';

/** Salvataggio di un titolo in una delle liste dell'utente (o in una nuova). */
export default function ListManagerModal({ isOpen, onClose, mediaType, mediaId, title, poster }: ListManagerModalProps) {
	const { lists, createList, addToList, isLoading } = useLists();
	const [isCreating, setIsCreating] = useState(false);
	const [newListName, setNewListName] = useState('');
	const [newListDesc, setNewListDesc] = useState('');
	const [addedLists, setAddedLists] = useState<number[]>([]);
	const mounted = useMounted();

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen, onClose]);

	const handleCreateList = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newListName.trim()) return;

		setIsCreating(true);
		const listId = await createList(newListName, newListDesc);

		if (listId) {
			setNewListName('');
			setNewListDesc('');
		}
		setIsCreating(false);
	};

	const handleAddToList = async (listId: number) => {
		await addToList(listId, {
			id: mediaId,
			media_type: mediaType,
			title: title,
			poster: poster,
			added_at: new Date().toISOString()
		});
		setAddedLists(prev => [...prev, listId]);
	};

	if (!isOpen || !mounted) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-[200] flex items-start justify-center pt-[90px] px-4 bg-black/40 backdrop-blur-[8px] animate-fade-in"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
			aria-label="Salva in una lista"
		>
			<div
				className="w-[min(460px,100%)] bg-card text-fg border border-line rounded-[24px] shadow-modal overflow-hidden animate-pop-in"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
					<div className="min-w-0">
						<h3 className="m-0 text-[18px] font-bold">Salva in una lista</h3>
						<p className="m-0 text-[13px] font-medium text-fg3 truncate">{title}</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="w-9 h-9 shrink-0 rounded-full bg-bg2 flex items-center justify-center hover:opacity-80"
						aria-label="Chiudi"
					>
						<X size={18} />
					</button>
				</div>

				<div className="p-4 max-h-[60vh] overflow-y-auto flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						{isLoading ? (
							<div className="py-6 text-center text-[14px] font-semibold text-fg3">Caricamento liste…</div>
						) : lists.length === 0 ? (
							<div className="py-6 text-center text-[14px] font-semibold text-fg3">Non hai ancora liste: creane una qui sotto.</div>
						) : (
							lists.map((list) => {
								const isAdded = addedLists.includes(list.id) || list.items?.some(i => i.id === mediaId);
								return (
									<button
										key={list.id}
										type="button"
										onClick={() => handleAddToList(list.id)}
										disabled={isAdded}
										className="w-full flex items-center justify-between gap-3 p-3 rounded-[14px] bg-bg2 text-left transition-opacity hover:opacity-80 disabled:hover:opacity-100 disabled:cursor-default"
									>
										<span className="min-w-0">
											<span className="block text-[15px] font-bold truncate">{list.name}</span>
											<span className="text-[12px] font-semibold text-fg3">{list.count} titoli</span>
										</span>
										<span
											className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${isAdded ? 'bg-acc text-accfg' : 'bg-card text-fg'}`}
										>
											{isAdded ? <Check size={16} /> : <Plus size={16} />}
										</span>
									</button>
								);
							})
						)}
					</div>

					<form onSubmit={handleCreateList} className="flex flex-col gap-2.5 pt-4 border-t border-line">
						<span className="text-[12px] font-bold text-fg3">Nuova lista</span>
						<input
							type="text"
							placeholder="Nome della lista"
							value={newListName}
							onChange={(e) => setNewListName(e.target.value)}
							className={field}
							required
						/>
						<input
							type="text"
							placeholder="Descrizione (facoltativa)"
							value={newListDesc}
							onChange={(e) => setNewListDesc(e.target.value)}
							className={field}
						/>
						<button
							type="submit"
							disabled={isCreating || !newListName.trim()}
							className="h-11 rounded-full bg-fg text-bg text-[14px] font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity hover:opacity-90"
						>
							{isCreating ? 'Creazione…' : 'Crea lista'}
						</button>
					</form>
				</div>
			</div>
		</div>,
		document.body
	);
}
