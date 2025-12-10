import Navbar from '@/components/Navbar';
import { Layers } from 'lucide-react';

export default function NewsPage() {
	return (
		<main className="min-h-screen bg-black text-white pt-24 pb-20">
			<div className="max-w-7xl mx-auto px-6 md:px-12 text-center py-20">
				<div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-zinc-900 border border-white/10 mb-8">
					<Layers size={40} className="text-primary" />
				</div>
				<h1 className="text-5xl md:text-7xl font-black text-white mb-6">
					News & Updates
				</h1>
				<p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-12">
					We're working on bringing you the latest entertainment news. Check back soon for exclusive stories and interviews.
				</p>
				<div className="p-1 rounded-full bg-gradient-to-r from-primary to-secondary inline-block">
					<div className="bg-black rounded-full px-8 py-4">
						<span className="font-bold tracking-widest uppercase text-sm">Coming Soon</span>
					</div>
				</div>
			</div>
		</main>
	);
}
