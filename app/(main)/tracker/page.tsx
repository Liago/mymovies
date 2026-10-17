import type { Metadata } from 'next';
import PageShell from '@/components/ui/PageShell';
import TrackerView, { type TrackerStatus } from '@/components/tracker/TrackerView';

export const metadata: Metadata = { title: 'Tracker - CineScope' };

export default async function TrackerPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
	const { status } = await searchParams;
	const initial: TrackerStatus = status === 'da-iniziare' || status === 'completate' ? status : 'in-corso';
	return (
		<PageShell width="narrow">
			<TrackerView initialStatus={initial} />
		</PageShell>
	);
}
