import { fetchTVShows } from '@/app/actions';
import Link from 'next/link';

export default async function TVPage() {
	const shows = await fetchTVShows();

	return (
		<main className="min-h-screen p-8 lg:p-12">
			<h1 className="text-4xl font-bold mb-8 text-gray-900">Popular TV Series</h1>
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
				{shows.map((show: any) => (
					<Link href={`/movie/${show.id}`} key={show.id} className="group">
						<div className="aspect-[2/3] bg-gray-200 rounded-xl overflow-hidden shadow-md mb-3 relative">
							{show.poster ? (
								<img src={show.poster} alt={show.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
							) : (
								<div className="absolute inset-0 flex items-center justify-center text-gray-400">No Poster</div>
							)}
							<div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-full">
								★ {show.rating.toFixed(1)}
							</div>
						</div>
						<h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors line-clamp-1">{show.title}</h3>
						<p className="text-sm text-gray-500">{show.year}</p>
					</Link>
				))}
			</div>
		</main>
	);
}
