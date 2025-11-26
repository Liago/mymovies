'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchResult } from '@/app/api/search/route';
import Link from 'next/link';

export default function SearchBar() {
	const [query, setQuery] = useState('');
	const [results, setResults] = useState<SearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (query.trim().length === 0) {
			setResults([]);
			return;
		}

		// Debounce search
		if (debounceTimeout.current) {
			clearTimeout(debounceTimeout.current);
		}

		debounceTimeout.current = setTimeout(async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
				const data = await response.json();
				setResults(data.results || []);
			} catch (error) {
				console.error('Search error:', error);
				setResults([]);
			} finally {
				setIsLoading(false);
			}
		}, 300);

		return () => {
			if (debounceTimeout.current) {
				clearTimeout(debounceTimeout.current);
			}
		};
	}, [query]);

	return (
		<div className="search-container">
			<div className={`search-bar ${isFocused ? 'focused' : ''}`}>
				<svg
					className="search-icon"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<circle cx="11" cy="11" r="8" />
					<path d="m21 21-4.35-4.35" />
				</svg>
				<input
					type="text"
					placeholder="Search for movies or TV series..."
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onFocus={() => setIsFocused(true)}
					onBlur={() => setTimeout(() => setIsFocused(false), 200)}
					className="search-input"
				/>
				{isLoading && (
					<div className="loading-spinner">
						<div className="spinner" />
					</div>
				)}
				{query && !isLoading && (
					<button
						onClick={() => setQuery('')}
						className="clear-button"
						aria-label="Clear search"
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<circle cx="12" cy="12" r="10" opacity="0.3" />
							<path d="M15 9l-6 6M9 9l6 6" />
						</svg>
					</button>
				)}
			</div>

			{query && results.length > 0 && (
				<div className="results-container">
					{results.map((result) => (
						<Link
							key={result.id}
							href={`/movie/${result.id}`}
							className="result-item block"
							onClick={() => setQuery('')}
						>
							<div className="result-content">
								<div className="result-header">
									<h3 className="result-title">{result.title}</h3>
									<span className={`result-badge ${result.type}`}>
										{result.type === 'movie' ? '🎬 Movie' : '📺 TV Series'}
									</span>
								</div>
								<p className="result-description line-clamp-2">{result.description}</p>
								<div className="result-footer">
									<span className="result-year">{result.year}</span>
									<div className="relevance-container">
										<div className="relevance-bar">
											<div
												className="relevance-fill"
												style={{ width: `${result.relevance}%` }}
											/>
										</div>
										<span className="relevance-text">{result.relevance}% match</span>
									</div>
								</div>
							</div>
						</Link>
					))}
				</div>
			)}

			{query && !isLoading && results.length === 0 && (
				<div className="no-results">
					<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
						<circle cx="11" cy="11" r="8" />
						<path d="m21 21-4.35-4.35" />
					</svg>
					<p>No results found for &quot;{query}&quot;</p>
				</div>
			)}
		</div>
	);
}
