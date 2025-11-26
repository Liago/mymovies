import { getMovieDetail } from '@/lib/omdb';
import { getMovieTrailer, getMovieDetailTMDb, getMovieTrailerTMDb } from '@/lib/tmdb';
import { notFound } from 'next/navigation';
import { Heart } from 'lucide-react';
import PlayButton from '@/components/PlayButton';
import PersonCard from '@/components/PersonCard';

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;

	// Detect if ID is TMDb (numeric) or IMDb (tt-prefix)
	const isTMDbId = /^\d+$/.test(id);

	let movie;
	let trailerUrl = null;

	if (isTMDbId) {
		movie = await getMovieDetailTMDb(parseInt(id));
		trailerUrl = await getMovieTrailerTMDb(parseInt(id));
	} else {
		movie = await getMovieDetail(id);
		trailerUrl = await getMovieTrailer(id);
	}

	if (!movie) {
		notFound();
	}

	return (
		<main className="min-h-screen bg-[#fdfbf7] text-gray-900 flex justify-center">
			<div className="w-full max-w-[1600px] flex flex-col lg:flex-row relative">

				{/* Main Content */}
				<div className="flex-1 p-6 lg:p-12 lg:pl-24 lg:pr-[400px] z-10">
					{/* Header */}
					<header className="flex items-center justify-between mb-8 lg:mb-12">
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
						<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-widest uppercase mb-6 lg:mb-8">{movie.title}</h1>

						<p className="text-gray-400 leading-relaxed mb-8 lg:mb-12 text-base lg:text-lg font-light">
							{movie.description}
						</p>

						{/* Ratings */}
						<div className="flex flex-wrap items-center gap-8 lg:gap-12 mb-12 lg:mb-16">
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
							<div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
								{movie.actors.map((actor, index) => (
									<PersonCard key={index} name={actor} role="Actor" />
								))}
							</div>
						</section>
					</div>
				</div>

				{/* Right Sidebar / Hero Image */}
				<div className="lg:fixed lg:right-0 lg:top-0 lg:w-[35%] lg:h-screen w-full h-[50vh] relative order-first lg:order-last">
					<div className="relative w-full h-full">
						{movie.poster && (
							<div
								className="absolute inset-0 bg-cover bg-center"
								style={{ backgroundImage: `url(${movie.poster})` }}
							>
								<div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-[#fdfbf7] lg:from-transparent to-transparent lg:to-[#fdfbf7]/20" />
							</div>
						)}

						{/* Play Button */}
						<PlayButton trailerUrl={trailerUrl} />

						{/* Movie Details Sidebar (Desktop Only) */}
						<div className="hidden lg:block absolute bottom-12 left-12 space-y-8">
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
								<div className="flex items-center gap-2">
									<PersonCard name={movie.director} role="Director" />
								</div>
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

				{/* Mobile Details (Visible only on mobile) */}
				<div className="lg:hidden p-6 space-y-6 bg-white/50 rounded-xl mx-6 mb-12">
					<div className="flex flex-wrap gap-4">
						<div>
							<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Release</span>
							<span className="text-base font-medium text-gray-900">{movie.releaseDate}</span>
						</div>
						<div>
							<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Length</span>
							<span className="text-base font-medium text-gray-900">{movie.duration}</span>
						</div>
						<div>
							<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-1">Box Office</span>
							<span className="text-base font-medium text-gray-900">{movie.boxOffice}</span>
						</div>
					</div>
					<div>
						<span className="block text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">Director</span>
						<PersonCard name={movie.director} role="Director" />
					</div>
				</div>

			</div>
		</main>
	);
}
