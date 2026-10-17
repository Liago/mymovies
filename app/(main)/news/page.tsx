import type { Metadata } from 'next';
import PageShell from '@/components/ui/PageShell';
import NewsView from '@/components/news/NewsView';

export const metadata: Metadata = { title: 'Notizie - CineScope' };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
	const { source } = await searchParams;
	return (
		<PageShell width="news" className="md:gap-[22px]">
			<NewsView initialSource={source ?? null} />
		</PageShell>
	);
}
