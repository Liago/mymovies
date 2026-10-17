'use client';

import { useState } from 'react';
import { Check, CircleCheck, Heart, ListPlus, Play, Plus } from 'lucide-react';
import TrailerModal from '../TrailerModal';
import ListManagerModal from '../ListManagerModal';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useWatchlist } from '@/context/WatchlistContext';
import { useTracker } from '@/context/TrackerContext';
import { cn } from '@/lib/cn';

interface HeroActionsProps {
	mediaType: 'movie' | 'tv';
	mediaId: number;
	title: string;
	poster: string | null;
	trailerUrl: string | null;
	/** `hero`: pulsanti sull'immagine (desktop); `mobile`: riga sotto l'hero. */
	variant: 'hero' | 'mobile';
}

const heroBtn = 'h-[50px] rounded-full text-[14px] font-bold flex items-center gap-2 backdrop-blur-[12px] transition-colors duration-150';
const onImage = (active: boolean) => (active ? 'bg-acc text-accfg' : 'bg-white/[0.18] text-white hover:bg-white/25');
const mobileRound = (active: boolean) =>
	cn('w-[50px] h-[50px] shrink-0 rounded-full flex items-center justify-center transition-colors', active ? 'bg-acc text-accfg' : 'bg-bg2 text-fg');

/**
 * Azioni delle schede: Trailer · Watchlist · Preferito · Lista per i film,
 * Trailer · Nel tracker · ♥ per le serie. Stesso comportamento di prima
 * (Supabase o localStorage per gli ospiti), nuovo stile.
 */
export default function HeroActions({ mediaType, mediaId, title, poster, trailerUrl, variant }: HeroActionsProps) {
	const [trailerOpen, setTrailerOpen] = useState(false);
	const [listOpen, setListOpen] = useState(false);
	const { isLoggedIn, login } = useAuth();
	const { isFavorite, addFavorite, removeFavorite } = useFavorites();
	const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
	const { isTracked, trackShow, untrackShow } = useTracker();

	const favorite = isFavorite(mediaId, mediaType);
	const watchlist = isInWatchlist(mediaId, mediaType);
	const tracked = mediaType === 'tv' && isTracked(mediaId);
	const item = { id: mediaId, media_type: mediaType, title, poster };

	const toggleFavorite = () => (favorite ? removeFavorite(mediaId, mediaType) : addFavorite(item));
	const toggleWatchlist = () => (watchlist ? removeFromWatchlist(mediaId, mediaType) : addToWatchlist(item));
	const toggleTracked = () => (tracked ? untrackShow(mediaId) : trackShow(mediaId, { name: title, poster }));
	const openList = () => (isLoggedIn ? setListOpen(true) : login());

	const modals = (
		<>
			<TrailerModal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} youtubeUrl={trailerUrl} />
			{mediaType === 'movie' && (
				<ListManagerModal
					isOpen={listOpen}
					onClose={() => setListOpen(false)}
					mediaType={mediaType}
					mediaId={mediaId}
					title={title}
					poster={poster}
				/>
			)}
		</>
	);

	if (variant === 'mobile') {
		return (
			<div className="flex gap-2">
				{trailerUrl && (
					<button
						type="button"
						onClick={() => setTrailerOpen(true)}
						className="flex-1 h-[50px] rounded-full bg-fg text-bg text-[15px] font-bold flex items-center justify-center gap-2"
					>
						<Play size={16} />
						Trailer
					</button>
				)}
				{mediaType === 'tv' ? (
					<>
						<button type="button" onClick={toggleTracked} className={cn(mobileRound(tracked), !trailerUrl && 'flex-1 w-auto gap-2 text-[15px] font-bold')} aria-pressed={tracked} aria-label={tracked ? 'Rimuovi dal tracker' : 'Aggiungi al tracker'}>
							<CircleCheck size={19} />
							{!trailerUrl && (tracked ? 'Nel tracker' : 'Segui')}
						</button>
						<button type="button" onClick={toggleWatchlist} className={mobileRound(watchlist)} aria-pressed={watchlist} aria-label="Watchlist">
							{watchlist ? <Check size={19} /> : <Plus size={19} />}
						</button>
					</>
				) : (
					<>
						<button type="button" onClick={toggleWatchlist} className={mobileRound(watchlist)} aria-pressed={watchlist} aria-label="Watchlist">
							{watchlist ? <Check size={19} /> : <Plus size={19} />}
						</button>
						<button type="button" onClick={openList} className={mobileRound(false)} aria-label="Aggiungi a una lista">
							<ListPlus size={19} />
						</button>
					</>
				)}
				<button type="button" onClick={toggleFavorite} className={mobileRound(favorite)} aria-pressed={favorite} aria-label="Preferito">
					<Heart size={19} className={favorite ? 'fill-current' : ''} />
				</button>
				{modals}
			</div>
		);
	}

	return (
		<>
			{trailerUrl && (
				<button
					type="button"
					onClick={() => setTrailerOpen(true)}
					className="h-[50px] px-6 rounded-full bg-white text-[#111] text-[15px] font-bold flex items-center gap-2.5 transition-opacity hover:opacity-90"
				>
					<Play size={16} />
					Trailer
				</button>
			)}

			{mediaType === 'tv' ? (
				<>
					<button
						type="button"
						onClick={toggleTracked}
						aria-pressed={tracked}
						className={cn(heroBtn, 'px-[18px] text-[15px]', onImage(tracked))}
					>
						<CircleCheck size={18} />
						{tracked ? 'Nel tracker' : 'Segui serie'}
					</button>
					<button
						type="button"
						onClick={toggleWatchlist}
						aria-pressed={watchlist}
						title={watchlist ? 'In watchlist' : 'Aggiungi alla watchlist'}
						aria-label="Watchlist"
						className={cn(heroBtn, 'w-[50px] justify-center', onImage(watchlist))}
					>
						{watchlist ? <Check size={18} /> : <Plus size={18} />}
					</button>
					<button
						type="button"
						onClick={toggleFavorite}
						aria-pressed={favorite}
						title={favorite ? 'Nei preferiti' : 'Aggiungi ai preferiti'}
						aria-label="Preferito"
						className={cn(heroBtn, 'w-[50px] justify-center', onImage(favorite))}
					>
						<Heart size={18} className={favorite ? 'fill-current' : ''} />
					</button>
				</>
			) : (
				<>
					<button type="button" onClick={toggleWatchlist} aria-pressed={watchlist} className={cn(heroBtn, 'px-[18px]', onImage(watchlist))}>
						{watchlist ? <Check size={18} /> : <Plus size={18} />}
						{watchlist ? 'In watchlist' : 'Watchlist'}
					</button>
					<button type="button" onClick={toggleFavorite} aria-pressed={favorite} className={cn(heroBtn, 'px-[18px]', onImage(favorite))}>
						<Heart size={18} className={favorite ? 'fill-current' : ''} />
						Preferito
					</button>
					<button type="button" onClick={openList} className={cn(heroBtn, 'px-[18px]', onImage(false))}>
						<ListPlus size={18} />
						Lista
					</button>
				</>
			)}
			{modals}
		</>
	);
}
