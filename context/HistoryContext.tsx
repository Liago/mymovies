'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import {
	syncLocalHistory,
	getHistory as getDbHistory,
	addToHistory as addToDbHistory,
	clearHistory as clearDbHistory
} from '@/app/actions/user-data';

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
	const { user } = useAuth();
	const [history, setHistory] = useState<HistoryItem[]>([]);

	useEffect(() => {
		const initHistory = async () => {
			const storedHistory = localStorage.getItem('cine_history');
			let localItems: HistoryItem[] = [];

			if (storedHistory) {
				try {
					localItems = JSON.parse(storedHistory);
				} catch (e) {
					console.error('Failed to parse history', e);
				}
			}

			if (user) {
				// If we have local items, sync them to DB then clear local
				if (localItems.length > 0) {
					await syncLocalHistory(user.id, localItems);
					localStorage.removeItem('cine_history');
				}

				// Fetch remote history
				const dbHistory = await getDbHistory(user.id);
				setHistory(dbHistory);
			} else {
				// Guest: use local items
				setHistory(localItems);
			}
		};

		initHistory();
	}, [user]);

	const addToHistory = (item: Omit<HistoryItem, 'timestamp'>) => {
		const newItem = { ...item, timestamp: Date.now() };

		setHistory((prev) => {
			const newHistory = [
				newItem,
				...prev.filter((i) => i.id !== item.id) // Remove if already exists to move to top
			].slice(0, 50); // Keep max 50 items

			if (!user) {
				localStorage.setItem('cine_history', JSON.stringify(newHistory));
			}
			return newHistory;
		});

		if (user) {
			addToDbHistory(user.id, newItem as HistoryItem).catch(console.error);
		}
	};

	const clearHistory = () => {
		setHistory([]);
		if (user) {
			clearDbHistory(user.id).catch(console.error);
		} else {
			localStorage.removeItem('cine_history');
		}
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
