'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/format';

export interface Review {
	id: string;
	author: string;
	authorDetails?: { name?: string; rating?: number | null };
	content: string;
	createdAt?: string;
	url?: string;
}

const PREVIEW_CHARS = 420;

function ReviewCard({ review }: { review: Review }) {
	const [expanded, setExpanded] = useState(false);
	const text = review.content.replace(/\r/g, '').trim();
	const long = text.length > PREVIEW_CHARS;
	const shown = expanded || !long ? text : `${text.slice(0, PREVIEW_CHARS).trimEnd()}…`;
	const rating = review.authorDetails?.rating;

	return (
		<article className="p-[18px] rounded-[18px] bg-card border border-line flex flex-col gap-2">
			<span className="text-[14px] font-bold flex items-center gap-2 flex-wrap">
				{review.authorDetails?.name || review.author}
				{rating ? <span className="text-acc">★ {rating}</span> : null}
				{review.createdAt && <span className="text-[12px] font-semibold text-fg3">{formatDate(review.createdAt)}</span>}
			</span>
			<div className="flex flex-col gap-2.5 text-[15px] leading-[1.55] font-medium text-fg2">
				{shown.split(/\n{2,}/).map((p, i) => (
					<p key={i} className="m-0 whitespace-pre-line">
						{p}
					</p>
				))}
			</div>
			{long && (
				<button type="button" onClick={() => setExpanded((v) => !v)} className="self-start text-[13px] font-bold text-acc hover:opacity-80">
					{expanded ? 'Mostra meno' : 'Leggi tutto'}
				</button>
			)}
		</article>
	);
}

/** Recensioni TMDB: autore, voto in accento e testo espandibile. */
export default function ReviewList({ reviews }: { reviews: Review[] }) {
	if (!reviews.length) {
		return <p className="m-0 text-[15px] font-medium text-fg3">Non ci sono ancora recensioni.</p>;
	}
	return (
		<div className="flex flex-col gap-3">
			{reviews.map((r) => (
				<ReviewCard key={r.id} review={r} />
			))}
		</div>
	);
}
