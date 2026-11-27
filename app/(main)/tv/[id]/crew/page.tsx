import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import FullCreditsView from '@/components/credits/FullCreditsView';
import { getFullCredits } from '@/lib/tmdb-credits';

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
	if (!/^\d+$/.test(id)) return null;
	const lang = (await cookies()).get('app_language')?.value || 'it-IT';
	return getFullCredits('tv', parseInt(id, 10), lang);
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { id } = await params;
	const credits = await load(id);
	if (!credits) return { title: 'Cast e troupe - CineScope' };
	return {
		title: `${credits.title}: cast e troupe - CineScope`,
		description: `Cast completo e troupe di ${credits.title}, con il numero di episodi di ciascuno.`,
	};
}

export default async function TVCrewPage({ params }: Params) {
	const { id } = await params;
	const credits = await load(id);
	if (!credits) notFound();

	return <FullCreditsView credits={credits} backHref={`/tv/${id}`} />;
}
