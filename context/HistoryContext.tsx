'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface HistoryItem {
	id: number | string;
	title: string;
	poster: string | null;
	type: 'movie' | 'tv';
	timestamp: number;
}

interface HistoryContextType {
	history: HistoryItem[];
	addToHistory: (item: Omit<HistoryItem, 'timestamp'>) => void;
	clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: React.ReactNode }) {
	const [history, setHistory] = useState<HistoryItem[]>([]);

	useEffect(() => {
		const storedHistory = localStorage.getItem('cine_history');
		if (storedHistory) {
			try {
				setHistory(JSON.parse(storedHistory));
			} catch (e) {
				console.error('Failed to parse history', e);
			}
		}
	}, []);

	const addToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
		setHistory((prev) => {
			const newHistory = [
				{ ...item, timestamp: Date.now() },
				...prev.filter((i) => i.id !== item.id) // Remove if already exists to move to top
			].slice(0, 50); // Keep max 50 items

			localStorage.setItem('cine_history', JSON.stringify(newHistory));
			return newHistory;
		});
	};

	const clearHistory = () => {
		setHistory([]);
		localStorage.removeItem('cine_history');
	};

	return (
		<HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
			{children}
		</HistoryContext.Provider>
	);
}

export function useHistory() {
	const context = useContext(HistoryContext);
	if (context === undefined) {
		throw new Error('useHistory must be used within a HistoryProvider');
	}
	return context;
}
