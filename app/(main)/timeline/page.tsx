import type { Metadata } from 'next';
import PageShell from '@/components/ui/PageShell';
import TimelineView from '@/components/timeline/TimelineView';

export const metadata: Metadata = { title: 'Timeline - CineScope' };

export default async function TimelinePage({ searchParams }: { searchParams: Promise<{ day?: string }> }) {
	const { day } = await searchParams;
	return (
		<PageShell width="narrow">
			<TimelineView initialDay={day ?? null} />
		</PageShell>
	);
}
