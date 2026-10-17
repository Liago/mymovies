'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, LogIn, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useWatchlist } from '@/context/WatchlistContext';
import { useLists, type UserList } from '@/context/ListsContext';
import { useRatings } from '@/context/RatingsContext';
import { useTracker } from '@/context/TrackerContext';
import MovieCard from '@/components/MovieCard';
import CreateListButton from '@/components/CreateListButton';
import SettingsMenu from '@/components/profile/SettingsMenu';
import UserAvatar from '@/components/UserAvatar';
import PageShell from '@/components/ui/PageShell';
import Segmented from '@/components/ui/Segmented';
import StatCard from '@/components/ui/StatCard';
import { tmdbImage } from '@/lib/format';

export type ProfileTab = 'watchlist' | 'preferiti' | 'liste' | 'voti';

interface GridItem {
	id: number;
	media_type: 'movie' | 'tv';
	title: string;
	poster: string | null;
	rating?: number;
}

function PosterGridSection({ items, loading, empty, showVote = false }: { items: GridItem[]; loading: boolean; empty: string; showVote?: boolean }) {
	if (loading) {
		return (
			<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-2.5 gap-y-3.5 md:gap-x-[18px] md:gap-y-[22px]">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i} className="aspect-[2/3] rounded-[12px] md:rounded-[14px] placeholder-stripes" />
				))}
			</div>
		);
	}
	if (!items.length) return <p className="m-0 py-10 text-center text-[14px] font-semibold text-fg3">{empty}</p>;

	return (
		<div className="grid grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-2.5 gap-y-3.5 md:gap-x-[18px] md:gap-y-[22px]">
			{[...items].reverse().map((item) => (
				<MovieCard
					key={`${item.media_type}-${item.id}`}
					id={item.id}
					title={item.title}
					poster={tmdbImage(item.poster)}
					type={item.media_type}
					badge={showVote && item.rating ? `★ ${item.rating}` : undefined}
					subtitle={null}
					compact
				/>
			))}
		</div>
	);
}

function ListCard({ list }: { list: UserList }) {
	const previews = list.previews?.length
		? list.previews
		: (list.items || []).slice(0, 4).map((i) => tmdbImage(i.poster, 'w185')).filter(Boolean) as string[];
	const tiles = Array.from({ length: 4 }, (_, i) => previews[i] ?? null);

	return (
		<Link
			href={`/profile/lists/${list.id}`}
			className="flex md:flex-col items-center md:items-stretch gap-3 md:gap-3 p-2.5 md:p-3.5 rounded-[16px] md:rounded-[22px] bg-card border border-line transition-opacity hover:opacity-80"
		>
			<span className="grid grid-cols-3 md:grid-cols-4 gap-[3px] md:gap-1.5 w-[78px] md:w-auto shrink-0">
				{tiles.map((src, i) => (
					<span
						key={i}
						className={`aspect-[2/3] rounded-[5px] md:rounded-[8px] bg-cover bg-center ${i === 3 ? 'hidden md:block' : ''} ${i % 2 ? 'bg-ph2' : 'bg-ph1'}`}
						style={src ? { backgroundImage: `url("${src}")` } : undefined}
					/>
				))}
			</span>
			<span className="flex-1 flex flex-col gap-0.5 md:px-1 min-w-0">
				<span className="text-[15px] md:text-[16px] font-bold truncate">{list.name}</span>
				<span className="text-[12px] md:text-[13px] font-semibold text-fg3">
					{list.count} {list.count === 1 ? 'titolo' : 'titoli'}
				</span>
			</span>
			<ChevronRight size={18} className="md:hidden text-fg3" />
		</Link>
	);
}

/** Profilo + libreria: statistiche e tab Watchlist · Preferiti · Liste · Voti. */
export default function ProfilePageClient({ initialTab }: { initialTab: ProfileTab }) {
	const { user, isLoggedIn, hasMounted, login } = useAuth();
	const { favorites, isLoading: favoritesLoading } = useFavorites();
	const { watchlist, isLoading: watchlistLoading } = useWatchlist();
	const { lists, isLoading: listsLoading } = useLists();
	const { ratings, isLoading: ratingsLoading } = useRatings();
	const { watchedShows } = useTracker();
	const [tab, setTab] = useState<ProfileTab>(initialTab);

	const pick = (next: ProfileTab) => {
		setTab(next);
		const url = new URL(window.location.href);
		if (next === 'watchlist') url.searchParams.delete('tab');
		else url.searchParams.set('tab', next);
		window.history.replaceState(window.history.state, '', url.toString());
	};

	const name = user?.name || user?.username || 'Ospite';
	const meta = isLoggedIn && user ? `@${user.username} · Italia` : 'I tuoi dati restano salvati su questo dispositivo';

	const tabs: { key: ProfileTab; label: string; count: number }[] = [
		{ key: 'watchlist', label: 'Watchlist', count: watchlist.length },
		{ key: 'preferiti', label: 'Preferiti', count: favorites.length },
		{ key: 'liste', label: 'Liste', count: lists.length },
		{ key: 'voti', label: 'Voti', count: ratings.length },
	];

	return (
		<PageShell width="wide">
			<div className="flex items-center gap-3.5 md:gap-[22px] flex-wrap">
				{hasMounted && isLoggedIn ? (
					<>
						<span className="md:hidden">
							<UserAvatar size={64} asLink={false} />
						</span>
						<span className="hidden md:block">
							<UserAvatar size={96} asLink={false} />
						</span>
					</>
				) : (
					<span className="w-16 h-16 md:w-24 md:h-24 shrink-0 rounded-full bg-bg2 text-fg3 flex items-center justify-center">
						<UserIcon size={30} />
					</span>
				)}
				<div className="flex-1 min-w-0 flex flex-col gap-0.5 md:gap-1">
					<h1 className="m-0 text-[24px] md:text-[40px] font-extrabold leading-none tracking-[-0.02em] md:tracking-[-0.03em] truncate">{name}</h1>
					<span className="text-[12px] md:text-[14px] font-semibold md:font-medium text-fg3">{meta}</span>
				</div>
				{hasMounted && !isLoggedIn && (
					<span className="hidden md:block">
						<button
							type="button"
							onClick={() => login()}
							className="h-10 px-4 rounded-full bg-acc text-accfg text-[14px] font-bold flex items-center gap-2 hover:opacity-90"
						>
							<LogIn size={16} />
							Accedi
						</button>
					</span>
				)}
				<span className="md:hidden">
					<SettingsMenu compact />
				</span>
				<span className="hidden md:block">
					<SettingsMenu />
				</span>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
				<StatCard value={watchlist.length} label="In watchlist" />
				<StatCard value={watchedShows.size} label="Serie seguite" />
				<StatCard value={ratings.length} label="Voti dati" />
				<StatCard value={lists.length} label="Liste" />
			</div>

			<Segmented
				variant="tabs"
				ariaLabel="Libreria"
				items={tabs.map((t) => ({ key: t.key, label: t.label, count: t.count, active: tab === t.key, onClick: () => pick(t.key) }))}
			/>

			{tab === 'watchlist' && (
				<PosterGridSection items={watchlist} loading={watchlistLoading} empty="La watchlist è vuota: aggiungi film e serie da vedere più tardi." />
			)}
			{tab === 'preferiti' && (
				<PosterGridSection items={favorites} loading={favoritesLoading} empty="Non hai ancora preferiti." />
			)}
			{tab === 'voti' && (
				<PosterGridSection items={ratings} loading={ratingsLoading} empty="Non hai ancora votato nessun titolo." showVote />
			)}
			{tab === 'liste' &&
				(listsLoading ? (
					<div className="grid md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2.5 md:gap-4">
						{Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="h-[100px] md:h-[200px] rounded-[22px] placeholder-stripes" />
						))}
					</div>
				) : (
					<div className="grid md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-2.5 md:gap-4">
						{lists.map((list) => (
							<ListCard key={list.id} list={list} />
						))}
						<div className="hidden md:flex">
							<CreateListButton variant="card" className="flex-1" />
						</div>
						<div className="md:hidden">
							<CreateListButton variant="row" className="w-full" />
						</div>
					</div>
				))}
		</PageShell>
	);
}
