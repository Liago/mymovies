import { getTVDetailTMDb, getTVTrailerTMDb, getTVReviews, getTVWatchProviders } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { fetchSimilarTV, fetchTVRecommendations } from '@/app/actions';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import PersonCard from '@/components/PersonCard';
import HistoryTracker from '@/components/HistoryTracker';
import BackButton from '@/components/BackButton';
import AwardsSection from '@/components/AwardsSection';
import DetailHero from '@/components/detail/DetailHero';
import DetailTabs, { type DetailTab } from '@/components/detail/DetailTabs';
import HeroActions from '@/components/detail/HeroActions';
import RatingTiles, { toRatingValues } from '@/components/detail/RatingTiles';
import FactGrid from '@/components/detail/FactGrid';
import WhereToWatch, { primaryStreaming } from '@/components/detail/WhereToWatch';
import UserRating from '@/components/detail/UserRating';
import ReviewList from '@/components/detail/ReviewList';
import PosterGrid from '@/components/detail/PosterGrid';
import SeasonEpisodes from '@/components/detail/SeasonEpisodes';
import NextEpisodeBox from '@/components/detail/NextEpisodeBox';
import { buildAiredSeasons } from '@/lib/progress';
import { formatDate, tvStatusLabel, yearOf } from '@/lib/format';
import { isReturningStatus } from '@/lib/tv-status';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params;
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'it-IT';
	const show = /^\d+$/.test(id) ? await getTVDetailTMDb(parseInt(id), lang) : null;
	if (!show) return { title: 'Serie non trovata - CineScope' };
	return {
		title: `${show.title} - CineScope`,
		description: show.description || `Episodi, voti e dove guardare ${show.title} su CineScope.`,
		openGraph: show.poster ? { images: [{ url: show.poster, width: 500, height: 750, alt: show.title }] } : undefined,
	};
}

export default async function TVDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'it-IT';

	const tvId = parseInt(id);
	if (Number.isNaN(tvId)) notFound();

	const [tvShow, trailerUrl, similarShows, recommendations, reviews, watchProviders] = await Promise.all([
		getTVDetailTMDb(tvId, lang),
		getTVTrailerTMDb(tvId, lang),
		fetchSimilarTV(tvId),
		fetchTVRecommendations(tvId),
		getTVReviews(tvId, 1, lang),
		getTVWatchProviders(tvId, lang)
	]);

	if (!tvShow) {
		notFound();
	}

	const backdrop = tvShow.backdrop || tvShow.poster?.replace('w500', 'original') || null;
	const year = yearOf(tvShow.releaseDate);
	const returning = isReturningStatus(tvShow.status);
	const seasonsLabel = tvShow.seasons ? `${tvShow.seasons} ${tvShow.seasons === 1 ? 'stagione' : 'stagioni'}` : null;
	const streaming = primaryStreaming(watchProviders);
	const status = tvStatusLabel(tvShow.status);
	const airedSeasons = buildAiredSeasons(tvShow.seasonsList, tvShow.lastEpisodeToAir);

	const baseRatings = toRatingValues(tvShow.rating, false);
	const ratings = baseRatings.length >= 2 ? baseRatings : toRatingValues(tvShow.rating, true);

	const seen = new Set<number>();
	const similar = [...recommendations, ...similarShows]
		.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
		.slice(0, 18);

	const meta = { title: tvShow.title, poster: tvShow.poster };

	const tabs: DetailTab[] = [
		{
			key: 'episodes',
			label: 'Episodi',
			content: (
				<SeasonEpisodes
					tvId={tvId}
					title={tvShow.title}
					poster={tvShow.poster}
					seasons={tvShow.seasonsList}
					airedSeasons={airedSeasons}
				/>
			),
		},
		{
			key: 'overview',
			label: 'Panoramica',
			content: (
				<>
					{tvShow.description && (
						<p className="m-0 text-[15px] md:text-[19px] leading-[1.55] md:leading-[1.6] font-medium text-fg2 md:text-fg max-w-[760px] text-pretty">
							{tvShow.description}
						</p>
					)}
					<FactGrid
						facts={[
							{ label: 'Ideatore', value: tvShow.creators },
							{ label: 'Rete', value: tvShow.networks.slice(0, 2).join(' · ') },
							{ label: 'Prima messa in onda', value: formatDate(tvShow.releaseDate) },
							{ label: 'Stagioni', value: [tvShow.seasons, tvShow.episodes ? `${tvShow.episodes} episodi` : null].filter(Boolean).join(' · ') },
							{ label: 'Durata media', value: tvShow.episodeRunTime ? `${tvShow.episodeRunTime} min` : null },
							{ label: 'Stato', value: status },
						]}
					/>
					{tvShow.awards && <AwardsSection awards={tvShow.awards} variant="card" />}
				</>
			),
		},
	];

	if (tvShow.actors.length) {
		tabs.push({
			key: 'cast',
			label: 'Cast',
			content: (
				<div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-6">
					{tvShow.actors.map((actor: { id: number; name: string; character?: string; profilePath?: string | null }, i: number) => (
						<PersonCard
							key={`${actor.id}-${i}`}
							personId={actor.id}
							name={actor.name}
							role={actor.character || ''}
							profilePath={actor.profilePath}
							size={104}
						/>
					))}
				</div>
			),
		});
	}
	if (reviews.results.length) {
		tabs.push({ key: 'reviews', label: 'Recensioni', content: <ReviewList reviews={reviews.results} /> });
	}
	if (similar.length) {
		tabs.push({ key: 'similar', label: 'Simili', content: <PosterGrid items={similar} /> });
	}

	return (
		<>
			<HistoryTracker id={tvId} title={tvShow.title} poster={tvShow.poster || null} type="tv" />

			<DetailHero
				variant="tv"
				backdrop={backdrop}
				back={<BackButton fallbackHref="/catalogo/trending?type=tv" variant="pill" />}
				mobileBack={<BackButton fallbackHref="/esplora" variant="round" />}
				eyebrow={['Serie', tvShow.genres[0] || streaming?.name].filter(Boolean).join(' · ')}
				title={tvShow.title}
				mobileMeta={[year && (returning ? `${year} –` : year), seasonsLabel, ratings[0] ? `${ratings[0].label} ${ratings[0].value}` : null]
					.filter(Boolean)
					.join(' · ')}
				chips={[year && (returning ? `${year} –` : year), seasonsLabel, streaming?.name, status].filter(Boolean) as string[]}
				actions={
					<HeroActions variant="hero" mediaType="tv" mediaId={tvId} title={meta.title} poster={meta.poster} trailerUrl={trailerUrl} />
				}
				ratings={<RatingTiles ratings={ratings} variant="hero" />}
			/>

			<DetailTabs
				tabs={tabs}
				defaultTab="episodes"
				mobileIntro={
					<>
						<NextEpisodeBox
							variant="compact"
							tvId={tvId}
							title={meta.title}
							poster={meta.poster}
							seasons={airedSeasons}
							upcoming={tvShow.nextEpisodeToAir}
						/>
						<HeroActions variant="mobile" mediaType="tv" mediaId={tvId} title={meta.title} poster={meta.poster} trailerUrl={trailerUrl} />
					</>
				}
				aside={
					<>
						<div className="hidden md:block">
							<NextEpisodeBox
								variant="aside"
								tvId={tvId}
								title={meta.title}
								poster={meta.poster}
								seasons={airedSeasons}
								upcoming={tvShow.nextEpisodeToAir}
							/>
						</div>
						<WhereToWatch providers={watchProviders} title="Dove guardarla">
							<UserRating mediaType="tv" mediaId={tvId} title={meta.title} poster={meta.poster} />
						</WhereToWatch>
					</>
				}
			/>
		</>
	);
}
