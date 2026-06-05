'use client';

import Link from 'next/link';
import { Bookmark } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FollowingButton() {
	const { t } = useLanguage();
	return (
		<Link
			href="/tv/following"
			className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 hover:border-primary/40 text-white px-5 py-3 rounded-xl font-semibold transition-colors self-start"
		>
			<Bookmark size={18} />
			{t('following.button')}
		</Link>
	);
}
