'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Search, Film, Tv } from 'lucide-react';
import Link from 'next/link';
import { SearchResult } from '@/app/api/search/route';

interface SearchOverlayProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

	// Focus input when overlay opens
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
			setQuery('');
			setResults([]);
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	// Close on Escape key
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		if (isOpen) {
			window.addEventListener('keydown', handleKeyDown);
		}
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	// Debounced search
	const handleSearch = useCallback((searchQuery: string) => {
		if (searchQuery.trim().length === 0) {
			setResults([]);
			return;
		}

		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}

		debounceTimeout.current = setTimeout(async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
				const data = await response.json();
				setResults(data.results || []);
			} catch (error) {
				console.error('Search error:', error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 350);
	}, []);

	useEffect(() => {
		handleSearch(query);
		return () => {
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}
		};
	}, [query, handleSearch]);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-2xl animate-fade-in">
			{/* Header */}
			<div className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/10">
				<div className="text-2xl font-bold text-white">Search</div>
				<button
					onClick={onClose}
					className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
					aria-label="Close search"
				>
					<X size={24} />
				</button>
			</div>

			{/* Search Input */}
			<div className="px-6 md:px-12 py-8 md:py-12">
				<div className="max-w-4xl mx-auto relative">
					<Search className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-500" size={28} />
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search movies and TV shows..."
						className="w-full bg-transparent border-none outline-none text-3xl md:text-5xl font-bold text-white placeholder:text-zinc-600 pl-12 caret-primary"
					/>
					{query && (
						<button
							onClick={() => setQuery('')}
							className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white transition-colors"
						>
							<X size={24} />
						</button>
					)}
				</div>
			</div>

			{/* Results Area */}
			<div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12">
				<div className="max-w-6xl mx-auto">
					{isLoading && (
						<div className="flex justify-center py-12">
							<div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
						</div>
					)}

					{!isLoading && query && results.length === 0 && (
						<div className="text-center py-16">
							<Search className="mx-auto mb-4 text-zinc-700" size={48} />
							<p className="text-xl text-zinc-500">No results found for "{query}"</p>
						</div>
					)}

					{!isLoading && results.length > 0 && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{results.map((result) => (
								<Link
									key={result.id}
									href={`/movie/${result.id}`}
									onClick={onClose}
									className="group flex gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 transition-all"
								>
									{/* Poster Thumbnail */}
									<div className="flex-shrink-0 w-16 h-24 rounded-md overflow-hidden bg-zinc-800">
										{result.poster ? (
											<img src={result.poster} alt={result.title} className="w-full h-full object-cover" />
										) : (
											<div className="w-full h-full flex items-center justify-center text-zinc-600">
												{result.type === 'movie' ? <Film size={24} /> : <Tv size={24} />}
											</div>
										)}
									</div>

									{/* Info */}
									<div className="flex-1 min-w-0">
										<h3 className="font-bold text-white truncate group-hover:text-primary transition-colors">
											{result.title}
										</h3>
										<div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
											<span className="px-1.5 py-0.5 rounded bg-white/10 uppercase font-medium">
												{result.type === 'movie' ? 'Movie' : 'TV'}
											</span>
											<span>{result.year}</span>
										</div>
										{result.description && (
											<p className="text-sm text-zinc-400 mt-2 line-clamp-2">{result.description}</p>
										)}
									</div>
								</Link>
							))}
						</div>
					)}

					{!query && (
						<div className="text-center py-16">
							<p className="text-zinc-600 text-lg">Start typing to search...</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
