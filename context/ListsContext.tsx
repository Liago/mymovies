'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

export interface ListItem {
	id: number;
	media_type: 'movie' | 'tv';
	title: string;
	poster: string | null;
	added_at: string;
}

export interface UserList {
	id: number;
	name: string;
	description: string | null;
	count: number;
	items?: ListItem[];
}

interface ListsContextType {
	lists: UserList[];
	createList: (name: string, description?: string) => Promise<number | null>;
	deleteList: (id: number) => Promise<void>;
	addToList: (listId: number, item: ListItem) => Promise<void>;
	removeFromList: (listId: number, itemId: number, mediaType: 'movie' | 'tv') => Promise<void>;
	getListDetails: (listId: number) => Promise<UserList | null>;
	isLoading: boolean;
}

const ListsContext = createContext<ListsContextType | undefined>(undefined);

export function ListsProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth();
	const [lists, setLists] = useState<UserList[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load lists on mount/auth
	useEffect(() => {
		const loadLists = async () => {
			console.log('[ListsContext] Loading lists, user:', user?.id);
			setIsLoading(true);
			if (user) {
				try {
					console.log('[ListsContext] Fetching from API...');
					const response = await fetch('/api/lists');
					console.log('[ListsContext] API response status:', response.status);
					if (response.ok) {
						const data = await response.json();
						console.log('[ListsContext] Loaded lists:', data.length);
						setLists(data);
					} else {
						console.error('[ListsContext] API error:', await response.text());
					}
				} catch (error) {
					console.error('Error loading lists:', error);
				}
			} else {
				console.log('[ListsContext] Guest mode - loading from localStorage');
				// Guest mode - localStorage
				const stored = localStorage.getItem('cine_lists');
				if (stored) {
					try {
						setLists(JSON.parse(stored));
					} catch (e) {
						console.error('Error parsing lists:', e);
					}
				}
			}
			setIsLoading(false);
		};
		loadLists();
	}, [user]);

	// Sync to localStorage for guests
	useEffect(() => {
		if (!user && !isLoading) {
			localStorage.setItem('cine_lists', JSON.stringify(lists));
		}
	}, [lists, user, isLoading]);

	const createList = useCallback(async (name: string, description: string = '') => {
		if (user) {
			try {
				// First, create on TMDB
				const tmdbResponse = await fetch('/api/lists/tmdb/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, description })
				});

				let tmdbListId: string | null = null;
				if (tmdbResponse.ok) {
					const tmdbData = await tmdbResponse.json();
					tmdbListId = tmdbData.list_id?.toString();
				}

				// Then create on Supabase with TMDB reference
				const response = await fetch('/api/lists', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, description, tmdb_list_id: tmdbListId })
				});

				if (response.ok) {
					const created = await response.json();
					setLists(prev => [...prev, created]);
					return created.id;
				}
			} catch (error) {
				console.error('Error creating list:', error);
			}
			return null;
		} else {
			// Guest mode - local only
			const newList: UserList = {
				id: Date.now(),
				name,
				description,
				count: 0,
				items: []
			};
			setLists(prev => [...prev, newList]);
			return newList.id;
		}
	}, [user]);

	const deleteList = useCallback(async (id: number) => {
		setLists(prev => prev.filter(l => l.id !== id));
		if (user) {
			await fetch(`/api/lists?id=${id}`, { method: 'DELETE' });
		}
	}, [user]);

	const addToList = useCallback(async (listId: number, item: ListItem) => {
		setLists(prev => prev.map(list => {
			if (list.id === listId) {
				// Check duplication
				if (list.items?.some(i => i.id === item.id && i.media_type === item.media_type)) {
					return list;
				}
				return {
					...list,
					count: list.count + 1,
					items: [...(list.items || []), item]
				};
			}
			return list;
		}));

		if (user) {
			await fetch(`/api/lists/${listId}/items`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(item)
			});
		}
	}, [user]);

	const removeFromList = useCallback(async (listId: number, itemId: number, mediaType: 'movie' | 'tv') => {
		setLists(prev => prev.map(list => {
			if (list.id === listId) {
				return {
					...list,
					count: Math.max(0, list.count - 1),
					items: list.items?.filter(i => !(i.id === itemId && i.media_type === mediaType))
				};
			}
			return list;
		}));

		if (user) {
			await fetch(`/api/lists/${listId}/items?id=${itemId}&type=${mediaType}`, {
				method: 'DELETE'
			});
		}
	}, [user]);

	const getListDetails = useCallback(async (listId: number) => {
		// Return from state if available with items
		const existing = lists.find(l => l.id === listId);
		if (existing && existing.items && existing.items.length === existing.count) {
			return existing;
		}

		// If auth, fetch fresh details
		if (user) {
			try {
				const response = await fetch(`/api/lists/${listId}`);
				if (response.ok) {
					const detailed = await response.json();
					// Update local state cache
					setLists(prev => prev.map(l => l.id === listId ? detailed : l));
					return detailed;
				}
			} catch (e) { console.error(e); }
		}

		return existing || null;
	}, [lists, user]);

	return (
		<ListsContext.Provider value={{ lists, createList, deleteList, addToList, removeFromList, getListDetails, isLoading }}>
			{children}
		</ListsContext.Provider>
	);
}

export function useLists() {
	const context = useContext(ListsContext);
	if (!context) throw new Error('useLists must be used within ListsProvider');
	return context;
}
