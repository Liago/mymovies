'use client';

import { useHistory } from '@/context/HistoryContext';
import MovieCard from '@/components/MovieCard';
import { History, Trash2, Clock } from 'lucide-react';
import Link from 'next/link';

export default function HistoryPage() {
	const { history, clearHistory } = useHistory();

	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-12 px-6">
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
					<h1 className="text-3xl font-bold flex items-center gap-3">
						<History className="text-amber-500" />
						Watch History
					</h1>

					{history.length > 0 && (
						<button
							onClick={clearHistory}
							className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium border border-red-500/20"
						>
							<Trash2 size={16} />
							Clear History
						</button>
					)}
				</div>

				{history.length > 0 ? (
					<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
						{history.map((item) => (
							<MovieCard
								key={`${item.type}-${item.id}-${item.timestamp}`}
								id={item.id}
								title={item.title}
								poster={item.poster}
								type={item.type}
								rating={0} // History items don't store rating, or we could fetch it if needed but might be overkill
								year="" // We don't store year in history item currently
							/>
						))}
					</div>
				) : (
					<div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10 border-dashed">
						<Clock size={48} className="mx-auto text-gray-600 mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">No history yet</h3>
						<p className="text-gray-400">Pages you visit will appear here.</p>
						<Link
							href="/discovery"
							className="inline-block mt-6 px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary/80 transition-colors"
						>
							Browse Movies
						</Link>
					</div>
				)}
			</div>
		</main>
	);
}
