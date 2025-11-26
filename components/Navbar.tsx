import Link from 'next/link';

export default function Navbar() {
	return (
		<nav className="flex items-center justify-between py-6 px-8 max-w-[1600px] mx-auto">
			<div className="flex items-center gap-12">
				<Link href="/" className="text-2xl font-bold">
					<span className="text-gray-900">Cine</span><span className="text-purple-600">Scope</span>
				</Link>

				<div className="hidden md:flex items-center gap-8 text-gray-700 font-normal text-base">
					<Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
					<Link href="/discovery" className="hover:text-gray-900 transition-colors">Reviews</Link>
					<Link href="/discovery" className="hover:text-gray-900 transition-colors">Genres</Link>
					<Link href="/tv" className="hover:text-gray-900 transition-colors">Top Rated</Link>
					<Link href="/news" className="hover:text-gray-900 transition-colors">Blog</Link>
					<Link href="/news" className="hover:text-gray-900 transition-colors">About</Link>
				</div>
			</div>
		</nav>
	);
}
