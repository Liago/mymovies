'use client';

import { useState, useEffect } from 'react';
import { fetchPersonDetails, fetchPersonCredits } from '@/app/actions';
import { User, X } from 'lucide-react';
import Link from 'next/link';

interface PersonCardProps {
	name: string;
	role: string;
}

export default function PersonCard({ name, role }: PersonCardProps) {
	const [person, setPerson] = useState<any>(null);
	const [credits, setCredits] = useState<any[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchPersonDetails(name).then(setPerson);
	}, [name]);

	const handleOpen = async () => {
		setIsOpen(true);
		if (person?.id && credits.length === 0) {
			setLoading(true);
			const data = await fetchPersonCredits(person.id);
			setCredits(data);
			setLoading(false);
		}
	};

	return (
		<>
			<div
				onClick={handleOpen}
				className="flex flex-col items-center min-w-[100px] cursor-pointer group"
			>
				<div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-3 border-2 border-white/10 group-hover:border-primary/50 transition-all shadow-lg bg-zinc-900">
					{person?.image ? (
						<img src={person.image} alt={name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
					) : (
						<div className="w-full h-full flex items-center justify-center text-zinc-600 group-hover:text-zinc-400">
							<User size={28} />
						</div>
					)}
				</div>
				<span className="text-sm font-semibold text-zinc-300 text-center group-hover:text-white transition-colors line-clamp-2">{name}</span>
				<span className="text-xs text-zinc-500">{role}</span>
			</div>

			{/* Modal */}
			{isOpen && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
					<div className="bg-zinc-950 border border-white/10 w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
						<div className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-900/50">
							<h2 className="text-2xl font-bold text-white">Known For</h2>
							<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
								<X size={24} />
							</button>
						</div>

						<div className="p-6 overflow-y-auto bg-zinc-950/50 custom-scrollbar">
							{loading ? (
								<div className="flex justify-center p-12">
									<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
								</div>
							) : (
								<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
									{credits.map((item) => (
										<Link href={`/movie/${item.id}`} key={item.id} className="group bg-zinc-900 rounded-xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all">
											<div className="aspect-[2/3] bg-zinc-800 relative">
												{item.poster ? (
													<img src={item.poster} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
												) : (
													<div className="absolute inset-0 flex items-center justify-center text-zinc-600">No Poster</div>
												)}
											</div>
											<div className="p-3">
												<h3 className="font-bold text-sm text-zinc-300 line-clamp-1 group-hover:text-white">{item.title}</h3>
												<p className="text-xs text-zinc-500">{item.year} • {item.type === 'movie' ? 'Movie' : 'TV'}</p>
											</div>
										</Link>
									))}
								</div>
							)}
						</div>
					</div>
					<div className="absolute inset-0 -z-10" onClick={() => setIsOpen(false)} />
				</div>
			)}
		</>
	);
}
