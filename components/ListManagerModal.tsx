'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Check, Lock, Globe } from 'lucide-react';
import { actionGetUserLists, actionCreateList, actionAddToList } from '@/app/actions';
import type { TMDBList } from '@/lib/tmdb-user';

interface ListManagerModalProps {
	isOpen: boolean;
	onClose: () => void;
	mediaType: 'movie' | 'tv';
	mediaId: number;
}

export default function ListManagerModal({ isOpen, onClose, mediaType, mediaId }: ListManagerModalProps) {
	const [lists, setLists] = useState<TMDBList[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [newListName, setNewListName] = useState('');
	const [newListDesc, setNewListDesc] = useState('');
	const [addedLists, setAddedLists] = useState<number[]>([]); // Track which lists item was added to in this session

	useEffect(() => {
		if (isOpen) {
			loadLists();
		}
	}, [isOpen]);

	const loadLists = async () => {
		setIsLoading(true);
		const userLists = await actionGetUserLists();
		setLists(userLists);
		setIsLoading(false);
	};

	const handleCreateList = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newListName.trim()) return;

		setIsCreating(true);
		const listId = await actionCreateList(newListName, newListDesc);

		if (listId) {
			setNewListName('');
			setNewListDesc('');
			await loadLists();
		}
		setIsCreating(false);
	};

	const handleAddToList = async (listId: number) => {
		// Optimistic UI updates are tricky here without knowing if it's already in list
		// For now just try adding
		const success = await actionAddToList(listId, mediaId);
		if (success) {
			setAddedLists(prev => [...prev, listId]);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
			<div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
				{/* Header */}
				<div className="flex items-center justify-between p-4 border-b border-white/10">
					<h3 className="text-lg font-bold text-white">Save to List</h3>
					<button
						onClick={onClose}
						className="p-1 hover:bg-white/10 rounded-full transition-colors"
					>
						<X size={20} className="text-gray-400" />
					</button>
				</div>

				{/* Content */}
				<div className="p-4 max-h-[60vh] overflow-y-auto">
					{/* Create New List Form */}
					<form onSubmit={handleCreateList} className="mb-6 p-4 rounded-xl bg-white/5 border border-white/5">
						<h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
							<Plus size={16} /> Create New List
						</h4>
						<div className="space-y-3">
							<input
								type="text"
								placeholder="List Name"
								value={newListName}
								onChange={(e) => setNewListName(e.target.value)}
								className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
								required
							/>
							<input
								type="text"
								placeholder="Description (optional)"
								value={newListDesc}
								onChange={(e) => setNewListDesc(e.target.value)}
								className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
							/>
							<button
								type="submit"
								disabled={isCreating || !newListName.trim()}
								className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold py-2 rounded-lg transition-colors"
							>
								{isCreating ? 'Creating...' : 'Create List'}
							</button>
						</div>
					</form>

					{/* Lists */}
					<div className="space-y-2">
						{isLoading ? (
							<div className="text-center py-8 text-gray-500">Loading lists...</div>
						) : lists.length === 0 ? (
							<div className="text-center py-8 text-gray-500">No lists found. Create one!</div>
						) : (
							lists.map((list) => {
								const isAdded = addedLists.includes(list.id);
								return (
									<button
										key={list.id}
										onClick={() => handleAddToList(list.id)}
										disabled={isAdded}
										className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-50 disabled:cursor-default group transition-all"
									>
										<div className="text-left">
											<div className="font-semibold text-white">{list.name}</div>
											<div className="text-xs text-gray-400">{list.item_count} items</div>
										</div>
										{isAdded ? (
											<div className="bg-green-500/20 text-green-500 p-1.5 rounded-full">
												<Check size={16} />
											</div>
										) : (
											<div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 p-1.5 rounded-full text-white">
												<Plus size={16} />
											</div>
										)}
									</button>
								);
							})
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
