'use client';

import { useEffect, useState } from 'react';
import { Award, Loader2, Trophy } from 'lucide-react';

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

type AwardType = 'oscar' | 'golden_globe' | 'bafta' | 'emmy';

interface AwardInfo {
	type: AwardType;
	status: 'won' | 'nominated';
	count: number;
}

interface ParsedAwards {
	majorAwards: AwardInfo[];
	totalWins: number;
	totalNominations: number;
}

const AWARD_NAMES: Record<AwardType, string> = {
	oscar: 'Oscar',
	golden_globe: 'Golden Globe',
	bafta: 'BAFTA',
	emmy: 'Emmy',
};

// Parse OMDB awards string into structured data
function parseAwardsString(awardsString: string): ParsedAwards {
	const majorAwards: AwardInfo[] = [];
	const patterns: { type: AwardType; won: RegExp; nominated: RegExp }[] = [
		{ type: 'oscar', won: /Won (\d+) Oscar/i, nominated: /Nominated for (\d+) Oscar/i },
		{ type: 'golden_globe', won: /Won (\d+) Golden Globe/i, nominated: /Nominated for (\d+) Golden Globe/i },
		{ type: 'bafta', won: /Won (\d+) BAFTA/i, nominated: /Nominated for (\d+) BAFTA/i },
		{ type: 'emmy', won: /Won (\d+) (?:Primetime )?Emmy/i, nominated: /Nominated for (\d+) (?:Primetime )?Emmy/i },
	];

	for (const p of patterns) {
		const won = awardsString.match(p.won);
		const nominated = awardsString.match(p.nominated);
		if (won) majorAwards.push({ type: p.type, status: 'won', count: parseInt(won[1]) });
		if (nominated) majorAwards.push({ type: p.type, status: 'nominated', count: parseInt(nominated[1]) });
	}

	const totalMatch = awardsString.match(/(\d+) wins? & (\d+) nominations?/i);
	const winsOnly = awardsString.match(/(\d+) wins?/i);
	const nominationsOnly = awardsString.match(/(\d+) nominations?/i);

	return {
		majorAwards,
		totalWins: totalMatch ? parseInt(totalMatch[1]) : winsOnly ? parseInt(winsOnly[1]) : 0,
		totalNominations: totalMatch ? parseInt(totalMatch[2]) : nominationsOnly ? parseInt(nominationsOnly[1]) : 0,
	};
}

// Category display names
const CATEGORY_IT: Record<string, string> = {
	'PICTURE': 'Miglior film',
	'BEST PICTURE': 'Miglior film',
	'DIRECTING': 'Miglior regia',
	'BEST DIRECTOR': 'Miglior regia',
	'ACTOR IN A LEADING ROLE': 'Miglior attore protagonista',
	'ACTRESS IN A LEADING ROLE': 'Miglior attrice protagonista',
	'ACTOR IN A SUPPORTING ROLE': 'Miglior attore non protagonista',
	'ACTRESS IN A SUPPORTING ROLE': 'Miglior attrice non protagonista',
	'WRITING (ORIGINAL SCREENPLAY)': 'Miglior sceneggiatura originale',
	'WRITING (ADAPTED SCREENPLAY)': 'Miglior sceneggiatura non originale',
	'CINEMATOGRAPHY': 'Miglior fotografia',
	'FILM EDITING': 'Miglior montaggio',
	'MUSIC (ORIGINAL SCORE)': 'Miglior colonna sonora',
	'MUSIC (ORIGINAL SONG)': 'Miglior canzone',
	'SOUND': 'Miglior sonoro',
	'SOUND EDITING': 'Miglior montaggio sonoro',
	'SOUND MIXING': 'Miglior missaggio sonoro',
	'PRODUCTION DESIGN': 'Miglior scenografia',
	'ART DIRECTION': 'Miglior direzione artistica',
	'COSTUME DESIGN': 'Migliori costumi',
	'MAKEUP AND HAIRSTYLING': 'Miglior trucco e acconciatura',
	'MAKEUP': 'Miglior trucco',
	'VISUAL EFFECTS': 'Migliori effetti visivi',
	'ANIMATED FEATURE FILM': "Miglior film d'animazione",
	'INTERNATIONAL FEATURE FILM': 'Miglior film internazionale',
	'FOREIGN LANGUAGE FILM': 'Miglior film straniero',
	'DOCUMENTARY (FEATURE)': 'Miglior documentario',
};

function displayCategory(category: string): string {
	const known = CATEGORY_IT[category.toUpperCase()];
	if (known) return known;
	const lower = category.toLowerCase();
	return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function plural(n: number, one: string, many: string) {
	return `${n} ${n === 1 ? one : many}`;
}

interface AwardsSectionProps {
	awards: string;
	imdbId?: string | null;
	tmdbId?: number | null;
	lang?: string;
	/** `list`: tab Premi dei film; `card`: riquadro con pillole delle serie. */
	variant?: 'list' | 'card';
}

function Row({ won, label, status }: { won: boolean; label: string; status: string }) {
	const Icon = won ? Trophy : Award;
	return (
		<div className="flex justify-between items-center gap-3 px-4 py-3.5 rounded-[14px] bg-card border border-line text-[15px] font-semibold">
			<span className="flex gap-2.5 items-center min-w-0">
				<Icon size={18} className={won ? 'text-acc shrink-0' : 'text-fg3 shrink-0'} />
				<span className="truncate">{label}</span>
			</span>
			<span className={`text-[12px] font-bold whitespace-nowrap ${won ? 'text-acc' : 'text-fg3'}`}>{status}</span>
		</div>
	);
}

export default function AwardsSection({ awards, imdbId, tmdbId, variant = 'list' }: AwardsSectionProps) {
	const parsed = parseAwardsString(awards || '');
	const hasOscarMention = awards?.toLowerCase().includes('oscar');
	const query = variant === 'list' && hasOscarMention && (imdbId || tmdbId)
		? imdbId ? `imdb_id=${encodeURIComponent(imdbId)}` : `tmdb_id=${tmdbId}`
		: null;
	const [result, setResult] = useState<{ query: string; data: MovieAwardsData | null } | null>(null);

	// Fetch detailed Oscar data
	useEffect(() => {
		if (!query) return;
		let cancelled = false;
		fetch(`/api/awards?${query}`)
			.then((response) => (response.ok ? response.json() : null))
			.then((data) => {
				if (!cancelled) setResult({ query, data: data?.totalOscarNominations > 0 ? data : null });
			})
			.catch((err) => {
				console.error('[AwardsSection] Error fetching Oscar data:', err);
				if (!cancelled) setResult({ query, data: null });
			});
		return () => {
			cancelled = true;
		};
	}, [query]);

	const loading = !!query && result?.query !== query;
	const oscarDetails = !loading && result ? result.data : null;

	if (!awards || awards === 'N/A') return null;

	const summaryRows = parsed.majorAwards.filter((a) => !(a.type === 'oscar' && oscarDetails));
	const totals =
		parsed.totalWins || parsed.totalNominations
			? `In totale ${plural(parsed.totalWins, 'vittoria', 'vittorie')} e ${plural(parsed.totalNominations, 'nomination', 'nomination')}`
			: null;

	if (variant === 'card') {
		const names = Array.from(new Set(parsed.majorAwards.map((a) => AWARD_NAMES[a.type])));
		const pills = parsed.majorAwards.map(
			(a) => `${AWARD_NAMES[a.type]} · ${a.status === 'won' ? plural(a.count, 'vinto', 'vinti') : plural(a.count, 'nomination', 'nomination')}`
		);
		if (totals && !pills.length) pills.push(totals);

		return (
			<div className="p-5 rounded-[20px] bg-card border border-line">
				<div className="flex justify-between items-center gap-3 mb-3">
					<h3 className="m-0 text-[18px] font-bold">Premi</h3>
					{names.length > 0 && <span className="text-[13px] font-semibold text-fg3">{names.join(' · ')}</span>}
				</div>
				{pills.length > 0 ? (
					<div className="flex flex-wrap gap-2">
						{pills.map((p) => (
							<span key={p} className="flex items-center gap-1.5 h-[34px] px-3 rounded-full bg-acc-soft text-fg text-[13px] font-semibold">
								<Trophy size={14} className="text-acc" />
								{p}
							</span>
						))}
					</div>
				) : (
					<p className="m-0 text-[14px] font-medium text-fg2">{awards}</p>
				)}
				{totals && pills[0] !== totals && <p className="mt-3 mb-0 text-[12px] font-semibold text-fg3">{totals}</p>}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-2">
			{loading && (
				<span className="flex items-center gap-2 text-[13px] font-semibold text-fg3">
					<Loader2 size={14} className="animate-spin" />
					Caricamento Oscar…
				</span>
			)}

			{oscarDetails && (
				<>
					<span className="text-[13px] font-bold text-fg3">
						Oscar · {oscarDetails.totalOscarWins} {oscarDetails.totalOscarWins === 1 ? 'vinto' : 'vinti'} su{' '}
						{oscarDetails.totalOscarNominations} nomination
					</span>
					{oscarDetails.oscarWins.map((a, i) => (
						<Row key={`w-${i}`} won label={displayCategory(a.category)} status="Vinto" />
					))}
					{oscarDetails.oscarNominations.map((a, i) => (
						<Row key={`n-${i}`} won={false} label={displayCategory(a.category)} status="Nomination" />
					))}
				</>
			)}

			{summaryRows.length > 0 && (
				<>
					<span className={`text-[13px] font-bold text-fg3 ${oscarDetails ? 'mt-4' : ''}`}>Riconoscimenti principali</span>
					{summaryRows.map((a) => (
						<Row
							key={`${a.type}-${a.status}`}
							won={a.status === 'won'}
							label={AWARD_NAMES[a.type]}
							status={a.status === 'won' ? plural(a.count, 'vinto', 'vinti') : plural(a.count, 'nomination', 'nomination')}
						/>
					))}
				</>
			)}

			{totals && <span className="mt-2 text-[13px] font-semibold text-fg3">{totals}</span>}

			{!summaryRows.length && !oscarDetails && !totals && !loading && (
				<div className="px-4 py-3.5 rounded-[14px] bg-card border border-line text-[15px] font-medium text-fg2">{awards}</div>
			)}
		</div>
	);
}
