import { ArrowUpRight } from 'lucide-react';
import type { WatchProvider, WatchProviderData } from '@/lib/tmdb';
import { STREAMING_SERVICES } from '@/lib/services';

interface WhereToWatchProps {
	providers: WatchProviderData | null;
	title: string;
	/** Contenuto extra prima del footer (es. "Il tuo voto"). */
	children?: React.ReactNode;
}

interface Row {
	provider: WatchProvider;
	note: string;
}

function shortName(p: WatchProvider): string {
	return STREAMING_SERVICES.find((s) => s.providerId === p.provider_id)?.name ?? p.provider_name;
}

function dedupe(rows: Row[]): Row[] {
	const seen = new Set<number>();
	return rows
		.sort((a, b) => a.provider.display_priority - b.provider.display_priority)
		.filter((r) => (seen.has(r.provider.provider_id) ? false : (seen.add(r.provider.provider_id), true)));
}

/** Pannello "Dove guardarlo": Streaming / Noleggio / Acquisto (JustWatch). */
export default function WhereToWatch({ providers, title, children }: WhereToWatchProps) {
	const groups = [
		{
			label: 'Streaming',
			rows: dedupe([
				...(providers?.flatrate || []).map((p) => ({ provider: p, note: 'Incluso' })),
				...(providers?.free || []).map((p) => ({ provider: p, note: 'Gratis' })),
				...(providers?.ads || []).map((p) => ({ provider: p, note: 'Con pubblicità' })),
			]),
		},
		{ label: 'Noleggio', rows: dedupe((providers?.rent || []).map((p) => ({ provider: p, note: 'Noleggio' }))) },
		{ label: 'Acquisto', rows: dedupe((providers?.buy || []).map((p) => ({ provider: p, note: 'Acquisto' }))) },
	].filter((g) => g.rows.length > 0);

	return (
		<div className="p-5 rounded-[22px] bg-card border border-line flex flex-col gap-4">
			<h3 className="m-0 text-[18px] font-bold">{title}</h3>

			{groups.length === 0 ? (
				<p className="m-0 text-[14px] font-medium text-fg3">Al momento non è disponibile in streaming, a noleggio o in acquisto in Italia.</p>
			) : (
				groups.map((group) => (
					<div key={group.label} className="flex flex-col gap-2">
						<span className="text-[12px] font-bold text-fg3">{group.label}</span>
						{group.rows.slice(0, 5).map(({ provider, note }) => {
							const content = (
								<>
									{provider.logo_path ? (
										<img
											src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
											alt=""
											className="w-[34px] h-[34px] rounded-[9px] object-cover shrink-0"
											loading="lazy"
										/>
									) : (
										<span className="w-[34px] h-[34px] rounded-[9px] bg-ph1 shrink-0" />
									)}
									<span className="flex-1 min-w-0 text-[14px] font-bold truncate">{shortName(provider)}</span>
									<span className="text-[13px] font-semibold text-fg2 whitespace-nowrap">{note}</span>
									{providers?.link && <ArrowUpRight size={15} className="text-fg3 shrink-0" />}
								</>
							);
							const cls = 'flex items-center gap-3 p-2 rounded-[12px] bg-bg2 transition-opacity';
							return providers?.link ? (
								<a key={provider.provider_id} href={providers.link} target="_blank" rel="noopener noreferrer" className={`${cls} hover:opacity-80`}>
									{content}
								</a>
							) : (
								<div key={provider.provider_id} className={cls}>
									{content}
								</div>
							);
						})}
					</div>
				))
			)}

			{children}

			<span className="text-[11px] font-medium text-fg3">Dati JustWatch · Italia</span>
		</div>
	);
}

/** Primo servizio in abbonamento, per la card "Guarda su …" su mobile. */
export function primaryStreaming(providers: WatchProviderData | null): { name: string; logo: string | null; others: string[] } | null {
	const list = [...(providers?.flatrate || []), ...(providers?.free || []), ...(providers?.ads || [])].sort(
		(a, b) => a.display_priority - b.display_priority
	);
	if (!list.length) return null;
	const names = Array.from(new Set(list.map(shortName)));
	return {
		name: names[0],
		logo: list[0].logo_path ? `https://image.tmdb.org/t/p/w92${list[0].logo_path}` : null,
		others: names.slice(1, 3),
	};
}
