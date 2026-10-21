'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useMounted } from '@/hooks/useMounted';
import { useAuth } from './AuthContext';
import { useWatchlist } from './WatchlistContext';
import { fetchAvailabilitySnapshots } from '@/app/actions/watchlist-alerts';
import { availabilityKey } from '@/lib/availability';
import {
	ALERT_CHECK_INTERVAL_MS,
	describeAlert,
	diffAvailability,
	mergeChanges,
	type AvailabilitySnapshot,
	type NotifiedProviders,
	type WatchlistAlert,
} from '@/lib/watchlist-alerts';

export type SystemNotificationsState = 'unsupported' | 'default' | 'granted' | 'denied';

interface WatchlistAlertsContextType {
	alerts: WatchlistAlert[];
	unreadCount: number;
	isChecking: boolean;
	checkNow: () => Promise<void>;
	markAllRead: () => Promise<void>;
	markRead: (id: string) => Promise<void>;
	clearAll: () => Promise<void>;
	/** Notifiche di sistema (banner del telefono / del browser). */
	systemNotifications: SystemNotificationsState;
	systemNotificationsEnabled: boolean;
	setSystemNotificationsEnabled: (enabled: boolean) => Promise<void>;
}

const WatchlistAlertsContext = createContext<WatchlistAlertsContextType | undefined>(undefined);

const LAST_CHECK_KEY = 'cinescope:alerts-last-check';
const SYSTEM_PREF_KEY = 'cinescope:alerts-system';
const GUEST_ALERTS_KEY = 'cine_watchlist_alerts';
const GUEST_STATES_KEY = 'cine_watchlist_availability';
const GUEST_ALERTS_LIMIT = 50;
/** Ogni quanto l'app avvia un controllo mentre è aperta (il server limita comunque per titolo). */
const CLIENT_CHECK_INTERVAL_MS = 60 * 60 * 1000;

interface GuestState {
	snapshot: AvailabilitySnapshot;
	notified: NotifiedProviders;
	checkedAt: number;
}

function readStorage<T>(key: string, fallback: T): T {
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch {
		return fallback;
	}
}

function writeStorage(key: string, value: unknown) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Storage pieno o non disponibile: gli avvisi restano in memoria
	}
}

function currentPermission(): SystemNotificationsState {
	if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
	return Notification.permission;
}

async function showSystemNotification(alert: WatchlistAlert) {
	const title = alert.title;
	const options: NotificationOptions = {
		body: describeAlert(alert),
		icon: alert.poster ? `https://image.tmdb.org/t/p/w185${alert.poster}` : '/icon-192',
		badge: '/icon-192',
		tag: `watchlist-${alert.mediaType}-${alert.mediaId}`,
		data: { url: `/${alert.mediaType}/${alert.mediaId}` },
	};
	try {
		// Su Android / PWA le notifiche passano solo dal service worker
		const registration = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined;
		if (registration) await registration.showNotification(title, options);
		else new Notification(title, options);
	} catch (e) {
		console.error('Error showing notification:', e);
	}
}

export function WatchlistAlertsProvider({ children }: { children: React.ReactNode }) {
	const { user, isLoading: authLoading } = useAuth();
	const { watchlist, isLoading: watchlistLoading } = useWatchlist();
	const [alerts, setAlerts] = useState<WatchlistAlert[]>([]);
	const [isChecking, setIsChecking] = useState(false);
	const [permission, setPermission] = useState<SystemNotificationsState>('unsupported');
	const [systemPref, setSystemPref] = useState(false);
	const checking = useRef(false);
	const watchlistRef = useRef(watchlist);
	watchlistRef.current = watchlist;

	const systemNotificationsEnabled = systemPref && permission === 'granted';
	const notifyRef = useRef(systemNotificationsEnabled);
	notifyRef.current = systemNotificationsEnabled;

	useEffect(() => {
		setPermission(currentPermission());
		setSystemPref(readStorage(SYSTEM_PREF_KEY, false));
		if (readStorage(SYSTEM_PREF_KEY, false) && 'serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(() => {});
		}
	}, []);

	const announce = useCallback((fresh: WatchlistAlert[]) => {
		if (!notifyRef.current) return;
		fresh.forEach(showSystemNotification);
	}, []);

	// Controllo per gli ospiti: fotografie e avvisi restano su questo dispositivo
	const checkGuest = useCallback(async () => {
		const items = watchlistRef.current;
		const states = readStorage<Record<string, GuestState>>(GUEST_STATES_KEY, {});
		const now = Date.now();

		const keys = new Set(items.map((i) => availabilityKey(i.media_type, i.id)));
		for (const key of Object.keys(states)) if (!keys.has(key)) delete states[key];

		const due = items
			.filter((i) => {
				const state = states[availabilityKey(i.media_type, i.id)];
				return !state || now - state.checkedAt >= ALERT_CHECK_INTERVAL_MS;
			})
			.slice(0, 40);

		if (!due.length) {
			writeStorage(GUEST_STATES_KEY, states);
			return;
		}

		const results = await fetchAvailabilitySnapshots(due.map((i) => ({ id: i.id, type: i.media_type })));
		const stored = readStorage<WatchlistAlert[]>(GUEST_ALERTS_KEY, []);
		const fresh: WatchlistAlert[] = [];

		for (const item of due) {
			const key = availabilityKey(item.media_type, item.id);
			const result = results[key];
			if (!result) continue;
			const previous = states[key];
			const { change, notified } = diffAvailability(previous?.snapshot ?? null, previous?.notified ?? null, result.snapshot);
			states[key] = { snapshot: result.snapshot, notified, checkedAt: now };
			if (!change) continue;

			const unreadIndex = stored.findIndex((a) => !a.read && a.mediaId === item.id && a.mediaType === item.media_type);
			const unread = unreadIndex >= 0 ? stored.splice(unreadIndex, 1)[0] : null;
			const merged = unread ? mergeChanges(unread, change) : change;
			fresh.push({
				id: unread?.id ?? `${key}:${now}`,
				mediaId: item.id,
				mediaType: item.media_type,
				title: item.title,
				poster: item.poster,
				link: result.link,
				createdAt: new Date(now).toISOString(),
				read: false,
				...merged,
			});
		}

		writeStorage(GUEST_STATES_KEY, states);
		if (fresh.length) {
			const next = [...fresh, ...stored].slice(0, GUEST_ALERTS_LIMIT);
			writeStorage(GUEST_ALERTS_KEY, next);
			setAlerts(next);
			announce(fresh);
		}
	}, [announce]);

	const runCheck = useCallback(async () => {
		if (checking.current) return;
		checking.current = true;
		setIsChecking(true);
		try {
			if (user) {
				const response = await fetch('/api/watchlist-alerts', { method: 'POST' });
				if (response.ok) {
					const data: { fresh: WatchlistAlert[]; alerts: WatchlistAlert[] } = await response.json();
					setAlerts(data.alerts);
					announce(data.fresh);
				}
			} else {
				await checkGuest();
			}
			writeStorage(LAST_CHECK_KEY, Date.now());
		} catch (e) {
			console.error('Error checking watchlist availability:', e);
		} finally {
			checking.current = false;
			setIsChecking(false);
		}
	}, [user, announce, checkGuest]);

	// Avvisi già salvati
	useEffect(() => {
		if (authLoading) return;
		if (!user) {
			setAlerts(readStorage<WatchlistAlert[]>(GUEST_ALERTS_KEY, []));
			return;
		}
		fetch('/api/watchlist-alerts')
			.then((r) => (r.ok ? r.json() : { alerts: [] }))
			.then((data: { alerts: WatchlistAlert[] }) => setAlerts(data.alerts ?? []))
			.catch((e) => console.error('Error loading watchlist alerts:', e));
	}, [user, authLoading]);

	// Controllo all'apertura, quando l'app torna in primo piano e una volta all'ora
	useEffect(() => {
		if (authLoading || watchlistLoading) return;

		const maybeCheck = () => {
			if (document.visibilityState !== 'visible') return;
			const last = readStorage<number>(LAST_CHECK_KEY, 0);
			if (Date.now() - last >= CLIENT_CHECK_INTERVAL_MS) runCheck();
		};

		const initial = setTimeout(maybeCheck, 2500);
		const interval = setInterval(maybeCheck, CLIENT_CHECK_INTERVAL_MS);
		document.addEventListener('visibilitychange', maybeCheck);
		return () => {
			clearTimeout(initial);
			clearInterval(interval);
			document.removeEventListener('visibilitychange', maybeCheck);
		};
	}, [authLoading, watchlistLoading, runCheck]);

	// Un nuovo titolo in watchlist riceve subito la sua fotografia di base
	const watchlistSize = watchlist.length;
	const previousSize = useRef<number | null>(null);
	useEffect(() => {
		if (watchlistLoading) return;
		if (previousSize.current !== null && watchlistSize > previousSize.current) {
			const timer = setTimeout(runCheck, 1500);
			previousSize.current = watchlistSize;
			return () => clearTimeout(timer);
		}
		previousSize.current = watchlistSize;
	}, [watchlistSize, watchlistLoading, runCheck]);

	const updateGuestAlerts = useCallback((update: (prev: WatchlistAlert[]) => WatchlistAlert[]) => {
		setAlerts((prev) => {
			const next = update(prev);
			writeStorage(GUEST_ALERTS_KEY, next);
			return next;
		});
	}, []);

	const markRead = useCallback(
		async (id: string) => {
			if (!user) {
				updateGuestAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
				return;
			}
			setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
			await fetch('/api/watchlist-alerts', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: [Number(id)] }),
			}).catch((e) => console.error('Error marking alert as read:', e));
		},
		[user, updateGuestAlerts]
	);

	const markAllRead = useCallback(async () => {
		if (!user) {
			updateGuestAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
			return;
		}
		setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
		await fetch('/api/watchlist-alerts', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({}),
		}).catch((e) => console.error('Error marking alerts as read:', e));
	}, [user, updateGuestAlerts]);

	const clearAll = useCallback(async () => {
		if (!user) {
			updateGuestAlerts(() => []);
			return;
		}
		setAlerts([]);
		await fetch('/api/watchlist-alerts', { method: 'DELETE' }).catch((e) => console.error('Error clearing alerts:', e));
	}, [user, updateGuestAlerts]);

	const setSystemNotificationsEnabled = useCallback(async (enabled: boolean) => {
		if (!enabled) {
			setSystemPref(false);
			writeStorage(SYSTEM_PREF_KEY, false);
			return;
		}
		if (!('Notification' in window)) return;
		const result = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
		setPermission(result);
		const granted = result === 'granted';
		setSystemPref(granted);
		writeStorage(SYSTEM_PREF_KEY, granted);
		if (granted && 'serviceWorker' in navigator) {
			await navigator.serviceWorker.register('/sw.js').catch(() => {});
		}
	}, []);

	const unreadCount = useMemo(() => alerts.filter((a) => !a.read).length, [alerts]);

	return (
		<WatchlistAlertsContext.Provider
			value={{
				alerts,
				unreadCount,
				isChecking,
				checkNow: runCheck,
				markAllRead,
				markRead,
				clearAll,
				systemNotifications: permission,
				systemNotificationsEnabled,
				setSystemNotificationsEnabled,
			}}
		>
			{children}
		</WatchlistAlertsContext.Provider>
	);
}

export function useWatchlistAlerts() {
	const context = useContext(WatchlistAlertsContext);
	if (!context) {
		throw new Error('useWatchlistAlerts must be used within WatchlistAlertsProvider');
	}
	// Durante l'idratazione restituisce lo stato iniziale (come sul server)
	const hydrated = useMounted();
	return useMemo(
		() => (hydrated ? context : { ...context, alerts: [], unreadCount: 0 }),
		[hydrated, context]
	);
}
