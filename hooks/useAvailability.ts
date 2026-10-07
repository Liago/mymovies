'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore, type RefObject } from 'react';
import { fetchAvailabilityBatch } from '@/app/actions';
import {
	availabilityKey,
	type AvailabilityMediaType,
	type AvailabilityRequest,
	type MediaAvailability,
} from '@/lib/availability';

type Listener = (value: MediaAvailability | null) => void;

// Module-level cache shared by every card: a title shown in several carousels
// (or revisited after navigation) is resolved only once per session.
const cache = new Map<string, MediaAvailability | null>();
const listeners = new Map<string, Set<Listener>>();
const inFlight = new Set<string>();
let queue: AvailabilityRequest[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

const getServerSnapshot = (): MediaAvailability | null | undefined => undefined;

const FLUSH_DELAY_MS = 60;
const BATCH_SIZE = 40;

function notify(key: string, value: MediaAvailability | null) {
	cache.set(key, value);
	inFlight.delete(key);
	listeners.get(key)?.forEach((listener) => listener(value));
}

async function flush() {
	flushTimer = null;
	const pending = queue;
	queue = [];

	for (let i = 0; i < pending.length; i += BATCH_SIZE) {
		const chunk = pending.slice(i, i + BATCH_SIZE);
		try {
			const results = await fetchAvailabilityBatch(chunk);
			for (const req of chunk) {
				const key = availabilityKey(req.type, req.id);
				notify(key, results[key] ?? null);
			}
		} catch (e) {
			console.error('Error fetching availability:', e);
			// Allow a later retry instead of caching the failure.
			for (const req of chunk) inFlight.delete(availabilityKey(req.type, req.id));
		}
	}
}

function enqueue(req: AvailabilityRequest) {
	const key = availabilityKey(req.type, req.id);
	if (cache.has(key) || inFlight.has(key)) return;
	inFlight.add(key);
	queue.push(req);
	if (!flushTimer) flushTimer = setTimeout(flush, FLUSH_DELAY_MS);
}

/**
 * Returns the streaming / rent / buy summary for a title, loading it only once
 * the element referenced by `targetRef` approaches the viewport.
 */
export function useAvailability(
	targetRef: RefObject<Element | null>,
	type: AvailabilityMediaType,
	id: number | string,
	enabled: boolean = true
): MediaAvailability | null | undefined {
	const numericId = Number(id);
	const valid = enabled && Number.isInteger(numericId) && numericId > 0;
	const key = availabilityKey(type, numericId);

	const subscribe = useCallback(
		(onChange: () => void) => {
			if (!valid) return () => {};
			let set = listeners.get(key);
			if (!set) {
				set = new Set();
				listeners.set(key, set);
			}
			const listener: Listener = () => onChange();
			set.add(listener);
			return () => {
				set?.delete(listener);
				if (set && set.size === 0) listeners.delete(key);
			};
		},
		[key, valid]
	);
	const getSnapshot = useCallback(() => (valid ? cache.get(key) : undefined), [key, valid]);
	const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
	const requested = useRef(false);

	// Trigger the request when the card is (nearly) visible.
	useEffect(() => {
		requested.current = false;
		if (!valid || cache.has(key)) return;

		const el = targetRef.current;
		const request = () => {
			if (requested.current) return;
			requested.current = true;
			enqueue({ id: numericId, type });
		};

		if (!el || typeof IntersectionObserver === 'undefined') {
			request();
			return;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					request();
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [key, valid, numericId, type, targetRef]);

	return value;
}
