'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

/** true dopo l'idratazione: per portali e valori che dipendono dal browser. */
export function useMounted(): boolean {
	return useSyncExternalStore(subscribe, () => true, () => false);
}
