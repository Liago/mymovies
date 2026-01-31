'use client';

import { Award, Trophy, Star, Sparkles } from 'lucide-react';

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

	// Match "Won X Oscars" or "Nominated for X Oscars"
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

	// Match Golden Globe
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

	// Match BAFTA
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

	// Match Emmy (for TV shows)
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

	// Match total wins and nominations
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

// Golden Globe icon
function GoldenGlobeIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 36" fill="currentColor" className={className}>
			<circle cx="12" cy="10" r="9" strokeWidth="1.5" stroke="currentColor" fill="none" />
			<ellipse cx="12" cy="10" rx="9" ry="3" strokeWidth="1" stroke="currentColor" fill="none" />
			<path d="M12 1v18" strokeWidth="1" stroke="currentColor" fill="none" />
			<path d="M10 19h4v6h-4v-6z" />
			<ellipse cx="12" cy="27" rx="3" ry="1" />
			<path d="M8 27h8v3c0 1-1.5 2-4 2s-4-1-4-2v-3z" />
		</svg>
	);
}

// BAFTA mask icon
function BaftaIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 28" fill="currentColor" className={className}>
			<path d="M12 2C6 2 2 7 2 12c0 6 4 12 10 14 6-2 10-8 10-14 0-5-4-10-10-10z" />
			<circle cx="8" cy="11" r="2" fill="black" />
			<circle cx="16" cy="11" r="2" fill="black" />
			<path d="M8 18c2 2 6 2 8 0" stroke="black" strokeWidth="1.5" fill="none" />
		</svg>
	);
}

// Emmy icon
function EmmyIcon({ className }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 36" fill="currentColor" className={className}>
			<ellipse cx="12" cy="4" rx="2" ry="2" />
			<path d="M10 6h4l1 2h-6l1-2z" />
			<path d="M9 8h6v3h-6v-3z" />
			<path d="M3 11c0-1 1-2 2-2h14c1 0 2 1 2 2l-2 4c-1 2-3 3-7 3s-6-1-7-3l-2-4z" />
			<path d="M8 18h8c0 2-2 3-4 3s-4-1-4-3z" />
			<path d="M11 21h2v6h-2v-6z" />
			<ellipse cx="12" cy="29" rx="4" ry="2" />
			<path d="M7 29h10v2c0 1-2 2-5 2s-5-1-5-2v-2z" />
		</svg>
	);
}

interface AwardBadgeProps {
	award: AwardInfo;
	index: number;
}

function AwardBadge({ award, index }: AwardBadgeProps) {
	const getAwardStyles = () => {
		switch (award.type) {
			case 'oscar':
				return {
					bg: award.status === 'won'
						? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600'
						: 'bg-gradient-to-br from-amber-400/20 via-yellow-500/20 to-amber-600/20',
					border: award.status === 'won' ? 'border-amber-300/50' : 'border-amber-400/30',
					text: award.status === 'won' ? 'text-amber-900' : 'text-amber-400',
					iconColor: award.status === 'won' ? 'text-amber-800' : 'text-amber-400',
					glow: award.status === 'won' ? 'shadow-lg shadow-amber-500/30' : '',
					icon: <OscarIcon className="w-5 h-8" />
				};
			case 'golden_globe':
				return {
					bg: award.status === 'won'
						? 'bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500'
						: 'bg-gradient-to-br from-yellow-300/20 via-amber-400/20 to-yellow-500/20',
					border: award.status === 'won' ? 'border-yellow-200/50' : 'border-yellow-400/30',
					text: award.status === 'won' ? 'text-yellow-900' : 'text-yellow-400',
					iconColor: award.status === 'won' ? 'text-yellow-800' : 'text-yellow-400',
					glow: award.status === 'won' ? 'shadow-lg shadow-yellow-500/30' : '',
					icon: <GoldenGlobeIcon className="w-5 h-7" />
				};
			case 'bafta':
				return {
					bg: award.status === 'won'
						? 'bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600'
						: 'bg-gradient-to-br from-orange-400/20 via-amber-500/20 to-orange-600/20',
					border: award.status === 'won' ? 'border-orange-300/50' : 'border-orange-400/30',
					text: award.status === 'won' ? 'text-orange-900' : 'text-orange-400',
					iconColor: award.status === 'won' ? 'text-orange-800' : 'text-orange-400',
					glow: award.status === 'won' ? 'shadow-lg shadow-orange-500/30' : '',
					icon: <BaftaIcon className="w-5 h-6" />
				};
			case 'emmy':
				return {
					bg: award.status === 'won'
						? 'bg-gradient-to-br from-rose-400 via-pink-500 to-rose-600'
						: 'bg-gradient-to-br from-rose-400/20 via-pink-500/20 to-rose-600/20',
					border: award.status === 'won' ? 'border-rose-300/50' : 'border-rose-400/30',
					text: award.status === 'won' ? 'text-rose-900' : 'text-rose-400',
					iconColor: award.status === 'won' ? 'text-rose-800' : 'text-rose-400',
					glow: award.status === 'won' ? 'shadow-lg shadow-rose-500/30' : '',
					icon: <EmmyIcon className="w-5 h-7" />
				};
			default:
				return {
					bg: 'bg-zinc-800',
					border: 'border-zinc-700',
					text: 'text-zinc-300',
					iconColor: 'text-zinc-400',
					glow: '',
					icon: <Trophy className="w-5 h-5" />
				};
		}
	};

	const styles = getAwardStyles();

	return (
		<div
			className={`
				relative flex items-center gap-3 px-4 py-3 rounded-xl border
				${styles.bg} ${styles.border} ${styles.glow}
				transform transition-all duration-300 hover:scale-105
				animate-fade-in
			`}
			style={{ animationDelay: `${index * 100}ms` }}
		>
			{/* Icon */}
			<div className={`${styles.iconColor} flex-shrink-0`}>
				{styles.icon}
			</div>

			{/* Content */}
			<div className="flex flex-col">
				<span className={`text-2xl font-bold ${styles.text}`}>
					{award.count}
				</span>
				<span className={`text-xs font-semibold uppercase tracking-wide ${styles.text} opacity-80`}>
					{award.status === 'won' ? award.label : award.label}
				</span>
			</div>

			{/* Won badge */}
			{award.status === 'won' && (
				<div className="absolute -top-1 -right-1">
					<div className="relative">
						<div className="absolute inset-0 bg-green-400 rounded-full blur-sm opacity-50" />
						<div className="relative bg-green-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase">
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
	lang?: string;
}

export default function AwardsSection({ awards, lang = 'it-IT' }: AwardsSectionProps) {
	if (!awards || awards === 'N/A') return null;

	const parsed = parseAwardsString(awards);
	const hasMajorAwards = parsed.majorAwards.length > 0;
	const hasStats = parsed.totalWins > 0 || parsed.totalNominations > 0;

	const isItalian = lang.startsWith('it');

	return (
		<div className="border-t border-white/10 pt-8">
			<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
				<Trophy size={16} className="text-amber-500" />
				{isItalian ? 'Premi & Riconoscimenti' : 'Awards & Recognition'}
			</h2>

			{/* Major Awards Grid */}
			{hasMajorAwards && (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
					{parsed.majorAwards.map((award, index) => (
						<AwardBadge key={`${award.type}-${award.status}`} award={award} index={index} />
					))}
				</div>
			)}

			{/* Stats Section */}
			{hasStats && (
				<div className="flex flex-wrap items-center gap-6 mt-6">
					{/* Total Wins */}
					{parsed.totalWins > 0 && (
						<div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
							<div className="relative">
								<div className="absolute inset-0 bg-emerald-400 rounded-full blur-md opacity-30" />
								<Trophy size={20} className="relative text-emerald-400" />
							</div>
							<div className="flex flex-col">
								<span className="text-2xl font-bold text-emerald-400">{parsed.totalWins}</span>
								<span className="text-xs font-medium text-emerald-400/70 uppercase tracking-wide">
									{isItalian ? 'Vittorie Totali' : 'Total Wins'}
								</span>
							</div>
						</div>
					)}

					{/* Total Nominations */}
					{parsed.totalNominations > 0 && (
						<div className="flex items-center gap-3 px-4 py-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
							<div className="relative">
								<div className="absolute inset-0 bg-violet-400 rounded-full blur-md opacity-30" />
								<Star size={20} className="relative text-violet-400" />
							</div>
							<div className="flex flex-col">
								<span className="text-2xl font-bold text-violet-400">{parsed.totalNominations}</span>
								<span className="text-xs font-medium text-violet-400/70 uppercase tracking-wide">
									{isItalian ? 'Nomination Totali' : 'Total Nominations'}
								</span>
							</div>
						</div>
					)}
				</div>
			)}

			{/* Fallback: Raw text if no structured data was parsed */}
			{!hasMajorAwards && !hasStats && (
				<div className="flex items-start gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
					<Award size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
					<p className="text-zinc-300 leading-relaxed">{awards}</p>
				</div>
			)}
		</div>
	);
}
