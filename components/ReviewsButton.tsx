'use client';

import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import ReviewsModal from './ReviewsModal';

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

interface ReviewsButtonProps {
	reviews: Review[];
	title: string;
	count?: number;
}

export default function ReviewsButton({ reviews, title, count }: ReviewsButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const reviewCount = count || reviews.length;

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="flex items-center gap-3 bg-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20"
			>
				<MessageSquare size={20} />
				<span>Recensioni</span>
				{reviewCount > 0 && (
					<span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold border border-purple-500/30">
						{reviewCount}
					</span>
				)}
			</button>

			<ReviewsModal
				isOpen={isOpen}
				onClose={() => setIsOpen(false)}
				reviews={reviews}
				title={title}
			/>
		</>
	);
}
