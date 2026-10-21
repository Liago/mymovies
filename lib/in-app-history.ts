/**
 * Traccia quante pagine dell'app sono state visitate nella cronologia della scheda,
 * così i pulsanti "Indietro" possono usare `router.back()` solo quando la pagina
 * precedente appartiene all'app (e non a un sito esterno o a una scheda nuova).
 *
 * `document.referrer` non è affidabile: non si aggiorna con le navigazioni client-side
 * di Next.js ed è vuoto quando l'app è installata come PWA.
 */

const STORAGE_KEY = 'cinescope:in-app-depth';

let depth = 0;
let pendingPop = false;

function persist() {
	try {
		sessionStorage.setItem(STORAGE_KEY, String(depth));
	} catch {
		// sessionStorage non disponibile: il contatore resta solo in memoria
	}
}

/** Da chiamare una volta al primo caricamento dell'app. */
export function initInAppHistory() {
	let isReload = false;
	try {
		const [entry] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
		isReload = entry?.type === 'reload' || entry?.type === 'back_forward';
	} catch {
		isReload = false;
	}

	if (isReload) {
		try {
			depth = Math.max(0, Number(sessionStorage.getItem(STORAGE_KEY)) || 0);
		} catch {
			depth = 0;
		}
	} else {
		depth = 0;
	}
	persist();

	window.addEventListener('popstate', () => {
		pendingPop = true;
	});
}

/** Da chiamare a ogni cambio di pagina successivo al primo render. */
export function recordInAppNavigation() {
	if (pendingPop) {
		// Navigazione con indietro/avanti del browser: approssimiamo come "indietro"
		depth = Math.max(0, depth - 1);
		pendingPop = false;
	} else {
		depth += 1;
	}
	persist();
}

/** Il pulsante "Indietro" più recente può tornare a una pagina dell'app? */
export function canGoBackInApp() {
	return depth > 0;
}

/** Da chiamare subito prima di `router.back()`. */
export function markInAppBack() {
	pendingPop = true;
}
