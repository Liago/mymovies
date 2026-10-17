'use client';

import { useState } from 'react';
import { Plus, Trash2, Rss, ExternalLink, Check } from 'lucide-react';
import { POPULAR_CINEMA_FEEDS } from '@/lib/rss-feeds';
import { useRSS } from '@/context/RSSContext';
import PageShell from '@/components/ui/PageShell';
import PageHeader from '@/components/ui/PageHeader';
import Segmented from '@/components/ui/Segmented';
import BackButton from '@/components/BackButton';
import { formatDate } from '@/lib/format';

const field =
	'w-full h-11 bg-bg2 border border-transparent rounded-[12px] px-3.5 text-[14px] font-semibold text-fg placeholder:text-fg3 outline-none focus:border-acc transition-colors';

type Panel = 'mine' | 'popular' | 'custom';

export default function RSSFeedsPage() {
	const { feeds, addFeed, removeFeed, isSubscribed } = useRSS();
	const [panel, setPanel] = useState<Panel>('mine');
	const [newFeed, setNewFeed] = useState({ name: '', url: '', description: '', category: '' });
	const [error, setError] = useState('');

	const handleAddFeed = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		try {
			if (!newFeed.name || !newFeed.url) {
				setError('Nome e URL sono obbligatori');
				return;
			}

			// Basic URL validation
			try {
				new URL(newFeed.url);
			} catch {
				setError('URL non valido');
				return;
			}

			await addFeed({
				name: newFeed.name,
				url: newFeed.url,
				description: newFeed.description || undefined,
				category: newFeed.category || undefined
			});

			setNewFeed({ name: '', url: '', description: '', category: '' });
			setPanel('mine');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossibile aggiungere il feed');
		}
	};

	const handleRemoveFeed = async (id: string, name: string) => {
		if (confirm(`Rimuovere il feed «${name}»?`)) {
			await removeFeed(id);
		}
	};

	const handleAddPopularFeed = async (feed: typeof POPULAR_CINEMA_FEEDS[0]) => {
		try {
			await addFeed({
				name: feed.name,
				url: feed.url,
				description: feed.description,
				category: feed.category
			});
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Impossibile aggiungere il feed');
		}
	};

	return (
		<PageShell width="narrow">
			<PageHeader
				eyebrow="Notizie"
				leading={<BackButton variant="plain" fallbackHref="/profile" />}
				title="Feed RSS"
				subtitle="Le fonti che alimentano la pagina Notizie"
			/>

			<Segmented
				ariaLabel="Sezione"
				items={[
					{ key: 'mine', label: `I tuoi feed (${feeds.length})`, active: panel === 'mine', onClick: () => setPanel('mine') },
					{ key: 'popular', label: 'Popolari', active: panel === 'popular', onClick: () => setPanel('popular') },
					{ key: 'custom', label: 'Aggiungi', active: panel === 'custom', onClick: () => setPanel('custom') },
				]}
				className="self-start"
			/>

			{error && (
				<div className="px-4 py-3 rounded-[14px] bg-red-500/10 text-red-500 text-[14px] font-semibold">{error}</div>
			)}

			{panel === 'custom' && (
				<form onSubmit={handleAddFeed} className="p-5 rounded-[22px] bg-card border border-line flex flex-col gap-3">
					<h2 className="m-0 text-[18px] font-bold">Aggiungi un feed</h2>
					<input
						type="text"
						value={newFeed.name}
						onChange={(e) => setNewFeed({ ...newFeed, name: e.target.value })}
						className={field}
						placeholder="Nome *, es. Il mio blog di cinema"
					/>
					<input
						type="url"
						value={newFeed.url}
						onChange={(e) => setNewFeed({ ...newFeed, url: e.target.value })}
						className={field}
						placeholder="URL del feed *, es. https://example.com/feed/"
					/>
					<input
						type="text"
						value={newFeed.description}
						onChange={(e) => setNewFeed({ ...newFeed, description: e.target.value })}
						className={field}
						placeholder="Descrizione (facoltativa)"
					/>
					<input
						type="text"
						value={newFeed.category}
						onChange={(e) => setNewFeed({ ...newFeed, category: e.target.value })}
						className={field}
						placeholder="Categoria (facoltativa), es. Recensioni"
					/>
					<div className="flex gap-2.5 mt-1">
						<button type="submit" className="h-11 px-5 rounded-full bg-fg text-bg text-[14px] font-bold flex items-center gap-2 hover:opacity-90">
							<Plus size={16} />
							Aggiungi feed
						</button>
						<button
							type="button"
							onClick={() => {
								setPanel('mine');
								setError('');
							}}
							className="h-11 px-5 rounded-full bg-bg2 text-[14px] font-bold hover:opacity-80"
						>
							Annulla
						</button>
					</div>
				</form>
			)}

			{panel === 'popular' && (
				<div className="flex flex-col gap-2.5">
					{POPULAR_CINEMA_FEEDS.map((feed) => {
						const subscribed = isSubscribed(feed.url);
						return (
							<div key={feed.url} className="flex items-center gap-4 p-4 rounded-[18px] bg-card border border-line">
								<span className="flex-1 min-w-0 flex flex-col gap-0.5">
									<span className="text-[15px] font-bold">{feed.name}</span>
									<span className="text-[13px] font-medium text-fg3">{feed.description}</span>
								</span>
								<button
									type="button"
									onClick={() => handleAddPopularFeed(feed)}
									disabled={subscribed}
									className={`shrink-0 h-10 px-4 rounded-full text-[13px] font-bold flex items-center gap-1.5 ${
										subscribed ? 'bg-acc-soft text-acc cursor-default' : 'bg-fg text-bg hover:opacity-90'
									}`}
								>
									{subscribed ? <Check size={15} /> : <Plus size={15} />}
									{subscribed ? 'Aggiunto' : 'Aggiungi'}
								</button>
							</div>
						);
					})}
				</div>
			)}

			{panel === 'mine' &&
				(feeds.length === 0 ? (
					<div className="flex flex-col items-center text-center gap-3 py-14">
						<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
							<Rss size={28} />
						</span>
						<h2 className="m-0 text-[20px] font-bold">Nessun feed</h2>
						<p className="m-0 max-w-sm text-[14px] font-medium text-fg3">Scegli tra le fonti popolari o aggiungi l’URL di un feed RSS.</p>
						<button type="button" onClick={() => setPanel('popular')} className="mt-2 h-11 px-5 rounded-full bg-fg text-bg text-[14px] font-bold">
							Vedi i feed popolari
						</button>
					</div>
				) : (
					<div className="flex flex-col gap-2.5">
						{feeds.map((feed) => (
							<div key={feed.id} className="flex items-center gap-4 p-4 rounded-[18px] bg-card border border-line">
								<span className="w-10 h-10 shrink-0 rounded-xl bg-bg2 flex items-center justify-center">
									<Rss size={18} className="text-acc" />
								</span>
								<span className="flex-1 min-w-0 flex flex-col gap-0.5">
									<span className="text-[15px] font-bold truncate">{feed.name}</span>
									<span className="text-[12px] font-semibold text-fg3 flex items-center gap-2 flex-wrap">
										<a href={feed.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-fg">
											<ExternalLink size={12} />
											Apri feed
										</a>
										{feed.category && <span>· {feed.category}</span>}
										{feed.added_at && <span>· aggiunto il {formatDate(feed.added_at, { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
									</span>
								</span>
								<button
									type="button"
									onClick={() => handleRemoveFeed(feed.id, feed.name)}
									className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-fg3 hover:text-red-500 hover:bg-red-500/10 transition-colors"
									title="Rimuovi feed"
									aria-label={`Rimuovi ${feed.name}`}
								>
									<Trash2 size={18} />
								</button>
							</div>
						))}
					</div>
				))}
		</PageShell>
	);
}
