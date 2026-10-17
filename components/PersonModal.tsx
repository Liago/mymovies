'use client';

import { useEffect, useState } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { ExternalLink, X } from 'lucide-react';
import { fetchPersonDetailsById } from '@/app/actions';
import Artwork from './ui/Artwork';
import Spinner from './Spinner';
import { formatDate, formatRating } from '@/lib/format';

interface PersonModalProps {
	personId: number | null;
	onClose: () => void;
}

interface KnownForItem {
	id: number;
	title: string;
	poster: string | null;
	year: string;
	type: 'movie' | 'tv';
	character: string;
	voteAverage: number;
}

interface PersonDetails {
	id: number;
	name: string;
	biography: string;
	birthday: string | null;
	deathday: string | null;
	placeOfBirth: string | null;
	profilePath: string | null;
	knownForDepartment: string | null;
	imdbId: string | null;
	knownFor: KnownForItem[];
}

const DEPARTMENTS: Record<string, string> = {
	Acting: 'Recitazione',
	Directing: 'Regia',
	Writing: 'Sceneggiatura',
	Production: 'Produzione',
	Sound: 'Musiche',
	Camera: 'Fotografia',
	Editing: 'Montaggio',
};

function age(birthday: string, deathday?: string | null): number {
	const birth = new Date(birthday);
	const end = deathday ? new Date(deathday) : new Date();
	let years = end.getFullYear() - birth.getFullYear();
	const m = end.getMonth() - birth.getMonth();
	if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) years--;
	return years;
}

/** Scheda persona (biografia e filmografia) in un modale. */
export default function PersonModal({ personId, onClose }: PersonModalProps) {
	const [loaded, setLoaded] = useState<{ id: number; details: PersonDetails | null } | null>(null);
	const [credits, setCredits] = useState<{ id: number | null; visible: number }>({ id: null, visible: 12 });
	const mounted = useMounted();

	useEffect(() => {
		if (!personId || loaded?.id === personId) return;
		let cancelled = false;
		fetchPersonDetailsById(personId).then((data) => {
			if (!cancelled) setLoaded({ id: personId, details: data as PersonDetails | null });
		});
		return () => {
			cancelled = true;
		};
	}, [personId, loaded?.id]);

	useEffect(() => {
		if (!personId) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		const previous = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		window.addEventListener('keydown', onKey);
		return () => {
			document.body.style.overflow = previous;
			window.removeEventListener('keydown', onKey);
		};
	}, [personId, onClose]);

	if (!mounted || !personId) return null;

	const loading = loaded?.id !== personId;
	const details = loading ? null : loaded?.details ?? null;
	// Il numero di titoli mostrati riparte da 12 per ogni persona
	const visibleCredits = credits.id === personId ? credits.visible : 12;
	const showMoreCredits = () => setCredits({ id: personId, visible: visibleCredits + 12 });
	const facts = details
		? [
			details.knownForDepartment && { k: 'Noto per', v: DEPARTMENTS[details.knownForDepartment] || details.knownForDepartment },
			details.birthday && {
				k: details.deathday ? 'Nascita' : 'Nascita · età',
				v: `${formatDate(details.birthday)}${details.deathday ? '' : ` · ${age(details.birthday)} anni`}`,
			},
			details.deathday && { k: 'Morte', v: `${formatDate(details.deathday)} · ${age(details.birthday || details.deathday, details.deathday)} anni` },
			details.placeOfBirth && { k: 'Luogo di nascita', v: details.placeOfBirth },
		].filter(Boolean) as { k: string; v: string }[]
		: [];

	return createPortal(
		<div
			className="fixed inset-0 z-[210] flex justify-center items-start p-4 pt-[max(40px,env(safe-area-inset-top))] bg-black/40 backdrop-blur-[8px] animate-fade-in"
			onClick={onClose}
			role="dialog"
			aria-modal="true"
		>
			<div
				className="w-[min(960px,100%)] max-h-[calc(100dvh-80px)] overflow-y-auto no-scrollbar bg-card text-fg border border-line rounded-[24px] shadow-modal"
				onClick={(e) => e.stopPropagation()}
			>
				{loading ? (
					<div className="flex justify-center items-center min-h-[360px]">
						<Spinner size={40} />
					</div>
				) : !details ? (
					<div className="flex flex-col items-center justify-center gap-4 min-h-[240px] p-8 text-center">
						<p className="text-[14px] font-semibold text-fg3">Impossibile caricare la scheda.</p>
						<button type="button" onClick={onClose} className="h-10 px-4 rounded-full bg-bg2 text-[13px] font-bold">
							Chiudi
						</button>
					</div>
				) : (
					<>
						<div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 md:px-6 py-4 bg-card/90 backdrop-blur border-b border-line">
							<h2 className="text-[22px] md:text-[26px] font-extrabold tracking-[-0.02em] truncate">{details.name}</h2>
							<button
								type="button"
								onClick={onClose}
								className="w-10 h-10 shrink-0 rounded-full bg-bg2 flex items-center justify-center hover:opacity-80"
								aria-label="Chiudi"
							>
								<X size={18} />
							</button>
						</div>

						<div className="p-5 md:p-6 grid gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
							<div className="flex flex-col gap-3">
								<Artwork src={details.profilePath} alt={details.name} className="aspect-[2/3] w-[140px] md:w-full rounded-[16px]" />
								<div className="grid grid-cols-1 gap-2">
									{facts.map((f) => (
										<div key={f.k} className="px-[14px] py-2.5 rounded-[14px] bg-bg2">
											<span className="block text-[12px] font-semibold text-fg3">{f.k}</span>
											<span className="text-[14px] font-bold">{f.v}</span>
										</div>
									))}
									{details.imdbId && (
										<a
											href={`https://www.imdb.com/name/${details.imdbId}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-1.5 text-[13px] font-bold text-acc hover:opacity-80"
										>
											<ExternalLink size={14} />
											Apri su IMDb
										</a>
									)}
								</div>
							</div>

							<div className="flex flex-col gap-6 min-w-0">
								{details.biography && details.biography !== 'Biography not available.' && (
									<div className="flex flex-col gap-3 text-[15px] leading-[1.6] text-fg2">
										{details.biography.split('\n\n').map((p, i) => (
											<p key={i}>{p}</p>
										))}
									</div>
								)}

								{details.knownFor.length > 0 && (
									<div className="flex flex-col gap-3.5">
										<h3 className="text-[18px] font-bold">Filmografia</h3>
										<div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-x-3.5 gap-y-5">
											{details.knownFor.slice(0, visibleCredits).map((item) => (
												<Link
													key={`${item.type}-${item.id}`}
													href={`/${item.type === 'tv' ? 'tv' : 'movie'}/${item.id}`}
													onClick={onClose}
													className="flex flex-col gap-1.5 hover:opacity-80 transition-opacity"
												>
													<Artwork src={item.poster} alt={item.title} className="aspect-[2/3] rounded-[12px]">
														{formatRating(item.voteAverage) && (
															<span className="absolute top-2 left-2 px-2 py-1 rounded-lg glass text-[10px] font-bold">
																★ {formatRating(item.voteAverage)}
															</span>
														)}
													</Artwork>
													<span className="text-[13px] font-bold line-clamp-1">{item.title}</span>
													<span className="text-[12px] font-medium text-fg3 -mt-1 line-clamp-1">
														{[item.year, item.character && item.character !== 'N/A' ? item.character : null].filter(Boolean).join(' · ')}
													</span>
												</Link>
											))}
										</div>
										{details.knownFor.length > visibleCredits && (
											<button
												type="button"
												onClick={showMoreCredits}
												className="self-center h-10 px-5 rounded-full bg-bg2 text-[13px] font-bold hover:opacity-80"
											>
												Mostra altri ({details.knownFor.length - visibleCredits})
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					</>
				)}
			</div>
		</div>,
		document.body
	);
}
