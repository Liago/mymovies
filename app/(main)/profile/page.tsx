import type { Metadata } from 'next';
import ProfilePageClient, { type ProfileTab } from './ProfilePageClient';

export const metadata: Metadata = { title: 'Profilo - CineScope' };

const TABS: ProfileTab[] = ['watchlist', 'preferiti', 'liste', 'voti'];

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
	const { tab } = await searchParams;
	const initialTab = TABS.includes(tab as ProfileTab) ? (tab as ProfileTab) : 'watchlist';
	return <ProfilePageClient initialTab={initialTab} />;
}
