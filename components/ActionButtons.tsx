'use client';

import { useState, useEffect } from 'react';
import { Heart, Bookmark, Star, Plus, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { actionAddToWatchlist, actionMarkAsFavorite, actionRateMedia, actionDeleteRating } from '@/app/actions';
import { useRouter } from 'next/navigation';
import ListManagerModal from './ListManagerModal';

interface ActionButtonsProps {
	mediaType: 'movie' | 'tv';
	mediaId: number;
	initialState?: {
		favorite: boolean;
		watchlist: boolean;
		rated: boolean | { value: number };
	} | null;
	className?: string;
	showText?: boolean;
	showRating?: boolean;
}

export default function ActionButtons({ mediaType, mediaId, initialState, className = '', showText = false, showRating = true }: ActionButtonsProps) {
	const { isLoggedIn, login } = useAuth();
	const router = useRouter();

	const [isFavorite, setIsFavorite] = useState(initialState?.favorite || false);
	const [isWatchlist, setIsWatchlist] = useState(initialState?.watchlist || false);
	const [rating, setRating] = useState<number | null>(
		typeof initialState?.rated === 'object' ? initialState.rated.value :
			(initialState?.rated ? 10 : null) // If boolean true, assume rated but don't know value? usually object.
	);
	const [isRatingOpen, setIsRatingOpen] = useState(false);
	const [isListModalOpen, setIsListModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Sync state if props change (re-validation)
	useEffect(() => {
		if (initialState) {
			setIsFavorite(initialState.favorite);
			setIsWatchlist(initialState.watchlist);
			setRating(typeof initialState.rated === 'object' ? initialState.rated.value : null);
		}
	}, [initialState]);

	const handleFavorite = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isLoggedIn) {
			// Trigger login flow
			await login();
			return;
		}

		// Optimistic update
		const newState = !isFavorite;
		setIsFavorite(newState);

		try {
			const success = await actionMarkAsFavorite(mediaType, mediaId, newState);
			if (!success) setIsFavorite(!newState); // Revert
		} catch (e) {
			setIsFavorite(!newState);
		}
	};

	const handleWatchlist = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isLoggedIn) {
			await login();
			return;
		}

		const newState = !isWatchlist;
		setIsWatchlist(newState);

		try {
			const success = await actionAddToWatchlist(mediaType, mediaId, newState);
			if (!success) setIsWatchlist(!newState);
		} catch (e) {
			setIsWatchlist(!newState);
		}
	};

	const handleRate = async (value: number, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isLoggedIn) {
			await login();
			return;
		}

		setIsSubmitting(true);
		// Optimistic
		const oldRating = rating;
		setRating(value);
		setIsRatingOpen(false);

		try {
			const success = await actionRateMedia(mediaType, mediaId, value);
			if (!success) setRating(oldRating);
		} catch (e) {
			setRating(oldRating);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteRating = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (!isLoggedIn) return;
		setIsSubmitting(true);
		const oldRating = rating;
		setRating(null);
		setIsRatingOpen(false);
		try {
			const success = await actionDeleteRating(mediaType, mediaId);
			if (!success) setRating(oldRating);
		} catch {
			setRating(oldRating);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleRating = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoggedIn) login();
		else setIsRatingOpen(!isRatingOpen);
	}

	const handleListClick = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (!isLoggedIn) {
			login();
			return;
		}
		setIsListModalOpen(true);
	};

	return (
		<div className={`flex items-center gap-3 ${className}`}>
			{/* Favorite */}
			<button
				onClick={handleFavorite}
				className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 group
                    ${isFavorite
						? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 ring-2 ring-pink-500 ring-offset-2 ring-offset-black'
						: 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110'
					}`}
				title={isFavorite ? "Rimuovi dai preferiti" : "Aggiungi ai preferiti"}
			>
				<Heart size={20} className={isFavorite ? "fill-current" : ""} />
				{showText && <span className="ml-2 text-sm font-medium hidden md:block">{isFavorite ? 'Preferito' : 'Aggiungi ai preferiti'}</span>}
			</button>

			{/* Watchlist */}
			<button
				onClick={handleWatchlist}
				className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 group
                    ${isWatchlist
						? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500 ring-offset-2 ring-offset-black'
						: 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110'
					}`}
				title={isWatchlist ? "Rimuovi dalla watchlist" : "Aggiungi alla watchlist"}
			>
				<Bookmark size={20} className={isWatchlist ? "fill-current" : ""} />
				{showText && <span className="ml-2 text-sm font-medium hidden md:block">{isWatchlist ? 'In Watchlist' : 'Watchlist'}</span>}
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

			{/* Rating */}
			{showRating && (
				<div className="relative">
					<button
						onClick={toggleRating}
						className={`flex items-center justify-center p-3 rounded-full transition-all duration-300 group
                        ${rating
								? 'bg-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-500 ring-offset-2 ring-offset-black'
								: 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white hover:scale-110'
							}`}
						title={rating ? `Il tuo voto: ${rating}` : "Vota"}
					>
						<Star size={20} className={rating ? "fill-current" : ""} />
						{showText && rating && <span className="ml-2 text-sm font-medium hidden md:block">{rating}</span>}
						{showText && !rating && <span className="ml-2 text-sm font-medium hidden md:block">Vota</span>}
					</button>

					{/* Rating Popover */}
					{isRatingOpen && (
						<div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 bg-gray-900 border border-white/10 rounded-xl p-3 shadow-2xl flex items-center gap-1 z-50 min-w-[320px]">
							<div className="flex items-center gap-1">
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
									<button
										key={star}
										onClick={(e) => handleRate(star, e)}
										className={`p-1 hover:scale-125 transition-transform ${(rating && star <= rating) ? 'text-amber-500' : 'text-gray-600 hover:text-amber-400'
											}`}
									>
										<Star size={24} className={(rating && star <= rating) ? "fill-current" : ""} />
									</button>
								))}
							</div>
							{rating && (
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
			/>
		</div>
	);
}
