'use client';

import { useMounted } from '@/hooks/useMounted';
import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useLists } from '@/context/ListsContext';
import { cn } from '@/lib/cn';

const field =
	'w-full bg-bg2 border border-transparent rounded-[12px] px-3.5 py-3 text-[14px] font-semibold text-fg placeholder:text-fg3 outline-none focus:border-acc transition-colors';

interface CreateListButtonProps {
	/** `card`: riquadro tratteggiato "Nuova lista"; `row`: riga compatta (mobile). */
	variant?: 'card' | 'row';
	className?: string;
}

export default function CreateListButton({ variant = 'card', className }: CreateListButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [name, setName] = useState('');
	const [description, setDescription] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const mounted = useMounted();
	const router = useRouter();
	const { createList } = useLists();

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsOpen(false);
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [isOpen]);

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		setIsLoading(true);
		const listId = await createList(name, description);
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
				type="button"
				onClick={() => setIsOpen(true)}
				className={cn(
					'border-[1.5px] border-dashed border-line text-fg3 font-bold text-[14px] flex items-center justify-center gap-2 transition-colors hover:text-fg hover:border-fg3',
					variant === 'card' ? 'min-h-[200px] rounded-[22px] flex-col' : 'h-14 rounded-[16px]',
					className
				)}
			>
				<Plus size={variant === 'card' ? 22 : 18} />
				Nuova lista
			</button>

			{isOpen && mounted &&
				createPortal(
					<div
						className="fixed inset-0 z-[200] flex items-start justify-center pt-[90px] px-4 bg-black/40 backdrop-blur-[8px] animate-fade-in"
						onClick={() => setIsOpen(false)}
						role="dialog"
						aria-modal="true"
						aria-label="Nuova lista"
					>
						<div
							className="w-[min(460px,100%)] bg-card text-fg border border-line rounded-[24px] shadow-modal p-5 animate-pop-in"
							onClick={(e) => e.stopPropagation()}
						>
							<div className="flex items-center justify-between mb-4">
								<h2 className="m-0 text-[20px] font-extrabold tracking-[-0.02em]">Nuova lista</h2>
								<button
									type="button"
									onClick={() => setIsOpen(false)}
									className="w-9 h-9 rounded-full bg-bg2 flex items-center justify-center hover:opacity-80"
									aria-label="Chiudi"
								>
									<X size={18} />
								</button>
							</div>
							<form onSubmit={handleCreate} className="flex flex-col gap-3">
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className={field}
									placeholder="Nome, es. Fantascienza d'autore"
									required
									autoFocus
								/>
								<textarea
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									className={cn(field, 'resize-none')}
									placeholder="Descrizione (facoltativa)"
									rows={3}
								/>
								<div className="flex gap-2.5 mt-1">
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="flex-1 h-11 rounded-full bg-bg2 text-[14px] font-bold hover:opacity-80"
										disabled={isLoading}
									>
										Annulla
									</button>
									<button
										type="submit"
										className="flex-1 h-11 rounded-full bg-fg text-bg text-[14px] font-bold disabled:opacity-40 hover:opacity-90"
										disabled={isLoading || !name.trim()}
									>
										{isLoading ? 'Creazione…' : 'Crea'}
									</button>
								</div>
							</form>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}
