import { getMovieDetail } from '@/lib/omdb';
import { getMovieTrailer } from '@/lib/tmdb';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Play, Heart, User } from 'lucide-react';

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const movie = await getMovieDetail(id);
	const trailerUrl = await getMovieTrailer(id);

	if (!movie) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-[#fdfbf7] text-gray-900 flex">
			{/* Main Content */}
			<div className="flex-1 p-12 lg:pr-[400px]">
				{/* Header */}
				<header className="flex items-center justify-between mb-12">
					<div className="relative w-full max-w-md">
						<input
							type="text"
							placeholder="Search..."
							className="w-full bg-transparent border-none text-gray-500 placeholder-gray-300 focus:ring-0 text-lg"
						/>
						<div className="absolute left-0 top-1/2 -translate-y-1/2">
							<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
								<circle cx="11" cy="11" r="8"></circle>
								<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
							</svg>
						</div>
					</div>
				</header>

				{/* Movie Info */}
				<div className="max-w-3xl">
					<h1 className="text-4xl font-bold tracking-widest uppercase mb-8">{movie.title}</h1>

					<p className="text-gray-400 leading-relaxed mb-12 text-lg font-light">
						{movie.description}
					</p>

					{/* Ratings */}
					<div className="flex items-center gap-12 mb-16">
						<div className="flex items-center gap-4">
							<div className="relative w-16 h-16 flex items-center justify-center">
								<svg className="w-full h-full transform -rotate-90">
									<circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
									<circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="4" fill="none" strokeDasharray="175.9" strokeDashoffset={175.9 - (175.9 * movie.rating.imdb) / 10} />
								</svg>
								<span className="absolute text-xl font-bold text-gray-800">{movie.rating.imdb}</span>
							</div>
							<div className="flex flex-col">
								<span className="text-2xl font-bold text-gray-900">{movie.rating.imdb}<span className="text-sm text-gray-400 font-normal">/10</span></span>
								<span className="text-xs font-bold text-gray-300 tracking-wider">IMDb</span>
							</div>
						</div>

						<div className="flex flex-col">
							<span className="text-2xl font-bold text-gray-900">87%</span>
							<span className="text-xs font-bold text-gray-300 tracking-wider uppercase">Metacritic</span>
						</div>

						<div className="flex flex-col">
							<span className="text-2xl font-bold text-gray-900">{movie.rating.rottenTomatoes}%</span>
							<span className="text-xs font-bold text-gray-300 tracking-wider uppercase">Rotten Tomatoes</span>
						</div>

						<button className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-blue-500 hover:text-blue-600 transition-colors">
							<Heart size={24} />
						</button>
					</div>

					{/* Cast */}
					<section>
						<h3 className="text-xl text-gray-500 mb-6 font-light">The Cast</h3>
						<div className="flex gap-8 overflow-x-auto pb-4">
							{movie.actors.map((actor, index) => (
								<div key={index} className="flex flex-col items-center min-w-[100px]">
									<div className="w-24 h-32 bg-gray-200 rounded-lg mb-3 overflow-hidden shadow-sm">
										{/* Placeholder for actor image */}
										<div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-400">
											<User size={32} />
										</div>
									</div>
									<span className="text-sm font-medium text-gray-900 text-center">{actor}</span>
								</div>
							))}
						</div>
					</section>
				</div>
			</div>

			{/* Right Sidebar / Hero Image */}
			<div className="fixed right-0 top-0 w-[35%] h-screen hidden lg:block">
				<div className="relative w-full h-full">
					{movie.poster && (
						<div
							className="absolute inset-0 bg-cover bg-center"
							style={{ backgroundImage: `url(${movie.poster})` }}
						>
							<div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#fdfbf7]/20" />
						</div>
					)}

					{/* Play Button */}
					{trailerUrl && (
						<a
							href={trailerUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="absolute -left-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-orange-400 hover:scale-105 transition-transform cursor-pointer z-10"
						>
							<Play size={32} fill="currentColor" />
						</a>
					)}

					{/* Movie Details Sidebar */}
					<div className="absolute bottom-12 left-12 space-y-8">
						<div className="flex gap-2">
							<span className="px-4 py-1 bg-blue-400 text-white text-xs font-bold rounded uppercase tracking-wider">History</span>
							<span className="px-4 py-1 bg-orange-400 text-white text-xs font-bold rounded uppercase tracking-wider">Biography</span>
						</div>

						<div>
							<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Initial Release</span>
							<span className="text-lg font-medium text-gray-900">{movie.releaseDate}</span>
						</div>

						<div>
							<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Length</span>
							<span className="text-lg font-medium text-gray-900">{movie.duration}</span>
						</div>

						<div>
							<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Director</span>
							<span className="text-lg font-medium text-gray-900">{movie.director}</span>
						</div>

						<div>
							<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Box Office</span>
							<div className="flex items-center gap-2">
								<span className="text-lg font-medium text-gray-900">📊</span>
								<span className="text-2xl font-light text-gray-900">{movie.boxOffice}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
