import Link from 'next/link';
import { ArrowUpRight, Star } from 'lucide-react';
import SearchBar from './SearchBar';

interface HeroItem {
	id: number;
	title: string;
	poster: string | null;
	rating: number;
	year: string;
	type: 'movie' | 'tv';
}

interface HeroSectionProps {
	items: HeroItem[];
}

export default function HeroSection({ items }: HeroSectionProps) {
	const mainItem = items[0];
	const sideItems = items.slice(1, 4);

	if (!mainItem) return null;

	return (
		<div className="max-w-[1600px] mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-100px)] max-h-[900px]">

			{/* Main Feature Card */}
			<div className="lg:col-span-8 relative rounded-[40px] overflow-hidden group">
				<div
					className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
					style={{ backgroundImage: `url(${mainItem.poster?.replace('w500', 'original') || ''})` }}
				>
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
				</div>

				{/* Search Bar Overlay */}
				<div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-xl z-20">
					<SearchBar />
				</div>

				{/* Content */}
				<div className="absolute bottom-0 left-0 p-12 w-full z-20">
					<Link href={`/ movie / ${mainItem.id} `} className="inline-flex items-center gap-2 bg-[#6d28d9] text-white px-6 py-3 rounded-full font-medium mb-6 hover:bg-[#5b21b6] transition-colors">
						Browse Reviews
						<ArrowUpRight size={18} />
					</Link>

					<h1 className="text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight line-clamp-2">
						{mainItem.title}
					</h1>

					<div className="flex items-end justify-between">
						<p className="text-gray-300 text-lg max-w-md">
							Discover authentic, heartfelt reviews from real movie lovers.
						</p>

						<div className="flex items-center gap-4">
							<div className="flex -space-x-4">
								{[1, 2, 3].map((i) => (
									<div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-gray-300 overflow-hidden">
										<img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
									</div >
								))}
							</div >
							<div>
								<div className="flex items-center gap-1 text-yellow-400">
									<span className="text-2xl font-bold text-white">{mainItem.rating.toFixed(1)}</span>
									<div className="flex">
										{[1, 2, 3, 4, 5].map((i) => (
											<Star key={i} size={16} fill="currentColor" />
										))}
									</div>
								</div>
								<span className="text-gray-400 text-sm">9K+ Reviews</span>
							</div>
						</div >
					</div >
				</div >
			</div >

			{/* Right Column Cards */}
			< div className="lg:col-span-4 flex flex-col gap-6 h-full" >
				{
					sideItems.map((item, index) => (
						<div key={item.id} className={`flex-${index === 1 ? '[2]' : '1'} relative rounded-[32px] overflow-hidden group`}>
							<Link href={`/movie/${item.id}`} className="block w-full h-full">
								<div
									className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
									style={{ backgroundImage: `url(${item.poster?.replace('w500', 'original') || ''})` }}
								>
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
								</div>
								{index === 0 && (
									<div className="absolute top-6 right-6">
										<div className="bg-white/90 backdrop-blur text-[#6d28d9] px-6 py-2 rounded-full font-medium flex items-center gap-2 hover:bg-white transition-colors">
											Login <ArrowUpRight size={16} />
										</div>
									</div>
								)}
								<div className="absolute bottom-6 left-6 right-6">
									<h3 className="text-white font-bold text-xl line-clamp-1">{item.title}</h3>
									<div className="flex items-center gap-2 text-gray-300 text-sm">
										<span>{item.year}</span>
										<span>•</span>
										<span className="uppercase">{item.type}</span>
									</div>
								</div>
							</Link>
						</div>
					))
				}
			</div >
		</div >
	);
}
