'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();

	// Nascondi sidebar nelle pagine di dettaglio (movie/[id] e tv/[id])
	const isDetailPage = pathname?.match(/\/(movie|tv)\/[^/]+$/);

	return (
		<div className="min-h-screen bg-[#fdfbf7]">
			{!isDetailPage && <Sidebar />}
			<div className={isDetailPage ? '' : 'pl-20'}>
				{children}
			</div>
		</div>
	);
}
