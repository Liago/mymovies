'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOBILE_TABS } from '@/lib/navigation';
import { cn } from '@/lib/cn';

/** Tab bar in vetro, fissa in basso sotto i 768px. */
export default function MobileTabBar() {
	const pathname = usePathname() || '/';

	return (
		<nav
			className="md:hidden fixed left-3 right-3 bottom-[max(24px,env(safe-area-inset-bottom))] z-50 h-16 rounded-full glass border border-line flex justify-around items-center shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
			aria-label="Navigazione principale"
		>
			{MOBILE_TABS.map(({ label, href, icon: Icon, match }) => {
				const active = match(pathname);
				return (
					<Link
						key={href}
						href={href}
						aria-current={active ? 'page' : undefined}
						className={cn(
							'h-14 min-w-[52px] flex flex-col items-center justify-center gap-0.5 transition-colors duration-150',
							active ? 'text-acc' : 'text-fg3'
						)}
					>
						<Icon size={20} />
						<span className="text-[10px] font-bold">{label}</span>
					</Link>
				);
			})}
		</nav>
	);
}
