import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { fetchDiscoverMovies, fetchTVShows } from "@/app/actions";
import { Film, Tv } from "lucide-react";

export default async function Home() {
	const [movies, tvShows] = await Promise.all([
		fetchDiscoverMovies(),
		fetchTVShows()
	]);

	const popularMovies = movies.slice(0, 8);
	const popularTVShows = tvShows.slice(0, 8);

	return (
		<main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
			{/* Header */}
			<header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-6 py-4">
					<div className="flex items-center justify-between">
						{/* Logo */}
						<Link href="/" className="flex items-center gap-2">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
								<span className="text-white font-bold text-xl">M</span>
							</div>
							<span className="text-2xl font-bold text-gray-900">MyMovies</span>
						</Link>

						{/* Navigation */}
						<nav className="hidden md:flex items-center gap-8">
							<Link
								href="/"
								className="text-gray-900 font-semibold hover:text-purple-600 transition-colors"
							>
								Home
							</Link>
							<Link
								href="/discovery"
								className="text-gray-600 hover:text-purple-600 transition-colors font-medium flex items-center gap-2"
							>
								<Film size={18} />
								Film
							</Link>
							<Link
								href="/tv"
								className="text-gray-600 hover:text-purple-600 transition-colors font-medium flex items-center gap-2"
							>
								<Tv size={18} />
								Serie TV
							</Link>
						</nav>

						{/* User Avatar */}
						<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
							AZ
						</div>
					</div>
				</div>
			</header>

			{/* Hero Section with Search */}
			<section className="py-16 md:py-24">
				<div className="max-w-4xl mx-auto px-6 text-center">
					<h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
						Scopri il tuo prossimo
						<br />
						<span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
							film preferito
						</span>
					</h1>
					<p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
						Esplora migliaia di film e serie TV. Trova il contenuto perfetto per te.
					</p>

					{/* Search Bar */}
					<div className="max-w-2xl mx-auto">
						<SearchBar />
					</div>

					{/* Quick Links */}
					<div className="flex items-center justify-center gap-4 mt-8">
						<Link
							href="/discovery"
							className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
						>
							<Film size={20} />
							Esplora Film
						</Link>
						<Link
							href="/tv"
							className="px-6 py-3 bg-white text-gray-900 border-2 border-gray-200 rounded-full font-semibold hover:border-purple-600 hover:text-purple-600 transition-all flex items-center gap-2"
						>
							<Tv size={20} />
							Esplora Serie TV
						</Link>
					</div>
				</div>
			</section>

			{/* Popular Movies Section */}
			<section className="py-12 bg-white">
				<div className="max-w-7xl mx-auto px-6">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
								<Film className="text-purple-600" size={32} />
								Film Popolari
							</h2>
							<p className="text-gray-600 mt-1">I film più amati del momento</p>
						</div>
						<Link
							href="/discovery"
							className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
						>
							Vedi tutti →
						</Link>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
						{popularMovies.map((movie: any) => (
							<Link
								key={movie.id}
								href={`/movie/${movie.id}`}
								className="group"
							>
								<div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gray-100">
									{movie.poster ? (
										<img
											src={movie.poster}
											alt={movie.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center text-gray-400">
											No Poster
										</div>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
										<p className="text-white font-bold text-sm line-clamp-2">{movie.title}</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-yellow-400 text-xs">★ {movie.rating.toFixed(1)}</span>
											<span className="text-gray-300 text-xs">{movie.year}</span>
										</div>
									</div>
								</div>
								<h3 className="mt-3 font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition-colors">
									{movie.title}
								</h3>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Popular TV Shows Section */}
			<section className="py-12 bg-gradient-to-br from-gray-50 to-purple-50">
				<div className="max-w-7xl mx-auto px-6">
					<div className="flex items-center justify-between mb-8">
						<div>
							<h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
								<Tv className="text-blue-600" size={32} />
								Serie TV Popolari
							</h2>
							<p className="text-gray-600 mt-1">Le serie TV più amate del momento</p>
						</div>
						<Link
							href="/tv"
							className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
						>
							Vedi tutti →
						</Link>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
						{popularTVShows.map((show: any) => (
							<Link
								key={show.id}
								href={`/movie/${show.id}`}
								className="group"
							>
								<div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gray-100">
									{show.poster ? (
										<img
											src={show.poster}
											alt={show.title}
											className="w-full h-full object-cover"
										/>
									) : (
										<div className="absolute inset-0 flex items-center justify-center text-gray-400">
											No Poster
										</div>
									)}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									<div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
										<p className="text-white font-bold text-sm line-clamp-2">{show.title}</p>
										<div className="flex items-center gap-2 mt-1">
											<span className="text-yellow-400 text-xs">★ {show.rating.toFixed(1)}</span>
											<span className="text-gray-300 text-xs">{show.year}</span>
										</div>
									</div>
								</div>
								<h3 className="mt-3 font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
									{show.title}
								</h3>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-white border-t border-gray-200 py-12">
				<div className="max-w-7xl mx-auto px-6">
					<div className="text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg">
								<span className="text-white font-bold text-xl">M</span>
							</div>
							<span className="text-2xl font-bold text-gray-900">MyMovies</span>
						</div>
						<p className="text-gray-600">La tua destinazione per film e serie TV</p>
						<div className="flex items-center justify-center gap-6 mt-6">
							<Link href="/discovery" className="text-gray-600 hover:text-purple-600 transition-colors">
								Film
							</Link>
							<Link href="/tv" className="text-gray-600 hover:text-purple-600 transition-colors">
								Serie TV
							</Link>
							<Link href="/news" className="text-gray-600 hover:text-purple-600 transition-colors">
								News
							</Link>
						</div>
						<p className="text-gray-400 text-sm mt-6">© 2025 MyMovies. Tutti i diritti riservati.</p>
					</div>
				</div>
			</footer>
		</main>
	);
}
