'use client';

import { X, Star, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface Review {
	id: string;
	author: string;
	authorDetails: {
		name: string;
		username?: string;
		avatarPath?: string;
		rating?: number;
	};
	content: string;
	createdAt: string;
	updatedAt: string;
	url: string;
}

interface ReviewsModalProps {
	isOpen: boolean;
	onClose: () => void;
	reviews: Review[];
	title: string;
}

export default function ReviewsModal({ isOpen, onClose, reviews, title }: ReviewsModalProps) {
	const [mounted, setMounted] = useState(false);
	const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

	useEffect(() => {
		setMounted(true);
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	const toggleReview = (reviewId: string) => {
		setExpandedReviews(prev => {
			const newSet = new Set(prev);
			if (newSet.has(reviewId)) {
				newSet.delete(reviewId);
			} else {
				newSet.add(reviewId);
			}
			return newSet;
		});
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('it-IT', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const getAvatarUrl = (avatarPath?: string) => {
		if (!avatarPath) return null;
		// Handle gravatar URLs that start with /
		if (avatarPath.startsWith('/https://')) {
			return avatarPath.substring(1);
		}
		if (avatarPath.startsWith('/')) {
			return `https://image.tmdb.org/t/p/w100${avatarPath}`;
		}
		return avatarPath;
	};

	if (!mounted || !isOpen) return null;

	return createPortal(
		<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
			<div className="relative w-full max-w-4xl max-h-[85vh] bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
				{/* Header */}
				<div className="sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-white/10 p-6">
					<div className="flex items-center justify-between">
						<div>
							<h2 className="text-2xl font-bold text-white">Recensioni</h2>
							<p className="text-sm text-zinc-400 mt-1">{title}</p>
						</div>
						<button
							onClick={onClose}
							className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors"
						>
							<X size={24} />
						</button>
					</div>
					<div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
						<Star size={16} className="text-yellow-500" />
						<span>{reviews.length} {reviews.length === 1 ? 'recensione' : 'recensioni'}</span>
					</div>
				</div>

				{/* Reviews Content */}
				<div className="overflow-y-auto max-h-[calc(85vh-150px)] p-6">
					{reviews.length === 0 ? (
						<div className="text-center py-16">
							<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
								<Star size={32} className="text-zinc-600" />
							</div>
							<p className="text-zinc-400 text-lg">Nessuna recensione disponibile</p>
							<p className="text-zinc-600 text-sm mt-2">Sii il primo a condividere la tua opinione!</p>
						</div>
					) : (
						<div className="space-y-6">
							{reviews.map((review) => {
								const isExpanded = expandedReviews.has(review.id);
								const contentLength = review.content.length;
								const shouldTruncate = contentLength > 500;
								const displayContent = isExpanded || !shouldTruncate
									? review.content
									: review.content.substring(0, 500) + '...';

								return (
									<div
										key={review.id}
										className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/[0.07] transition-colors"
									>
										{/* Author Info */}
										<div className="flex items-start gap-4 mb-4">
											<div className="flex-shrink-0">
												{getAvatarUrl(review.authorDetails.avatarPath) ? (
													<img
														src={getAvatarUrl(review.authorDetails.avatarPath)!}
														alt={review.authorDetails.name}
														className="w-12 h-12 rounded-full object-cover border border-white/20"
													/>
												) : (
													<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border border-white/20">
														<User size={24} className="text-white" />
													</div>
												)}
											</div>
											<div className="flex-1 min-w-0">
												<div className="flex items-center justify-between gap-2 mb-1">
													<h3 className="text-white font-semibold truncate">
														{review.authorDetails.name}
													</h3>
													{review.authorDetails.rating && (
														<div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
															<Star size={14} className="text-yellow-500 fill-yellow-500" />
															<span className="text-yellow-500 text-sm font-bold">
																{review.authorDetails.rating.toFixed(1)}
															</span>
														</div>
													)}
												</div>
												{review.authorDetails.username && (
													<p className="text-xs text-zinc-500">@{review.authorDetails.username}</p>
												)}
												<p className="text-xs text-zinc-500 mt-1">
													{formatDate(review.createdAt)}
												</p>
											</div>
										</div>

										{/* Review Content */}
										<div className="prose prose-invert prose-sm max-w-none">
											<p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
												{displayContent}
											</p>
											{shouldTruncate && (
												<button
													onClick={() => toggleReview(review.id)}
													className="text-purple-400 hover:text-purple-300 text-sm font-medium mt-2 transition-colors"
												>
													{isExpanded ? 'Mostra meno' : 'Leggi tutto'}
												</button>
											)}
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
			<div
				className="absolute inset-0 -z-10"
				onClick={onClose}
			/>
		</div>,
		document.body
	);
}
