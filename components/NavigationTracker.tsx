'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { initInAppHistory, recordInAppNavigation } from '@/lib/in-app-history';

/** Registra le navigazioni interne all'app, usate da BackButton per decidere se tornare indietro. */
export default function NavigationTracker() {
	const pathname = usePathname();
	const previousPathname = useRef<string | null>(null);

	useEffect(() => {
		if (previousPathname.current === null) {
			initInAppHistory();
		} else if (previousPathname.current !== pathname) {
			recordInAppNavigation();
		}
		previousPathname.current = pathname;
	}, [pathname]);

	return null;
}
