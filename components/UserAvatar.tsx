'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { initials } from '@/lib/format';
import { cn } from '@/lib/cn';

interface UserAvatarProps {
	size?: number;
	/** Se false rende solo il cerchio (senza link al profilo). */
	asLink?: boolean;
	className?: string;
}

/** Avatar circolare in accento con le iniziali dell'utente. */
export default function UserAvatar({ size = 42, asLink = true, className }: UserAvatarProps) {
	const { user } = useAuth();
	const label = initials(user?.name || user?.username);
	const style = { width: size, height: size, fontSize: Math.round(size * 0.33) };
	const cls = cn(
		'shrink-0 rounded-full bg-acc text-accfg flex items-center justify-center font-bold transition-opacity hover:opacity-80',
		className
	);

	if (!asLink) {
		return (
			<span className={cls} style={style}>
				{label}
			</span>
		);
	}

	return (
		<Link href="/profile" className={cls} style={style} aria-label="Il tuo profilo" title="Profilo">
			{label}
		</Link>
	);
}
