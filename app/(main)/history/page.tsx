'use client';

import Link from 'next/link';
import { Clock, Trash2 } from 'lucide-react';
import { useHistory } from '@/context/HistoryContext';
import MovieCard from '@/components/MovieCard';
import BackButton from '@/components/BackButton';
import PageShell from '@/components/ui/PageShell';
import PageHeader from '@/components/ui/PageHeader';

export default function HistoryPage() {
	const { history, clearHistory } = useHistory();

	return (
		<PageShell width="wide">
			<PageHeader
				eyebrow="Profilo"
				leading={<BackButton variant="plain" fallbackHref="/profile" />}
				title="Cronologia"
				subtitle="I titoli che hai aperto di recente"
				actions={
					history.length > 0 && (
						<button
							type="button"
							onClick={clearHistory}
							className="h-10 px-4 rounded-full bg-bg2 text-[13px] font-bold flex items-center gap-2 text-red-500 hover:opacity-80"
						>
							<Trash2 size={15} />
							Svuota
						</button>
					)
				}
			/>

			{history.length > 0 ? (
				<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-2.5 gap-y-3.5 md:gap-x-[18px] md:gap-y-[22px]">
					{history.map((item) => (
						<MovieCard
							key={`${item.type}-${item.id}-${item.timestamp}`}
							id={item.id}
							title={item.title}
							poster={item.poster}
							type={item.type}
							subtitle={item.type === 'tv' ? 'Serie' : 'Film'}
							compact
						/>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center text-center gap-3 py-14">
					<span className="w-16 h-16 rounded-full bg-bg2 flex items-center justify-center text-fg3">
						<Clock size={28} />
					</span>
					<h2 className="m-0 text-[20px] font-bold">Ancora niente qui</h2>
					<p className="m-0 max-w-sm text-[14px] font-medium text-fg3">I film e le serie che apri compariranno in questa pagina.</p>
					<Link href="/esplora" className="mt-2 h-11 px-5 rounded-full bg-fg text-bg text-[14px] font-bold flex items-center">
						Esplora il catalogo
					</Link>
				</div>
			)}
		</PageShell>
	);
}
