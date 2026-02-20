'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark, Star, Plus, Check, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useWatchlist } from '@/context/WatchlistContext';
import { useRatings } from '@/context/RatingsContext';
import { useTracker } from '@/context/TrackerContext';
import { useRouter } from 'next/navigation';
import ListManagerModal from './ListManagerModal';

interface ActionButtonsProps {
	mediaType: 'movie' | 'tv';
	mediaId: number | string;
	title?: string;
	poster?: string | null;
	initialState?: {
		favorite: boolean;
		watchlist: boolean;
		rated: boolean | { value: number };
	} | null;
	className?: string;
	showText?: boolean;
	showRating?: boolean;
}

export default function ActionButtons({ mediaType, mediaId, title, poster, initialState, className = '', showText = false, showRating = true }: ActionButtonsProps) {
	const { isLoggedIn, login } = useAuth();
	const router = useRouter();

	if (typeof mediaId === 'string') return null;

	// Context Hooks
	const { isFavorite, addFavorite, removeFavorite } = useFavorites();
	const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
	const { getRating, rateMedia, deleteRating: deleteContextRating } = useRatings();
	const { isTracked, trackShow, untrackShow } = useTracker();

	// Computed State from Context
	const favorite = isFavorite(Number(mediaId), mediaType);
	const watchlist = isInWatchlist(Number(mediaId), mediaType);
	const userRating = getRating(Number(mediaId), mediaType);
	const tracked = mediaType === 'tv' ? isTracked(Number(mediaId)) : false;

	// Local UI State
	const [isRatingOpen, setIsRatingOpen] = useState(false);
	const [isListModalOpen, setIsListModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleFavorite = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		// Check title/poster availability. If missing, we can try to proceed but data will be incomplete in local/db
		// For now we use fallback. Ideally parent passes them.
		const itemTitle = title || 'Unknown Title';
		const itemPoster = poster || null;

		if (favorite) {
			await removeFavorite(Number(mediaId), mediaType);
		} else {
			await addFavorite({
				id: Number(mediaId),
				media_type: mediaType,
				title: itemTitle,
				poster: itemPoster
			});
		}
	};

	const handleWatchlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		const itemTitle = title || 'Unknown Title';
		const itemPoster = poster || null;

		if (watchlist) {
			await removeFromWatchlist(Number(mediaId), mediaType);
		} else {
			await addToWatchlist({
				id: Number(mediaId),
				media_type: mediaType,
				title: itemTitle,
				poster: itemPoster
			});
		}
	};

	const handleRate = async (value: number, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setIsSubmitting(true);
		setIsRatingOpen(false);

		const itemTitle = title || 'Unknown Title';
		const itemPoster = poster || null;

		try {
			await rateMedia(
				Number(mediaId),
				mediaType,
				value,
				itemTitle,
				itemPoster
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteRating = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		setIsSubmitting(true);
		setIsRatingOpen(false);
		try {
			await deleteContextRating(Number(mediaId), mediaType);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleRating = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsRatingOpen(!isRatingOpen);
	};

	const handleListClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoggedIn) {
			login();
			return;
		}
		setIsListModalOpen(true);
	};

	const handleTrack = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoggedIn) {
			login();
			return;
		}
		if (tracked) {
			untrackShow(Number(mediaId));
		} else {
			trackShow(Number(mediaId), { name: title || 'Unknown Title', poster: poster || null });
		}
	};

	return (
		<div className={`flex items-center gap-3 ${className}`}>
			{/* Favorite */}
			<button
				onClick={handleFavorite}
				className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 group
                    ${favorite
						? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 ring-2 ring-pink-500 ring-offset-2 ring-offset-black'
						: 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110'
					}`}
				title={favorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
			>
				<Heart size={20} className={favorite ? "fill-current" : ""} />
				{showText && <span className="ml-2 text-sm font-medium hidden md:block">{favorite ? 'Preferito' : 'Aggiungi ai preferiti'}</span>}
			</button>

			{/* Watchlist */}
			<button
				onClick={handleWatchlist}
				className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 group
                    ${watchlist
						? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2 ring-offset-black'
						: 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110'
					}`}
				title={watchlist ? "Rimuovi dalla watchlist" : "Aggiungi alla watchlist"}
			>
				<Bookmark size={20} className={watchlist ? "fill-current" : ""} />
				{showText && <span className="ml-2 text-sm font-medium hidden md:block">{watchlist ? 'In Watchlist' : 'Watchlist'}</span>}
			</button>

			{/* Add to List */}
			<button
				onClick={handleListClick}
				className="flex items-center justify-center p-3 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110 transition-all duration-300 group"
				title="Aggiungi a una lista"
			>
				<Plus size={20} />
				{showText && <span className="ml-2 text-sm font-medium hidden md:block">Salva in lista</span>}
			</button>

			{/* Track TV Show (only visible for tv) */}
			{mediaType === 'tv' && (
				<button
					onClick={handleTrack}
					className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 group
						${tracked
							? 'bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 ring-offset-black'
							: 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110'
						}`}
					title={tracked ? "Smetti di seguire" : "Segui serie"}
				>
					<Bell size={20} className={tracked ? "fill-current" : ""} />
					{showText && <span className="ml-2 text-sm font-medium hidden md:block">{tracked ? 'Seguita' : 'Segui'}</span>}
				</button>
			)}

			{/* Rating */}
			{showRating && (
				<div className="relative">
					<button
						onClick={toggleRating}
						className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 group
                        ${userRating
								? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-500 ring-offset-2 ring-offset-black'
								: 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110'
							}`}
						title={userRating ? `Il tuo voto: ${userRating}` : "Vota"}
					>
						<Star size={20} className={userRating ? "fill-current" : ""} />
						{showText && userRating && <span className="ml-2 text-sm font-medium hidden md:block">{userRating}</span>}
						{showText && !userRating && <span className="ml-2 text-sm font-medium hidden md:block">Vota</span>}
					</button>

					{/* Rating Popover */}
					{isRatingOpen && (
						<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-gray-900 border border-white/10 rounded-xl p-3 shadow-2xl flex items-center gap-1 z-50 min-w-[320px]">
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
									<button
										key={star}
										onClick={(e) => handleRate(star, e)}
										className={`p-1 hover:scale-125 transition-transform ${(userRating && star <= userRating) ? 'text-amber-500' : 'text-gray-600 hover:text-amber-400'
											}`}
									>
										<Star size={24} className={(userRating && star <= userRating) ? "fill-current" : ""} />
									</button>
								))}
							</div>
							{userRating && (
								<button
									onClick={handleDeleteRating}
									className="ml-2 p-1 text-red-400 hover:text-red-300 text-xs uppercase font-bold tracking-wider"
								>
									Reset
								</button>
							)}
						</div>
					)}
				</div>
			)}

			<ListManagerModal
				isOpen={isListModalOpen}
				onClose={() => setIsListModalOpen(false)}
				mediaType={mediaType}
				mediaId={mediaId}
				title={title || 'Unknown Title'}
				poster={poster ?? null}
			/>
		</div>
	);
}
