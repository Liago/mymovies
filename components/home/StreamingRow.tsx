'use client';

import { useMemo, useState } from 'react';
import MovieCard from '../MovieCard';
import HScroll from '../ui/HScroll';
import Segmented from '../ui/Segmented';
import { STREAMING_SERVICES } from '@/lib/services';
import { formatRating } from '@/lib/format';
import type { StreamingPick } from '@/lib/tmdb-catalog';

interface StreamingRowProps {
	items: StreamingPick[];
	initialService?: string | null;
}

/**
 * "Incluso nei tuoi abbonamenti": il filtro porta in testa i titoli del
 * servizio scelto (persistito nel parametro `svc` dell'URL).
 */
export default function StreamingRow({ items, initialService }: StreamingRowProps) {
	const [service, setService] = useState<string>(
		STREAMING_SERVICES.some((s) => s.slug === initialService) ? (initialService as string) : 'all'
	);

	const ordered = useMemo(() => {
		if (service === 'all') return items;
		const first = items.filter((i) => i.serviceSlug === service);
		return [...first, ...items.filter((i) => i.serviceSlug !== service)];
	}, [items, service]);

	const pick = (slug: string) => {
		setService(slug);
		const url = new URL(window.location.href);
		if (slug === 'all') url.searchParams.delete('svc');
		else url.searchParams.set('svc', slug);
		window.history.replaceState(window.history.state, '', url.toString());
	};

	if (!items.length) return null;

	return (
		<section>
			<div className="flex items-center justify-between gap-4 flex-wrap px-4 md:px-8 mb-[10px] md:mb-[14px]">
				<h2 className="text-[19px] md:text-[22px] font-bold tracking-[-0.02em]">Incluso nei tuoi abbonamenti</h2>
				<Segmented
					ariaLabel="Filtra per servizio"
					className="[&>*]:h-[34px] [&>*]:text-[13px] [&>*]:font-semibold [&>*]:px-3.5"
					items={[{ slug: 'all', name: 'Tutti' }, ...STREAMING_SERVICES].map((s) => ({
						key: s.slug,
						label: s.name,
						active: service === s.slug,
						onClick: () => pick(s.slug),
					}))}
				/>
			</div>
			<HScroll col="170px" mobileCol="120px" max="220px">
				{ordered.slice(0, 16).map((m) => (
					<MovieCard
						key={`${m.type}-${m.id}`}
						id={m.id}
						title={m.title}
						poster={m.poster}
						type={m.type}
						badge={m.service}
						subtitle={[m.type === 'tv' ? 'Serie' : 'Film', formatRating(m.rating) && `★ ${formatRating(m.rating)}`].filter(Boolean).join(' · ')}
					/>
				))}
			</HScroll>
		</section>
	);
}
