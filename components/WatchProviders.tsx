import { WatchProviderData, WatchProvider } from '@/lib/tmdb';
import { ExternalLink, Play, ShoppingCart, Tv, Gift, Monitor } from 'lucide-react';

interface WatchProvidersProps {
	providers: WatchProviderData;
	lang?: string;
}

function ProviderGroup({ title, icon, providers }: { title: string; icon: React.ReactNode; providers: WatchProvider[] }) {
	if (!providers || providers.length === 0) return null;

	return (
		<div>
			<div className="flex items-center gap-2 mb-3">
				{icon}
				<h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{title}</h4>
			</div>
			<div className="flex flex-wrap gap-3">
				{providers.map((provider) => (
					<div
						key={provider.provider_id}
						className="group/provider relative flex items-center gap-2.5 px-3 py-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all duration-300"
						title={provider.provider_name}
					>
						{provider.logo_path ? (
							<img
								src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
								alt={provider.provider_name}
								className="w-8 h-8 rounded-lg object-cover"
								loading="lazy"
							/>
						) : (
							<div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
								<Monitor size={16} className="text-zinc-500" />
							</div>
						)}
						<span className="text-sm font-medium text-zinc-300 group-hover/provider:text-white transition-colors">
							{provider.provider_name}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default function WatchProviders({ providers, lang = 'it-IT' }: WatchProvidersProps) {
	const hasAnyProvider = (providers.flatrate && providers.flatrate.length > 0) ||
		(providers.rent && providers.rent.length > 0) ||
		(providers.buy && providers.buy.length > 0) ||
		(providers.free && providers.free.length > 0) ||
		(providers.ads && providers.ads.length > 0);

	if (!hasAnyProvider) return null;

	const countryCode = lang.split('-')[1] || lang.split('-')[0].toUpperCase();

	return (
		<div className="border-t border-white/10 pt-8">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
					Where to Watch
				</h2>
				{providers.link && (
					<a
						href={providers.link}
						target="_blank"
						rel="noopener noreferrer"
						className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
					>
						<span>TMDB</span>
						<ExternalLink size={12} />
					</a>
				)}
			</div>

			<div className="space-y-6">
				<ProviderGroup
					title="Streaming"
					icon={<Play size={14} className="text-emerald-400" />}
					providers={providers.flatrate || []}
				/>
				<ProviderGroup
					title="Free"
					icon={<Gift size={14} className="text-sky-400" />}
					providers={providers.free || []}
				/>
				<ProviderGroup
					title="Free with Ads"
					icon={<Tv size={14} className="text-amber-400" />}
					providers={providers.ads || []}
				/>
				<ProviderGroup
					title="Rent"
					icon={<Monitor size={14} className="text-violet-400" />}
					providers={providers.rent || []}
				/>
				<ProviderGroup
					title="Buy"
					icon={<ShoppingCart size={14} className="text-orange-400" />}
					providers={providers.buy || []}
				/>
			</div>

			<p className="mt-4 text-[10px] text-zinc-600">
				{countryCode === 'IT' ? 'Dati forniti da JustWatch' : 'Data provided by JustWatch'}
			</p>
		</div>
	);
}
