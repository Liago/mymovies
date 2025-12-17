'use client';

import { useEffect } from 'react';
import { useHistory } from '@/context/HistoryContext';

interface HistoryTrackerProps {
	id: number | string;
	title: string;
	poster: string | null;
	type: 'movie' | 'tv';
}

export default function HistoryTracker({ id, title, poster, type }: HistoryTrackerProps) {
	const { addToHistory } = useHistory();

	useEffect(() => {
		addToHistory({
			id,
			title,
			poster,
			type
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, title]); // Only run when content changes

	return null; // This component renders nothing
}
