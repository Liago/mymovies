import Link from 'next/link';
import { Home, Globe, Monitor, Newspaper, Heart, User } from 'lucide-react';

export default function Sidebar() {
	return (
		<aside className="fixed left-0 top-0 h-screen w-20 bg-[#fdfbf7] flex flex-col items-center py-8 z-50 border-r border-gray-100">
			<div className="flex flex-col gap-8 w-full items-center">
				<Link href="/" className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
					<Home size={24} />
				</Link>

				<Link href="/discovery" className="p-3 text-cyan-400 hover:text-cyan-500 transition-colors">
					<Globe size={24} />
				</Link>

				<Link href="/tv" className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
					<Monitor size={24} />
				</Link>

				<Link href="/news" className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
					<Newspaper size={24} />
				</Link>

				<Link href="/favorites" className="p-3 text-gray-400 hover:text-gray-900 transition-colors">
					<Heart size={24} />
				</Link>
			</div>

			<div className="mt-auto">
				<Link href="/profile" className="p-3 text-gray-400 hover:text-gray-900 transition-colors block">
					<User size={24} />
				</Link>
			</div>
		</aside>
	);
}
