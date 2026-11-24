'use client';

import { useCallback, useEffect, useRef } from 'react';

/** Durata della pressione prolungata, allineata al menu contestuale di iOS. */
const LONG_PRESS_MS = 450;
/** Oltre questo spostamento (px) il gesto è uno scroll, non una pressione. */
const MOVE_TOLERANCE = 10;

interface LongPressHandlers {
	onPointerDown: (e: React.PointerEvent) => void;
	onPointerMove: (e: React.PointerEvent) => void;
	onPointerUp: () => void;
	onPointerCancel: () => void;
	onPointerLeave: () => void;
	/** Blocca il click che segue una pressione prolungata (es. la navigazione del link). */
	onClickCapture: (e: React.MouseEvent) => void;
	/** Evita il menu contestuale nativo (anteprima link su iOS, tasto destro su desktop). */
	onContextMenu: (e: React.MouseEvent) => void;
}

/**
 * Riconosce una pressione prolungata con dito o mouse, annullandola se il
 * puntatore si sposta (scroll) o viene rilasciato prima della soglia.
 * Con `enabled = false` restituisce handler inerti.
 */
export function useLongPress(onLongPress: () => void, enabled: boolean = true): LongPressHandlers {
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const origin = useRef<{ x: number; y: number } | null>(null);
	const fired = useRef<boolean>(false);
	const callback = useRef(onLongPress);

	useEffect(() => {
		callback.current = onLongPress;
	}, [onLongPress]);

	const clear = useCallback((): void => {
		if (timer.current) clearTimeout(timer.current);
		timer.current = null;
		origin.current = null;
	}, []);

	useEffect(() => clear, [clear]);

	const onPointerDown = useCallback(
		(e: React.PointerEvent): void => {
			fired.current = false;
			if (!enabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
			origin.current = { x: e.clientX, y: e.clientY };
			timer.current = setTimeout(() => {
				fired.current = true;
				timer.current = null;
				if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(10);
				callback.current();
			}, LONG_PRESS_MS);
		},
		[enabled]
	);

	const onPointerMove = useCallback(
		(e: React.PointerEvent): void => {
			if (!origin.current) return;
			const dx = e.clientX - origin.current.x;
			const dy = e.clientY - origin.current.y;
			if (Math.hypot(dx, dy) > MOVE_TOLERANCE) clear();
		},
		[clear]
	);

	const onClickCapture = useCallback((e: React.MouseEvent): void => {
		if (!fired.current) return;
		fired.current = false;
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const onContextMenu = useCallback(
		(e: React.MouseEvent): void => {
			if (enabled) e.preventDefault();
		},
		[enabled]
	);

	return {
		onPointerDown,
		onPointerMove,
		onPointerUp: clear,
		onPointerCancel: clear,
		onPointerLeave: clear,
		onClickCapture,
		onContextMenu,
	};
}
