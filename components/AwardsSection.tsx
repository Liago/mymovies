'use client';

import { useCallback, useEffect, useState } from 'react';
import { Award, ChevronDown, Loader2, Trophy } from 'lucide-react';
import PersonModal from './PersonModal';
import Artwork from './ui/Artwork';
import { cn } from '@/lib/cn';
import type { AwardEntry, AwardGroup, AwardRecipient, AwardsDetail, AwardedPerson } from '@/lib/awards';

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

/** Numero di voci visibili per cerimonia prima di «Mostra tutte». */
const COLLAPSED_ENTRIES = 8;

/** Riassunto OMDb («Won 2 Oscars. 159 wins & 163 nominations total») in dati strutturati. */
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
		if (won) majorAwards.push({ type: p.type, status: 'won', count: parseInt(won[1], 10) });
		if (nominated) majorAwards.push({ type: p.type, status: 'nominated', count: parseInt(nominated[1], 10) });
	}

	const totalMatch = awardsString.match(/(\d+) wins? & (\d+) nominations?/i);
	const winsOnly = awardsString.match(/(\d+) wins?/i);
	const nominationsOnly = awardsString.match(/(\d+) nominations?/i);

	return {
		majorAwards,
		totalWins: totalMatch ? parseInt(totalMatch[1], 10) : winsOnly ? parseInt(winsOnly[1], 10) : 0,
		totalNominations: totalMatch ? parseInt(totalMatch[2], 10) : nominationsOnly ? parseInt(nominationsOnly[1], 10) : 0,
	};
}

function plural(n: number, one: string, many: string) {
	return `${n} ${n === 1 ? one : many}`;
}

function profileUrl(path: string | null, size: 'w92' | 'w185' = 'w92'): string | null {
	if (!path) return null;
	return path.startsWith('http') ? path : `https://image.tmdb.org/t/p/${size}${path}`;
}

interface AwardsSectionProps {
	/** Riassunto OMDb dei premi. */
	awards: string;
	mediaType: 'movie' | 'tv';
	imdbId?: string | null;
	tmdbId?: number | null;
	title?: string;
}

type OpenPerson = (personId: number) => void;

/** Pillola con ritratto e nome di un premiato; cliccabile se la persona è su TMDB. */
function RecipientChip({ recipient, onOpen }: { recipient: AwardRecipient; onOpen: OpenPerson }) {
	const content = (
		<>
			<Artwork src={profileUrl(recipient.profilePath)} alt="" className="w-7 h-7 rounded-full shrink-0" imgClassName="object-top" />
			<span className="flex flex-col min-w-0 leading-tight">
				<span className="text-[13px] font-bold truncate">{recipient.name}</span>
				{recipient.role && <span className="text-[11px] font-medium text-fg3 truncate">{recipient.role}</span>}
			</span>
		</>
	);
	const className = 'flex items-center gap-2 max-w-full min-h-[38px] pl-1 pr-3 py-1 rounded-full bg-bg2 text-left';

	if (recipient.personId == null) return <span className={className}>{content}</span>;
	const personId = recipient.personId;
	return (
		<button type="button" onClick={() => onOpen(personId)} className={cn(className, 'transition-opacity hover:opacity-80')}>
			{content}
		</button>
	);
}

function EntryRow({ entry, onOpen }: { entry: AwardEntry; onOpen: OpenPerson }) {
	const Icon = entry.won ? Trophy : Award;
	return (
		<div className="flex flex-col gap-2.5 px-4 py-3.5 rounded-[14px] bg-card border border-line">
			<div className="flex justify-between items-start gap-3">
				<span className="flex gap-2.5 items-start min-w-0">
					<Icon size={18} className={cn('shrink-0 mt-0.5', entry.won ? 'text-acc' : 'text-fg3')} />
					<span className="flex flex-col min-w-0">
						<span className="text-[15px] font-semibold text-pretty">{entry.category}</span>
						{entry.note && <span className="text-[13px] font-medium text-fg2">{entry.note}</span>}
					</span>
				</span>
				<span className="flex flex-col items-end shrink-0">
					<span className={cn('text-[12px] font-bold whitespace-nowrap', entry.won ? 'text-acc' : 'text-fg3')}>
						{entry.won ? 'Vinto' : 'Candidatura'}
					</span>
					{entry.year && <span className="text-[12px] font-semibold text-fg3">{entry.year}</span>}
				</span>
			</div>
			{entry.recipients.length > 0 && (
				<div className="flex flex-wrap gap-1.5 pl-7">
					{entry.recipients.map((r, i) => (
						<RecipientChip key={`${r.personId ?? r.name}-${i}`} recipient={r} onOpen={onOpen} />
					))}
				</div>
			)}
		</div>
	);
}

function GroupSection({ group, onOpen }: { group: AwardGroup; onOpen: OpenPerson }) {
	const [expanded, setExpanded] = useState(false);
	const visible = expanded ? group.entries : group.entries.slice(0, COLLAPSED_ENTRIES);
	const hidden = group.entries.length - visible.length;

	return (
		<section className="flex flex-col gap-2">
			<div className="flex items-baseline justify-between gap-3 mt-2">
				<h3 className="m-0 text-[17px] md:text-[18px] font-bold">{group.name}</h3>
				<span className="text-[13px] font-semibold text-fg3 whitespace-nowrap">
					{plural(group.wins, 'vinto', 'vinti')} · {plural(group.nominations, 'candidatura', 'candidature')}
				</span>
			</div>
			{visible.map((entry, i) => (
				<EntryRow key={`${entry.category}-${entry.year}-${entry.won}-${i}`} entry={entry} onOpen={onOpen} />
			))}
			{hidden > 0 && (
				<button
					type="button"
					onClick={() => setExpanded(true)}
					className="self-start flex items-center gap-1 h-9 px-3.5 rounded-full bg-bg2 text-[13px] font-bold transition-opacity hover:opacity-80"
				>
					Mostra altre {hidden}
					<ChevronDown size={15} className="text-fg3" />
				</button>
			)}
		</section>
	);
}

function AwardedPeople({ people, onOpen }: { people: AwardedPerson[]; onOpen: OpenPerson }) {
	return (
		<section className="flex flex-col gap-3">
			<h3 className="m-0 text-[17px] md:text-[18px] font-bold">Premiati del cast e della troupe</h3>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				{people.map((p) => (
					<button
						key={p.personId}
						type="button"
						onClick={() => onOpen(p.personId)}
						className="flex items-start gap-3 p-3 rounded-[14px] bg-card border border-line text-left transition-opacity hover:opacity-80"
					>
						<Artwork src={profileUrl(p.profilePath, 'w185')} alt={p.name} className="w-12 h-12 rounded-full shrink-0" imgClassName="object-top" />
						<span className="flex flex-col min-w-0 gap-0.5">
							<span className="text-[14px] font-bold truncate">{p.name}</span>
							{p.role && <span className="text-[12px] font-medium text-fg3 truncate">{p.role}</span>}
							<span className="text-[12px] font-bold text-acc">
								{p.wins.length ? plural(p.wins.length, 'premio vinto', 'premi vinti') : 'Nessun premio vinto'} ·{' '}
								<span className="text-fg3">{plural(p.nominations, 'candidatura', 'candidature')}</span>
							</span>
							{p.wins.length > 0 && (
								<span className="text-[12px] font-medium text-fg2 line-clamp-3">{p.wins.join(' — ')}</span>
							)}
						</span>
					</button>
				))}
			</div>
		</section>
	);
}

/** Riquadri riassuntivi dal testo OMDb, mostrati in testa e come ripiego se mancano i dettagli. */
function Summary({ parsed }: { parsed: ParsedAwards }) {
	const totals =
		parsed.totalWins || parsed.totalNominations
			? `In totale ${plural(parsed.totalWins, 'vittoria', 'vittorie')} e ${plural(parsed.totalNominations, 'candidatura', 'candidature')}`
			: null;
	if (!parsed.majorAwards.length && !totals) return null;

	return (
		<div className="flex flex-col gap-2.5">
			{parsed.majorAwards.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{parsed.majorAwards.map((a) => (
						<span
							key={`${a.type}-${a.status}`}
							className={cn(
								'flex items-center gap-1.5 h-[34px] px-3 rounded-full text-[13px] font-semibold',
								a.status === 'won' ? 'bg-acc-soft text-fg' : 'bg-bg2 text-fg2'
							)}
						>
							{a.status === 'won' ? <Trophy size={14} className="text-acc" /> : <Award size={14} className="text-fg3" />}
							{AWARD_NAMES[a.type]} ·{' '}
							{a.status === 'won' ? plural(a.count, 'vinto', 'vinti') : plural(a.count, 'candidatura', 'candidature')}
						</span>
					))}
				</div>
			)}
			{totals && <span className="text-[13px] font-semibold text-fg3">{totals}</span>}
		</div>
	);
}

/** Tab «Premi»: riassunto, premiati del cast e della troupe, elenco completo per cerimonia. */
export default function AwardsSection({ awards, mediaType, imdbId, tmdbId, title }: AwardsSectionProps) {
	const params = new URLSearchParams({ type: mediaType });
	if (imdbId) params.set('imdb_id', imdbId);
	if (tmdbId) params.set('tmdb_id', String(tmdbId));
	const query = imdbId || tmdbId ? params.toString() : null;

	const [result, setResult] = useState<{ query: string; data: AwardsDetail | null } | null>(null);
	const [openPersonId, setOpenPersonId] = useState<number | null>(null);
	const closePerson = useCallback(() => setOpenPersonId(null), []);

	useEffect(() => {
		if (!query) return;
		let cancelled = false;
		fetch(`/api/awards?${query}`)
			.then((response) => (response.ok ? (response.json() as Promise<AwardsDetail>) : null))
			.then((data) => {
				if (!cancelled) setResult({ query, data });
			})
			.catch((err) => {
				console.error('[AwardsSection] Errore nel recupero dei premi:', err);
				if (!cancelled) setResult({ query, data: null });
			});
		return () => {
			cancelled = true;
		};
	}, [query]);

	if (!awards || awards === 'N/A') return null;

	const parsed = parseAwardsString(awards);
	const loading = !!query && result?.query !== query;
	const detail = !loading && result?.query === query ? result.data : null;
	const groups = detail?.groups ?? [];
	const people = detail?.people ?? [];
	const hasSummary = parsed.majorAwards.length > 0 || parsed.totalWins > 0 || parsed.totalNominations > 0;

	return (
		<div className="flex flex-col gap-5">
			<Summary parsed={parsed} />

			{loading && (
				<span className="flex items-center gap-2 text-[13px] font-semibold text-fg3">
					<Loader2 size={14} className="animate-spin" />
					Caricamento dei premi{title ? ` di ${title}` : ''}…
				</span>
			)}

			{people.length > 0 && <AwardedPeople people={people} onOpen={setOpenPersonId} />}

			{groups.map((group) => (
				<GroupSection key={group.key} group={group} onOpen={setOpenPersonId} />
			))}

			{!loading && groups.length === 0 && !hasSummary && (
				<div className="px-4 py-3.5 rounded-[14px] bg-card border border-line text-[15px] font-medium text-fg2">{awards}</div>
			)}

			{!loading && groups.length === 0 && hasSummary && (
				<p className="m-0 text-[13px] font-medium text-fg3">Il dettaglio delle singole categorie non è disponibile per questo titolo.</p>
			)}

			{groups.length > 0 && (
				<p className="m-0 text-[12px] font-medium text-fg3">
					Fonti: OMDb, Academy Awards (dataset pubblico) e Wikidata. L&apos;elenco può non essere completo.
				</p>
			)}

			<PersonModal personId={openPersonId} onClose={closePerson} />
		</div>
	);
}
