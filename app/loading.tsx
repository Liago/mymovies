/** Skeleton della Home: hero e prime righe. */
export default function Loading() {
	return (
		<div aria-busy="true">
			<div className="h-[470px] md:h-[min(82vh,780px)] md:min-h-[560px] placeholder-stripes animate-pulse" />
			<div className="px-4 md:px-8 pt-6 flex flex-col gap-3">
				<span className="h-6 w-56 rounded-lg bg-ph1" />
				<div className="grid grid-flow-col auto-cols-[250px] md:auto-cols-[minmax(300px,1fr)] gap-4 overflow-hidden">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="aspect-video rounded-[16px] placeholder-stripes" />
					))}
				</div>
			</div>
		</div>
	);
}
