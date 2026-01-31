'use client';

import { useEffect, useState } from 'react';
import { Award, Trophy, Star, ChevronDown, ChevronUp, Loader2, Crown, Medal } from 'lucide-react';

interface MovieAward {
	category: string;
	year: string;
	nominees: string[];
	won: boolean;
}

interface MovieAwardsData {
	oscarWins: MovieAward[];
	oscarNominations: MovieAward[];
	totalOscarWins: number;
	totalOscarNominations: number;
}

interface AwardInfo {
	type: 'oscar' | 'golden_globe' | 'bafta' | 'emmy' | 'other';
	status: 'won' | 'nominated';
	count: number;
	label: string;
}

interface ParsedAwards {
	majorAwards: AwardInfo[];
	totalWins: number;
	totalNominations: number;
	rawText: string;
}

// Parse OMDB awards string into structured data
function parseAwardsString(awardsString: string): ParsedAwards {
	const majorAwards: AwardInfo[] = [];
	let totalWins = 0;
	let totalNominations = 0;

	const oscarWonMatch = awardsString.match(/Won (\d+) Oscar/i);
	const oscarNominatedMatch = awardsString.match(/Nominated for (\d+) Oscar/i);

	if (oscarWonMatch) {
		majorAwards.push({
			type: 'oscar',
			status: 'won',
			count: parseInt(oscarWonMatch[1]),
			label: parseInt(oscarWonMatch[1]) === 1 ? 'Oscar' : 'Oscars'
		});
	}
	if (oscarNominatedMatch) {
		majorAwards.push({
			type: 'oscar',
			status: 'nominated',
			count: parseInt(oscarNominatedMatch[1]),
			label: parseInt(oscarNominatedMatch[1]) === 1 ? 'Oscar Nomination' : 'Oscar Nominations'
		});
	}

	const goldenGlobeWonMatch = awardsString.match(/Won (\d+) Golden Globe/i);
	const goldenGlobeNominatedMatch = awardsString.match(/Nominated for (\d+) Golden Globe/i);

	if (goldenGlobeWonMatch) {
		majorAwards.push({
			type: 'golden_globe',
			status: 'won',
			count: parseInt(goldenGlobeWonMatch[1]),
			label: parseInt(goldenGlobeWonMatch[1]) === 1 ? 'Golden Globe' : 'Golden Globes'
		});
	}
	if (goldenGlobeNominatedMatch) {
		majorAwards.push({
			type: 'golden_globe',
			status: 'nominated',
			count: parseInt(goldenGlobeNominatedMatch[1]),
			label: parseInt(goldenGlobeNominatedMatch[1]) === 1 ? 'Golden Globe Nomination' : 'Golden Globe Nominations'
		});
	}

	const baftaWonMatch = awardsString.match(/Won (\d+) BAFTA/i);
	const baftaNominatedMatch = awardsString.match(/Nominated for (\d+) BAFTA/i);

	if (baftaWonMatch) {
		majorAwards.push({
			type: 'bafta',
			status: 'won',
			count: parseInt(baftaWonMatch[1]),
			label: parseInt(baftaWonMatch[1]) === 1 ? 'BAFTA' : 'BAFTAs'
		});
	}
	if (baftaNominatedMatch) {
		majorAwards.push({
			type: 'bafta',
			status: 'nominated',
			count: parseInt(baftaNominatedMatch[1]),
			label: parseInt(baftaNominatedMatch[1]) === 1 ? 'BAFTA Nomination' : 'BAFTA Nominations'
		});
	}

	const emmyWonMatch = awardsString.match(/Won (\d+) (?:Primetime )?Emmy/i);
	const emmyNominatedMatch = awardsString.match(/Nominated for (\d+) (?:Primetime )?Emmy/i);

	if (emmyWonMatch) {
		majorAwards.push({
			type: 'emmy',
			status: 'won',
			count: parseInt(emmyWonMatch[1]),
			label: parseInt(emmyWonMatch[1]) === 1 ? 'Emmy' : 'Emmys'
		});
	}
	if (emmyNominatedMatch) {
		majorAwards.push({
			type: 'emmy',
			status: 'nominated',
			count: parseInt(emmyNominatedMatch[1]),
			label: parseInt(emmyNominatedMatch[1]) === 1 ? 'Emmy Nomination' : 'Emmy Nominations'
		});
	}

	const totalMatch = awardsString.match(/(\d+) wins? & (\d+) nominations?/i);
	if (totalMatch) {
		totalWins = parseInt(totalMatch[1]);
		totalNominations = parseInt(totalMatch[2]);
	}

	return {
		majorAwards,
		totalWins,
		totalNominations,
		rawText: awardsString
	};
}

// Oscar statuette SVG icon
function OscarIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 40" fill="currentColor" className={className}>
			<ellipse cx="12" cy="3" rx="3" ry="3" />
			<path d="M8 6h8l1 4h-10l1-4z" />
			<path d="M7 10h10v4c0 1-1 2-2 2h-1v12h-4v-12h-1c-1 0-2-1-2-2v-4z" />
			<path d="M10 28h4v2h-4v-2z" />
			<ellipse cx="12" cy="32" rx="4" ry="2" />
			<path d="M7 32h10v3c0 1-2 3-5 3s-5-2-5-3v-3z" />
			<path d="M5 10c-1 0-2 1-2 2s1 2 2 2h2v-4h-2z" />
			<path d="M19 10c1 0 2 1 2 2s-1 2-2 2h-2v-4h2z" />
		</svg>
	);
}

// Category display names
const CATEGORY_DISPLAY: Record<string, { name: string; nameIt: string; icon: string }> = {
	'PICTURE': { name: 'Best Picture', nameIt: 'Miglior Film', icon: '🎬' },
	'BEST PICTURE': { name: 'Best Picture', nameIt: 'Miglior Film', icon: '🎬' },
	'DIRECTING': { name: 'Best Director', nameIt: 'Miglior Regia', icon: '🎥' },
	'BEST DIRECTOR': { name: 'Best Director', nameIt: 'Miglior Regia', icon: '🎥' },
	'ACTOR IN A LEADING ROLE': { name: 'Best Actor', nameIt: 'Miglior Attore', icon: '🎭' },
	'ACTRESS IN A LEADING ROLE': { name: 'Best Actress', nameIt: 'Miglior Attrice', icon: '🎭' },
	'ACTOR IN A SUPPORTING ROLE': { name: 'Best Supporting Actor', nameIt: 'Miglior Attore Non Protagonista', icon: '🎭' },
	'ACTRESS IN A SUPPORTING ROLE': { name: 'Best Supporting Actress', nameIt: 'Miglior Attrice Non Protagonista', icon: '🎭' },
	'WRITING (ORIGINAL SCREENPLAY)': { name: 'Best Original Screenplay', nameIt: 'Miglior Sceneggiatura Originale', icon: '✍️' },
	'WRITING (ADAPTED SCREENPLAY)': { name: 'Best Adapted Screenplay', nameIt: 'Miglior Sceneggiatura Non Originale', icon: '✍️' },
	'CINEMATOGRAPHY': { name: 'Best Cinematography', nameIt: 'Miglior Fotografia', icon: '📷' },
	'FILM EDITING': { name: 'Best Film Editing', nameIt: 'Miglior Montaggio', icon: '✂️' },
	'MUSIC (ORIGINAL SCORE)': { name: 'Best Original Score', nameIt: 'Miglior Colonna Sonora', icon: '🎵' },
	'MUSIC (ORIGINAL SONG)': { name: 'Best Original Song', nameIt: 'Miglior Canzone', icon: '🎤' },
	'SOUND': { name: 'Best Sound', nameIt: 'Miglior Sonoro', icon: '🔊' },
	'SOUND EDITING': { name: 'Best Sound Editing', nameIt: 'Miglior Montaggio Sonoro', icon: '🔊' },
	'SOUND MIXING': { name: 'Best Sound Mixing', nameIt: 'Miglior Missaggio Sonoro', icon: '🔊' },
	'PRODUCTION DESIGN': { name: 'Best Production Design', nameIt: 'Miglior Scenografia', icon: '🏛️' },
	'ART DIRECTION': { name: 'Best Art Direction', nameIt: 'Miglior Direzione Artistica', icon: '🏛️' },
	'COSTUME DESIGN': { name: 'Best Costume Design', nameIt: 'Migliori Costumi', icon: '👗' },
	'MAKEUP AND HAIRSTYLING': { name: 'Best Makeup', nameIt: 'Miglior Trucco', icon: '💄' },
	'MAKEUP': { name: 'Best Makeup', nameIt: 'Miglior Trucco', icon: '💄' },
	'VISUAL EFFECTS': { name: 'Best Visual Effects', nameIt: 'Migliori Effetti Speciali', icon: '✨' },
	'ANIMATED FEATURE FILM': { name: 'Best Animated Feature', nameIt: 'Miglior Film d\'Animazione', icon: '🎨' },
	'INTERNATIONAL FEATURE FILM': { name: 'Best International Film', nameIt: 'Miglior Film Straniero', icon: '🌍' },
	'FOREIGN LANGUAGE FILM': { name: 'Best Foreign Language Film', nameIt: 'Miglior Film Straniero', icon: '🌍' },
	'DOCUMENTARY (FEATURE)': { name: 'Best Documentary', nameIt: 'Miglior Documentario', icon: '📹' },
};

function getDisplayCategory(category: string, isItalian: boolean): string {
	const upperCategory = category.toUpperCase();
	const display = CATEGORY_DISPLAY[upperCategory];
	if (display) {
		return isItalian ? display.nameIt : display.name;
	}
	// Format unknown categories
	return category.split(' ').map(word =>
		word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
	).join(' ');
}

function getCategoryIcon(category: string): string {
	const upperCategory = category.toUpperCase();
	return CATEGORY_DISPLAY[upperCategory]?.icon || '🏆';
}

// Detailed Oscar Award Card
function OscarAwardCard({ award, index, isItalian }: { award: MovieAward; index: number; isItalian: boolean }) {
	return (
		<div
			className={`
				group relative overflow-hidden rounded-xl border transition-all duration-300
				${award.won
					? 'bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-600/20 border-amber-500/40 hover:border-amber-400/60'
					: 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
				}
			`}
			style={{ animationDelay: `${index * 50}ms` }}
		>
			{/* Glow effect for wins */}
			{award.won && (
				<div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
			)}

			<div className="relative p-4">
				<div className="flex items-start gap-3">
					{/* Icon and Status */}
					<div className={`
						flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg
						${award.won
							? 'bg-gradient-to-br from-amber-400 to-yellow-600 shadow-lg shadow-amber-500/30'
							: 'bg-zinc-800 border border-zinc-700'
						}
					`}>
						{award.won ? (
							<OscarIcon className="w-4 h-6 text-amber-900" />
						) : (
							<span className="text-base">{getCategoryIcon(award.category)}</span>
						)}
					</div>

					{/* Content */}
					<div className="flex-1 min-w-0">
						<div className="flex items-center gap-2 mb-1">
							<h4 className={`font-semibold text-sm ${award.won ? 'text-amber-200' : 'text-zinc-200'}`}>
								{getDisplayCategory(award.category, isItalian)}
							</h4>
							{award.won && (
								<span className="px-1.5 py-0.5 bg-amber-500 text-amber-950 text-[10px] font-bold rounded uppercase">
									{isItalian ? 'Vinto' : 'Won'}
								</span>
							)}
						</div>

						{/* Nominees */}
						{award.nominees && award.nominees.length > 0 && (
							<p className="text-xs text-zinc-400 truncate">
								{award.nominees.join(', ')}
							</p>
						)}

						{/* Year */}
						<p className="text-[10px] text-zinc-500 mt-1 font-medium">
							{award.year.includes('/') ? `${award.year} Ceremony` : `${award.year}`}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

// Summary badge for major awards
function MajorAwardBadge({ award, index }: { award: AwardInfo; index: number }) {
	const isWon = award.status === 'won';

	return (
		<div
			className={`
				relative flex items-center gap-3 px-4 py-3 rounded-xl border
				transition-all duration-300 hover:scale-[1.02]
				${isWon
					? 'bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-amber-600/30 border-amber-400/50 shadow-lg shadow-amber-500/20'
					: 'bg-amber-500/10 border-amber-500/30'
				}
			`}
			style={{ animationDelay: `${index * 100}ms` }}
		>
			<div className={`${isWon ? 'text-amber-400' : 'text-amber-500/70'}`}>
				<OscarIcon className="w-6 h-10" />
			</div>

			<div className="flex flex-col">
				<span className={`text-2xl font-bold ${isWon ? 'text-amber-300' : 'text-amber-400/80'}`}>
					{award.count}
				</span>
				<span className={`text-xs font-semibold uppercase tracking-wide ${isWon ? 'text-amber-400/90' : 'text-amber-500/60'}`}>
					{award.label}
				</span>
			</div>

			{isWon && (
				<div className="absolute -top-1 -right-1">
					<div className="relative">
						<div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-50" />
						<div className="relative bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase flex items-center gap-0.5">
							<Crown size={8} />
							Won
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

interface AwardsSectionProps {
	awards: string;
	imdbId?: string | null;
	tmdbId?: number | null;
	lang?: string;
}

export default function AwardsSection({ awards, imdbId, tmdbId, lang = 'it-IT' }: AwardsSectionProps) {
	const [oscarDetails, setOscarDetails] = useState<MovieAwardsData | null>(null);
	const [loading, setLoading] = useState(false);
	const [expanded, setExpanded] = useState(false);
	const [error, setError] = useState(false);

	const isItalian = lang.startsWith('it');
	const parsed = parseAwardsString(awards || '');
	const hasOscarMention = awards?.toLowerCase().includes('oscar');

	// Fetch detailed Oscar data
	useEffect(() => {
		async function fetchOscarData() {
			if (!imdbId && !tmdbId) return;
			if (!hasOscarMention) return;

			setLoading(true);
			setError(false);

			try {
				const params = new URLSearchParams();
				if (imdbId) params.set('imdb_id', imdbId);
				else if (tmdbId) params.set('tmdb_id', tmdbId.toString());

				const response = await fetch(`/api/awards?${params.toString()}`);
				if (response.ok) {
					const data = await response.json();
					if (data.totalOscarNominations > 0) {
						setOscarDetails(data);
					}
				}
			} catch (err) {
				console.error('[AwardsSection] Error fetching Oscar data:', err);
				setError(true);
			} finally {
				setLoading(false);
			}
		}

		fetchOscarData();
	}, [imdbId, tmdbId, hasOscarMention]);

	if (!awards || awards === 'N/A') return null;

	const hasMajorAwards = parsed.majorAwards.length > 0;
	const hasStats = parsed.totalWins > 0 || parsed.totalNominations > 0;
	const hasOscarDetails = oscarDetails && oscarDetails.totalOscarNominations > 0;

	return (
		<div className="border-t border-white/10 pt-8">
			<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
				<Trophy size={16} className="text-amber-500" />
				{isItalian ? 'Premi & Riconoscimenti' : 'Awards & Recognition'}
			</h2>

			{/* Summary badges for Oscar mentions */}
			{hasMajorAwards && (
				<div className="flex flex-wrap gap-4 mb-6">
					{parsed.majorAwards.filter(a => a.type === 'oscar').map((award, index) => (
						<MajorAwardBadge key={`${award.type}-${award.status}`} award={award} index={index} />
					))}
				</div>
			)}

			{/* Detailed Oscar nominations */}
			{loading && (
				<div className="flex items-center gap-2 text-zinc-400 py-4">
					<Loader2 className="w-4 h-4 animate-spin" />
					<span className="text-sm">{isItalian ? 'Caricamento dettagli Oscar...' : 'Loading Oscar details...'}</span>
				</div>
			)}

			{hasOscarDetails && !loading && (
				<div className="mb-6">
					{/* Oscar Wins */}
					{oscarDetails.oscarWins.length > 0 && (
						<div className="mb-4">
							<h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
								<Crown size={14} />
								{isItalian ? 'Oscar Vinti' : 'Oscar Wins'} ({oscarDetails.oscarWins.length})
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{oscarDetails.oscarWins.map((award, index) => (
									<OscarAwardCard key={`win-${index}`} award={award} index={index} isItalian={isItalian} />
								))}
							</div>
						</div>
					)}

					{/* Oscar Nominations (collapsible) */}
					{oscarDetails.oscarNominations.length > 0 && (
						<div>
							<button
								onClick={() => setExpanded(!expanded)}
								className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2 hover:text-zinc-300 transition-colors"
							>
								<Medal size={14} />
								{isItalian ? 'Altre Nomination' : 'Other Nominations'} ({oscarDetails.oscarNominations.length})
								{expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
							</button>

							{expanded && (
								<div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
									{oscarDetails.oscarNominations.map((award, index) => (
										<OscarAwardCard key={`nom-${index}`} award={award} index={index} isItalian={isItalian} />
									))}
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* Non-Oscar major awards */}
			{hasMajorAwards && (
				<div className="flex flex-wrap gap-4 mb-6">
					{parsed.majorAwards.filter(a => a.type !== 'oscar').map((award, index) => (
						<div
							key={`${award.type}-${award.status}`}
							className={`
								flex items-center gap-3 px-4 py-3 rounded-xl border
								${award.status === 'won'
									? 'bg-yellow-500/20 border-yellow-500/40'
									: 'bg-yellow-500/10 border-yellow-500/20'
								}
							`}
						>
							<Award className={`w-5 h-5 ${award.status === 'won' ? 'text-yellow-400' : 'text-yellow-500/70'}`} />
							<div className="flex flex-col">
								<span className={`text-xl font-bold ${award.status === 'won' ? 'text-yellow-300' : 'text-yellow-400/80'}`}>
									{award.count}
								</span>
								<span className="text-xs font-semibold text-yellow-400/70 uppercase tracking-wide">
									{award.label}
								</span>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Total Stats */}
			{hasStats && (
				<div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/5">
					{parsed.totalWins > 0 && (
						<div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
							<Trophy size={16} className="text-emerald-400" />
							<div className="flex items-baseline gap-1">
								<span className="text-lg font-bold text-emerald-400">{parsed.totalWins}</span>
								<span className="text-xs text-emerald-400/70 uppercase">
									{isItalian ? 'Vittorie' : 'Wins'}
								</span>
							</div>
						</div>
					)}
					{parsed.totalNominations > 0 && (
						<div className="flex items-center gap-2 px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-lg">
							<Star size={16} className="text-violet-400" />
							<div className="flex items-baseline gap-1">
								<span className="text-lg font-bold text-violet-400">{parsed.totalNominations}</span>
								<span className="text-xs text-violet-400/70 uppercase">
									{isItalian ? 'Nomination' : 'Nominations'}
								</span>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Fallback if no structured data */}
			{!hasMajorAwards && !hasStats && !hasOscarDetails && (
				<div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
					<Award size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
					<p className="text-zinc-300 leading-relaxed">{awards}</p>
				</div>
			)}
		</div>
	);
}
