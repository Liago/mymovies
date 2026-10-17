import { getMovieDetail, type MovieData } from '@/lib/omdb';
import { getMovieDetailTMDb, getMovieTrailerTMDb, getMovieTrailer, getMovieReviews, getMovieDetailByImdbId, getMovieWatchProviders, type WatchProviderData } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { ArrowUpRight } from 'lucide-react';
import { fetchSimilarMovies, fetchMovieRecommendations } from '@/app/actions';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
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
import ReviewList, { type Review } from '@/components/detail/ReviewList';
import PosterGrid from '@/components/detail/PosterGrid';
import { countryName, formatRuntime, languageName, yearOf } from '@/lib/format';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params;
	const isTMDbId = /^\d+$/.test(id);
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'it-IT';

	let movie;
	if (isTMDbId) {
		movie = await getMovieDetailTMDb(parseInt(id), lang);
	} else {
		// Try TMDB first for localized metadata
		movie = await getMovieDetailByImdbId(id, lang);
		if (!movie) {
			movie = await getMovieDetail(id);
		}
	}

	if (!movie) {
		return {
			title: 'Film non trovato - CineScope',
			description: 'Il film richiesto non è stato trovato.'
		};
	}

	const title = `${movie.title} - CineScope`;
	const description = movie.description || `Trailer, voti e dove guardare ${movie.title} su CineScope.`;
	const poster = movie.poster ? (movie.poster.startsWith('http') ? movie.poster : `https://image.tmdb.org/t/p/w500${movie.poster}`) : '/placeholder-movie.jpg';

	return {
		title,
		description,
		openGraph: {
			title,
			description,
			images: [
				{
					url: poster,
					width: 500,
					height: 750,
					alt: movie.title,
				},
			],
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title,
			description,
			images: [poster],
		},
	};
}

interface MovieView {
	tmdbId: number | null;
	imdbId: string | null;
	title: string;
	description: string;
	poster: string | null;
	backdrop: string | null;
	releaseDate: string;
	runtime: number | null;
	genres: string[];
	director: string | null;
	screenplay: string | null;
	country: string | null;
	language: string | null;
	budget: string | null;
	revenue: string | null;
	awards: string | null;
	rating: Parameters<typeof toRatingValues>[0];
	actors: { id?: number; name: string; character?: string; profilePath?: string | null }[];
}

type TmdbMovie = NonNullable<Awaited<ReturnType<typeof getMovieDetailTMDb>>>;

interface SimilarItem {
	id: number;
	title: string;
	poster: string | null;
	year?: string;
	rating?: number;
	type?: 'movie' | 'tv';
}

/** Normalizza i dati TMDB in un'unica forma per la pagina. */
function fromTmdb(movie: TmdbMovie): MovieView {
	const countries = movie.countryCodes.map((c: string) => countryName(c)).filter(Boolean) as string[];
	const director = movie.director?.name;

	return {
		tmdbId: movie.id,
		imdbId: movie.imdbId,
		title: movie.title,
		description: movie.description || '',
		poster: movie.poster,
		backdrop: movie.backdrop || movie.poster?.replace('w500', 'original') || null,
		releaseDate: movie.releaseDate || '',
		runtime: movie.runtime,
		genres: movie.genres,
		director: director && director !== 'N/A' ? director : null,
		screenplay: movie.screenplay.length ? movie.screenplay.join(', ') : movie.writer,
		country: countries.length ? countries.slice(0, 2).join(', ') : movie.country,
		language: languageName(movie.originalLanguage) || movie.languages?.split(',')[0] || null,
		budget: movie.budget,
		revenue: movie.revenue || (movie.boxOffice !== 'N/A' ? movie.boxOffice : null),
		awards: movie.awards,
		rating: movie.rating,
		actors: movie.actors,
	};
}

/** Fallback quando il titolo esiste solo su OMDb (id IMDb non trovato su TMDB). */
function fromOmdb(movie: MovieData): MovieView {
	return {
		tmdbId: null,
		imdbId: movie.id,
		title: movie.title,
		description: movie.description || '',
		poster: movie.poster || null,
		backdrop: movie.poster || null,
		releaseDate: movie.releaseDate || String(movie.year || ''),
		runtime: parseInt(movie.duration) || null,
		genres: movie.genre,
		director: movie.director && movie.director !== 'N/A' ? movie.director : null,
		screenplay: null,
		country: null,
		language: null,
		budget: movie.budget !== 'N/A' ? movie.budget : null,
		revenue: movie.boxOffice !== 'N/A' ? movie.boxOffice : null,
		awards: null,
		rating: movie.rating,
		actors: movie.actors.map((name) => ({ name })),
	};
}

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const cookieStore = await cookies();
	const lang = cookieStore.get('app_language')?.value || 'it-IT';

	const isTMDbId = /^\d+$/.test(id);

	let movie: TmdbMovie | MovieData | null;
	let trailerUrl: string | null = null;
	let similarMovies: SimilarItem[] = [];
	let recommendations: SimilarItem[] = [];
	let reviews: { results: Review[]; totalResults: number } = { results: [], totalResults: 0 };
	let watchProviders: WatchProviderData | null = null;

	if (isTMDbId) {
		const movieId = parseInt(id);
		[movie, trailerUrl, similarMovies, recommendations, reviews, watchProviders] = await Promise.all([
			getMovieDetailTMDb(movieId, lang),
			getMovieTrailerTMDb(movieId, lang),
			fetchSimilarMovies(movieId),
			fetchMovieRecommendations(movieId),
			getMovieReviews(movieId, 1, lang),
			getMovieWatchProviders(movieId, lang)
		]);
	} else {
		// Try TMDB first via IMDb ID
		movie = await getMovieDetailByImdbId(id, lang);

		if (movie) {
			// Found in TMDB! Fetch rich data using the resolved TMDB ID
			const movieId = movie.id;
			[trailerUrl, similarMovies, recommendations, reviews, watchProviders] = await Promise.all([
				getMovieTrailerTMDb(movieId, lang),
				fetchSimilarMovies(movieId),
				fetchMovieRecommendations(movieId),
				getMovieReviews(movieId, 1, lang),
				getMovieWatchProviders(movieId, lang)
			]);
		} else {
			// Fallback to OMDB
			movie = await getMovieDetail(id);
			trailerUrl = await getMovieTrailer(id);
		}
	}

	if (!movie) {
		notFound();
	}

	const view = typeof movie.id === 'number' ? fromTmdb(movie as TmdbMovie) : fromOmdb(movie as MovieData);
	const year = yearOf(view.releaseDate);
	const runtime = formatRuntime(view.runtime);
	const ratings = toRatingValues(view.rating);
	const streaming = primaryStreaming(watchProviders);

	// Consigliati + simili, senza duplicati
	const seen = new Set<number>();
	const similar = [...recommendations, ...similarMovies]
		.filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
		.slice(0, 18);

	const overview = (
		<>
			{view.description && (
				<p className="m-0 text-[15px] md:text-[19px] leading-[1.55] md:leading-[1.6] font-medium text-fg2 md:text-fg max-w-[760px] text-pretty">
					{view.description}
				</p>
			)}
			<FactGrid
				facts={[
					{ label: 'Regia', value: view.director },
					{ label: 'Sceneggiatura', value: view.screenplay },
					{ label: 'Paese', value: view.country },
					{ label: 'Lingua', value: view.language },
					{ label: 'Budget', value: view.budget },
					{ label: 'Incassi', value: view.revenue },
				]}
			/>
			{view.actors.length > 0 && (
				<div>
					<h3 className="m-0 mb-3.5 text-[18px] md:text-[20px] font-bold">Cast principale</h3>
					<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(110px,1fr))] gap-4">
						{view.actors.slice(0, 12).map((actor, i) => (
							<PersonCard
								key={`${actor.id ?? actor.name}-${i}`}
								personId={actor.id}
								name={actor.name}
								role={actor.character || ''}
								profilePath={actor.profilePath}
								size={88}
							/>
						))}
					</div>
				</div>
			)}
		</>
	);

	const tabs: DetailTab[] = [{ key: 'overview', label: 'Panoramica', content: overview }];
	if (view.awards) {
		tabs.push({
			key: 'awards',
			label: 'Premi',
			content: <AwardsSection awards={view.awards} imdbId={view.imdbId} tmdbId={view.tmdbId} lang={lang} />,
		});
	}
	if (view.tmdbId) {
		tabs.push({ key: 'reviews', label: 'Recensioni', content: <ReviewList reviews={reviews.results} /> });
	}
	if (similar.length) {
		tabs.push({ key: 'similar', label: 'Simili', content: <PosterGrid items={similar} /> });
	}

	return (
		<>
			<HistoryTracker id={view.tmdbId ?? id} title={view.title} poster={view.poster} type="movie" />

			<DetailHero
				variant="movie"
				backdrop={view.backdrop}
				back={<BackButton fallbackHref="/catalogo/trending?type=movie" variant="pill" />}
				mobileBack={<BackButton fallbackHref="/esplora" variant="round" />}
				title={view.title}
				mobileMeta={[year, runtime, view.genres[0]].filter(Boolean).join(' · ')}
				chips={['Film', year, runtime, view.genres[0], view.director].filter(Boolean) as string[]}
				actions={
					view.tmdbId ? (
						<HeroActions
							variant="hero"
							mediaType="movie"
							mediaId={view.tmdbId}
							title={view.title}
							poster={view.poster}
							trailerUrl={trailerUrl}
						/>
					) : null
				}
				ratings={<RatingTiles ratings={ratings} variant="hero" />}
			/>

			<DetailTabs
				tabs={tabs}
				mobileIntro={
					<>
						<RatingTiles ratings={ratings} variant="cards" />
						{view.tmdbId && (
							<HeroActions
								variant="mobile"
								mediaType="movie"
								mediaId={view.tmdbId}
								title={view.title}
								poster={view.poster}
								trailerUrl={trailerUrl}
							/>
						)}
						{streaming && (
							<a
								href={watchProviders?.link || '#'}
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-3 p-3 rounded-[16px] bg-card border border-line"
							>
								{streaming.logo ? (
									<img src={streaming.logo} alt="" className="w-[38px] h-[38px] rounded-[10px] object-cover" />
								) : (
									<span className="w-[38px] h-[38px] rounded-[10px] bg-ph1" />
								)}
								<span className="flex-1 flex flex-col min-w-0">
									<span className="text-[14px] font-bold">Guarda su {streaming.name}</span>
									<span className="text-[12px] font-semibold text-fg3 truncate">
										Incluso{streaming.others.length ? ` · anche su ${streaming.others.join(', ')}` : ''}
									</span>
								</span>
								<ArrowUpRight size={18} className="text-fg3" />
							</a>
						)}
					</>
				}
				aside={
					<WhereToWatch providers={watchProviders} title="Dove guardarlo">
						{view.tmdbId && (
							<UserRating mediaType="movie" mediaId={view.tmdbId} title={view.title} poster={view.poster} />
						)}
					</WhereToWatch>
				}
			/>
		</>
	);
}
