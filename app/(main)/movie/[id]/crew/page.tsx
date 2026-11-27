import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import FullCreditsView from '@/components/credits/FullCreditsView';
import { getFullCredits, resolveTmdbId } from '@/lib/tmdb-credits';

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
	const lang = (await cookies()).get('app_language')?.value || 'it-IT';
	const tmdbId = await resolveTmdbId(id, 'movie');
	return tmdbId ? getFullCredits('movie', tmdbId, lang) : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
	const { id } = await params;
	const credits = await load(id);
	if (!credits) return { title: 'Cast e troupe - CineScope' };
	return {
		title: `${credits.title}: cast e troupe - CineScope`,
		description: `Cast completo e troupe di ${credits.title}: regia, sceneggiatura, fotografia, montaggio e tutti i reparti.`,
	};
}

export default async function MovieCrewPage({ params }: Params) {
	const { id } = await params;
	const credits = await load(id);
	if (!credits) notFound();

	return <FullCreditsView credits={credits} backHref={`/movie/${id}`} />;
}
