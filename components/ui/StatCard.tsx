interface StatCardProps {
	value: React.ReactNode;
	label: React.ReactNode;
}

export default function StatCard({ value, label }: StatCardProps) {
	return (
		<div className="px-[14px] py-3 md:px-[18px] md:py-4 rounded-[16px] md:rounded-[18px] bg-card border border-line">
			<span className="block text-[22px] md:text-[30px] font-extrabold tracking-[-0.03em] tabular-nums">{value}</span>
			<span className="text-[12px] md:text-[13px] font-semibold text-fg3">{label}</span>
		</div>
	);
}
