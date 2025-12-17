import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	baseUrl: string;
	searchParams?: Record<string, string>;
}

export default function PaginationControls({ currentPage, totalPages, baseUrl, searchParams = {} }: PaginationControlsProps) {
	if (totalPages <= 1) return null;

	const createPageUrl = (page: number) => {
		const params = new URLSearchParams(searchParams);
		params.set('page', page.toString());
		return `${baseUrl}?${params.toString()}`;
	};

	return (
		<div className="flex justify-center items-center gap-4 mt-12 mb-8">
			{currentPage > 1 ? (
				<Link
					href={createPageUrl(currentPage - 1)}
					className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
					aria-label="Previous Page"
				>
					<ChevronLeft size={24} className="text-white" />
				</Link>
			) : (
				<button disabled className="p-2 rounded-full bg-white/5 border border-white/5 opacity-50 cursor-not-allowed">
					<ChevronLeft size={24} className="text-zinc-500" />
				</button>
			)}

			<span className="text-zinc-400 font-medium">
				Page <span className="text-white font-bold">{currentPage}</span> of <span className="text-white font-bold">{totalPages}</span>
			</span>

			{currentPage < totalPages ? (
				<Link
					href={createPageUrl(currentPage + 1)}
					className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
					aria-label="Next Page"
				>
					<ChevronRight size={24} className="text-white" />
				</Link>
			) : (
				<button disabled className="p-2 rounded-full bg-white/5 border border-white/5 opacity-50 cursor-not-allowed">
					<ChevronRight size={24} className="text-zinc-500" />
				</button>
			)}
		</div>
	);
}
