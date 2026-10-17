/** Skeleton generico delle pagine: titolo e griglia con i colori placeholder. */
export default function Loading() {
	return (
		<main className="mx-auto w-full max-w-[1480px] px-4 md:px-8 pt-[calc(env(safe-area-inset-top)+24px)] md:pt-[100px] pb-36 flex flex-col gap-6" aria-busy="true">
			<div className="flex flex-col gap-3">
				<span className="hidden md:block h-3 w-24 rounded bg-ph1" />
				<span className="h-8 md:h-12 w-56 md:w-96 rounded-xl bg-ph1" />
			</div>
			<div className="flex gap-2">
				{Array.from({ length: 4 }).map((_, i) => (
					<span key={i} className="h-[38px] w-28 rounded-full bg-ph2" />
				))}
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-x-3 gap-y-4 md:gap-x-[18px] md:gap-y-6">
				{Array.from({ length: 12 }).map((_, i) => (
					<div key={i} className="flex flex-col gap-2">
						<div className="aspect-[2/3] rounded-[12px] md:rounded-[14px] placeholder-stripes animate-pulse" />
						<span className="h-3.5 w-3/4 rounded bg-ph1" />
					</div>
				))}
			</div>
		</main>
	);
}
