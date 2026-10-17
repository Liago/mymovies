import { cn } from '@/lib/cn';

export interface RatingValue {
	label: string;
	value: string;
}

/** Riquadri voto: vetro sopra l'hero (desktop) o card a 3 colonne (mobile). */
export default function RatingTiles({ ratings, variant }: { ratings: RatingValue[]; variant: 'hero' | 'cards' }) {
	if (!ratings.length) return null;

	if (variant === 'hero') {
		return (
			<>
				{ratings.map((r) => (
					<div key={r.label} className="w-[92px] p-3 rounded-[16px] bg-white/[0.14] backdrop-blur-[16px] flex flex-col gap-0.5">
						<span className="text-[24px] font-extrabold tracking-[-0.02em] leading-tight">{r.value}</span>
						<span className="text-[11px] font-semibold text-white/70">{r.label}</span>
					</div>
				))}
			</>
		);
	}

	return (
		<div className={cn('grid gap-2', ratings.length >= 3 ? 'grid-cols-3' : 'grid-cols-2')}>
			{ratings.slice(0, 3).map((r) => (
				<div key={r.label} className="px-3 py-2.5 rounded-[14px] bg-card border border-line">
					<span className="block text-[20px] font-extrabold leading-tight">{r.value}</span>
					<span className="text-[11px] font-semibold text-fg3">{r.label}</span>
				</div>
			))}
		</div>
	);
}

interface RawRatings {
	imdb?: number | string | null;
	rottenTomatoes?: number | null;
	metascore?: number | null;
	tmdb?: number | null;
}

/** Converte i voti grezzi (OMDb/TMDB) nelle etichette del design. */
export function toRatingValues(rating: RawRatings | null | undefined, includeTmdb = true): RatingValue[] {
	if (!rating) return [];
	const out: RatingValue[] = [];
	const imdb = typeof rating.imdb === 'string' ? parseFloat(rating.imdb) : rating.imdb;
	if (imdb && imdb > 0) out.push({ label: 'IMDb', value: imdb.toFixed(1) });
	if (rating.rottenTomatoes != null && rating.rottenTomatoes > 0) out.push({ label: 'Rotten T.', value: `${rating.rottenTomatoes}%` });
	if (rating.metascore != null && rating.metascore > 0) out.push({ label: 'Metacritic', value: String(rating.metascore) });
	if (includeTmdb && rating.tmdb && rating.tmdb > 0) out.push({ label: 'TMDB', value: rating.tmdb.toFixed(1) });
	return out;
}
