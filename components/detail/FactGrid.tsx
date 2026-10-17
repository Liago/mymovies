export interface Fact {
	label: string;
	value: string | null | undefined;
}

/** Griglia di card informative (Regia, Paese, Budget…). Salta i valori vuoti. */
export default function FactGrid({ facts }: { facts: Fact[] }) {
	const visible = facts.filter((f) => f.value && f.value !== 'N/A');
	if (!visible.length) return null;

	return (
		<div className="grid grid-cols-2 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2.5 md:gap-3">
			{visible.map((f) => (
				<div key={f.label} className="px-4 py-3.5 rounded-[16px] bg-card border border-line flex flex-col gap-[3px] min-w-0">
					<span className="text-[12px] font-semibold text-fg3">{f.label}</span>
					<span className="text-[14px] md:text-[15px] font-bold break-words">{f.value}</span>
				</div>
			))}
		</div>
	);
}
