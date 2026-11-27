import BackButton from '@/components/BackButton';
import PageHeader from '@/components/ui/PageHeader';
import PageShell from '@/components/ui/PageShell';
import CreditRow from './CreditRow';
import type { FullCredits } from '@/lib/tmdb-credits';

interface FullCreditsViewProps {
	credits: FullCredits;
	/** Pagina della scheda a cui tornare se non c'è cronologia in app. */
	backHref: string;
}

function episodesLabel(n: number | null): string | null {
	if (!n) return null;
	return `${n} ${n === 1 ? 'episodio' : 'episodi'}`;
}

/** Elenco completo di cast e troupe, con il reparto come sezione e un indice ad ancore. */
export default function FullCreditsView({ credits, backHref }: FullCreditsViewProps) {
	const crewCount = new Set(credits.crew.flatMap((d) => d.people.map((p) => p.id))).size;
	const sections = [
		...(credits.cast.length ? [{ key: 'cast', label: 'Cast', count: credits.cast.length }] : []),
		...credits.crew.map((d) => ({ key: `dept-${d.key}`, label: d.label, count: d.people.length })),
	];
	const subtitle = [
		credits.year,
		credits.cast.length ? `${credits.cast.length} ${credits.cast.length === 1 ? 'interprete' : 'interpreti'}` : null,
		crewCount ? `${crewCount} ${crewCount === 1 ? 'membro' : 'membri'} della troupe` : null,
	]
		.filter(Boolean)
		.join(' · ');

	const grid = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5';

	return (
		<PageShell width="narrow">
			<PageHeader
				eyebrow="Cast e troupe"
				title={credits.title}
				subtitle={subtitle}
				leading={<BackButton fallbackHref={backHref} variant="plain" />}
			/>

			{sections.length > 1 && (
				<nav aria-label="Reparti" className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
					{sections.map((s) => (
						<a
							key={s.key}
							href={`#${s.key}`}
							className="shrink-0 flex items-center gap-1.5 h-[34px] px-3.5 rounded-full bg-bg2 text-[13px] font-semibold text-fg transition-opacity hover:opacity-80"
						>
							{s.label}
							<span className="text-fg3">{s.count}</span>
						</a>
					))}
				</nav>
			)}

			{sections.length === 0 && (
				<p className="m-0 text-[15px] font-medium text-fg2">Nessun credito disponibile per questo titolo.</p>
			)}

			{credits.cast.length > 0 && (
				<section id="cast" className="scroll-mt-24 md:scroll-mt-28 flex flex-col gap-3">
					<h2 className="m-0 text-[19px] md:text-[22px] font-bold tracking-[-0.02em]">Cast</h2>
					<div className={grid}>
						{credits.cast.map((c) => (
							<CreditRow
								key={c.id}
								personId={c.id}
								name={c.name}
								role={c.role}
								profilePath={c.profilePath}
								meta={episodesLabel(c.episodes)}
							/>
						))}
					</div>
				</section>
			)}

			{credits.crew.map((dept) => (
				<section key={dept.key} id={`dept-${dept.key}`} className="scroll-mt-24 md:scroll-mt-28 flex flex-col gap-3 mt-4">
					<h2 className="m-0 text-[19px] md:text-[22px] font-bold tracking-[-0.02em]">{dept.label}</h2>
					<div className={grid}>
						{dept.people.map((p) => (
							<CreditRow
								key={p.id}
								personId={p.id}
								name={p.name}
								role={p.jobs.join(', ')}
								profilePath={p.profilePath}
								meta={episodesLabel(p.episodes)}
							/>
						))}
					</div>
				</section>
			))}
		</PageShell>
	);
}
