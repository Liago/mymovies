'use client';

import Link from 'next/link';
import { BellOff, BellRing, CheckCheck, RefreshCw, Trash2 } from 'lucide-react';
import { useWatchlistAlerts } from '@/context/WatchlistAlertsContext';
import { describeAlert, type AlertKind, type WatchlistAlert } from '@/lib/watchlist-alerts';
import { timeAgo, tmdbImage } from '@/lib/format';
import { cn } from '@/lib/cn';

const KIND_LABEL: Record<AlertKind, string> = {
	stream: 'Streaming',
	rent: 'Noleggio',
	buy: 'Acquisto',
};

function AlertRow({ alert, onOpen }: { alert: WatchlistAlert; onOpen: (alert: WatchlistAlert) => void }) {
	const poster = tmdbImage(alert.poster, 'w185');
	const logos = alert.kinds.flatMap((kind) => alert.providers[kind] ?? []).filter((p, i, all) => all.findIndex((q) => q.id === p.id) === i);

	return (
		<Link
			href={`/${alert.mediaType}/${alert.mediaId}`}
			onClick={() => onOpen(alert)}
			className={cn('flex gap-3 p-2 rounded-[14px] transition-colors hover:bg-bg2', !alert.read && 'bg-acc-soft')}
		>
			<span
				className="w-[46px] aspect-[2/3] shrink-0 rounded-[8px] bg-ph1 bg-cover bg-center"
				style={poster ? { backgroundImage: `url("${poster}")` } : undefined}
			/>
			<span className="flex-1 min-w-0 flex flex-col gap-1">
				<span className="flex items-center gap-2">
					<span className="flex-1 min-w-0 text-[14px] font-bold truncate">{alert.title}</span>
					{!alert.read && <span className="w-2 h-2 shrink-0 rounded-full bg-acc" aria-label="Non letto" />}
					<span className="text-[11px] font-semibold text-fg3 whitespace-nowrap">{timeAgo(alert.createdAt)}</span>
				</span>
				<span className="text-[12px] font-semibold text-fg2 leading-snug">{describeAlert(alert)}</span>
				<span className="flex items-center gap-1.5 flex-wrap">
					{alert.source === 'episode' && (
						<span className="h-5 px-2 rounded-full bg-bg2 text-[10px] font-bold text-fg2 flex items-center">
							{alert.episode && alert.episode.newCount > 1 ? 'Nuovi episodi' : 'Nuovo episodio'}
						</span>
					)}
					{alert.kinds.map((kind) => (
						<span key={kind} className="h-5 px-2 rounded-full bg-bg2 text-[10px] font-bold text-fg2 flex items-center">
							{KIND_LABEL[kind]}
						</span>
					))}
					{logos.slice(0, 4).map((p) =>
						p.logoPath ? (
							<img
								key={p.id}
								src={`https://image.tmdb.org/t/p/w92${p.logoPath}`}
								alt={p.name}
								title={p.name}
								className="w-5 h-5 rounded-[5px] object-cover"
								loading="lazy"
							/>
						) : null
					)}
				</span>
			</span>
		</Link>
	);
}

/** Elenco degli avvisi (disponibilità della watchlist e nuovi episodi), con azioni e preferenza delle notifiche di sistema. */
export default function AlertsPanel({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
	const {
		alerts,
		unreadCount,
		isChecking,
		checkNow,
		markRead,
		markAllRead,
		clearAll,
		systemNotifications,
		systemNotificationsEnabled,
		setSystemNotificationsEnabled,
	} = useWatchlistAlerts();

	const open = (alert: WatchlistAlert) => {
		if (!alert.read) markRead(alert.id);
		onNavigate?.();
	};

	const iconButton = 'w-9 h-9 rounded-full bg-bg2 flex items-center justify-center text-fg2 transition-opacity hover:opacity-80 disabled:opacity-40';

	return (
		<div className={cn('flex flex-col gap-3', className)}>
			<div className="flex items-center gap-2">
				<div className="flex-1 min-w-0 flex flex-col">
					<span className="text-[16px] font-extrabold">Avvisi</span>
					<span className="text-[12px] font-semibold text-fg3">
						{unreadCount ? `${unreadCount} novità da vedere` : 'Watchlist e serie seguite'}
					</span>
				</div>
				<button type="button" onClick={() => checkNow()} disabled={isChecking} className={iconButton} aria-label="Controlla ora" title="Controlla ora">
					<RefreshCw size={15} className={cn(isChecking && 'animate-spin')} />
				</button>
				<button type="button" onClick={() => markAllRead()} disabled={!unreadCount} className={iconButton} aria-label="Segna tutto come letto" title="Segna tutto come letto">
					<CheckCheck size={16} />
				</button>
				<button type="button" onClick={() => clearAll()} disabled={!alerts.length} className={iconButton} aria-label="Svuota avvisi" title="Svuota avvisi">
					<Trash2 size={15} />
				</button>
			</div>

			{alerts.length ? (
				<div className="flex flex-col gap-1 max-h-[min(420px,60vh)] overflow-y-auto -mx-1 px-1">
					{alerts.map((alert) => (
						<AlertRow key={alert.id} alert={alert} onOpen={open} />
					))}
				</div>
			) : (
				<p className="m-0 py-6 text-center text-[13px] font-semibold text-fg3 text-balance">
					Ti avviseremo quando un titolo della tua watchlist arriva in streaming, a noleggio o in vendita e quando esce un nuovo episodio di una serie che segui.
				</p>
			)}

			{systemNotifications !== 'unsupported' && (
				<button
					type="button"
					onClick={() => setSystemNotificationsEnabled(!systemNotificationsEnabled)}
					disabled={systemNotifications === 'denied'}
					className="flex items-center gap-3 px-3 h-11 rounded-[12px] bg-bg2 text-[13px] font-semibold text-left transition-opacity hover:opacity-80 disabled:opacity-60"
				>
					{systemNotificationsEnabled ? <BellRing size={16} className="text-acc" /> : <BellOff size={16} className="text-fg3" />}
					<span className="flex-1">
						{systemNotifications === 'denied'
							? 'Notifiche bloccate nelle impostazioni del browser'
							: systemNotificationsEnabled
								? 'Notifiche sul dispositivo attive'
								: 'Attiva le notifiche sul dispositivo'}
					</span>
					{systemNotifications !== 'denied' && (
						<span className={cn('w-9 h-5 rounded-full p-0.5 flex transition-colors', systemNotificationsEnabled ? 'bg-acc justify-end' : 'bg-line justify-start')}>
							<span className="w-4 h-4 rounded-full bg-card shadow" />
						</span>
					)}
				</button>
			)}
		</div>
	);
}
