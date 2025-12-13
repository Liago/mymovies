'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';
import { actionCreateList } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function CreateListButton() {
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const { t } = useLanguage();

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setIsLoading(true);
		const listId = await actionCreateList(name, description);
		setIsLoading(false);

		if (listId) {
			setIsOpen(false);
			setName('');
			setDescription('');
			router.refresh();
		}
	};

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-purple-600/25"
			>
				<Plus size={20} />
				Crea Nuova Lista
			</button>

			{/* Modal */}
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
					<div className="bg-gray-900 rounded-2xl border border-white/10 max-w-md w-full p-6">
						<h2 className="text-2xl font-bold mb-4 text-white">Crea Nuova Lista</h2>
						<form onSubmit={handleCreate}>
							<div className="mb-4">
								<label className="block text-sm font-medium text-gray-400 mb-2">
									Nome Lista
								</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
									placeholder="Es. I miei preferiti del 2024"
									required
								/>
							</div>
							<div className="mb-6">
								<label className="block text-sm font-medium text-gray-400 mb-2">
									Descrizione (opzionale)
								</label>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
									placeholder="Aggiungi una descrizione..."
									rows={3}
								/>
							</div>
							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 transition-colors"
									disabled={isLoading}
								>
									Annulla
								</button>
								<button
									type="submit"
									className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
									disabled={isLoading || !name.trim()}
								>
									{isLoading ? 'Creazione...' : 'Crea'}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}
