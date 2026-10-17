/**
 * Helper di formattazione condivisi tra server e client (UI in italiano).
 */

/** 166 → "2 h 46 min", 45 → "45 min". */
export function formatRuntime(minutes?: number | null): string | null {
	if (!minutes || minutes <= 0) return null;
	const h = Math.floor(minutes / 60);
	const m = minutes % 60;
	if (!h) return `${m} min`;
	return m ? `${h} h ${m} min` : `${h} h`;
}

/** "2024-06-23" → "23 giugno 2024" (opzioni personalizzabili). */
export function formatDate(
	value?: string | null,
	options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
): string | null {
	if (!value) return null;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return null;
	return new Intl.DateTimeFormat('it-IT', options).format(date);
}

export function yearOf(value?: string | null): string {
	return (value || '').split('-')[0] || '';
}

/** Voto con una cifra decimale ("8.5"), null se assente. */
export function formatRating(value?: number | string | null): string | null {
	const n = typeof value === 'string' ? parseFloat(value) : value;
	if (n == null || Number.isNaN(n) || n <= 0) return null;
	return n.toFixed(1);
}

/** Iniziali per l'avatar: "Liago" → "LI", "Mario Rossi" → "MR". */
export function initials(name?: string | null): string {
	const clean = (name || '').trim();
	if (!clean) return '?';
	const parts = clean.split(/\s+/);
	if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
	return clean.slice(0, 2).toUpperCase();
}

/** Codice episodio compatto: (3, 4) → "S3 · E4". */
export function episodeCode(season: number, episode: number): string {
	return `S${season} · E${episode}`;
}

/** Codice episodio per la timeline: (3, 4) → "3×04". */
export function episodeShortCode(season: number, episode: number): string {
	return `${season}×${String(episode).padStart(2, '0')}`;
}

const regionNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['it'], { type: 'region' }) : null;
const languageNames = typeof Intl.DisplayNames === 'function' ? new Intl.DisplayNames(['it'], { type: 'language' }) : null;

export function countryName(code?: string | null): string | null {
	if (!code) return null;
	try {
		return regionNames?.of(code.toUpperCase()) ?? code;
	} catch {
		return code;
	}
}

export function languageName(code?: string | null): string | null {
	if (!code) return null;
	try {
		const name = languageNames?.of(code) ?? code;
		return name.charAt(0).toUpperCase() + name.slice(1);
	} catch {
		return code;
	}
}

/** Stato TMDB della serie in italiano. */
export function tvStatusLabel(status?: string | null): string | null {
	switch (status) {
		case 'Returning Series':
			return 'In corso';
		case 'Ended':
			return 'Conclusa';
		case 'Canceled':
		case 'Cancelled':
			return 'Cancellata';
		case 'In Production':
			return 'In produzione';
		case 'Planned':
			return 'Annunciata';
		case 'Pilot':
			return 'Pilota';
		default:
			return status || null;
	}
}

/** "Formato breve" di quanto tempo fa: "2 h", "ieri", "3 g". */
export function timeAgo(value?: string | null): string {
	if (!value) return '';
	const date = new Date(value);
	const diff = Date.now() - date.getTime();
	if (Number.isNaN(diff)) return '';
	const minutes = Math.round(diff / 60000);
	if (minutes < 1) return 'ora';
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return `${hours} h`;
	const days = Math.round(hours / 24);
	if (days === 1) return 'ieri';
	if (days < 7) return `${days} g`;
	return formatDate(value, { day: 'numeric', month: 'short' }) || '';
}

/** Numero con separatore delle migliaia italiano. */
export function formatCount(n: number): string {
	return new Intl.NumberFormat('it-IT').format(n);
}

/** URL completo di un poster TMDB, sia da path ("/abc.jpg") sia da URL già completo. */
export function tmdbImage(path?: string | null, size: string = 'w500'): string | null {
	if (!path) return null;
	if (path.startsWith('http')) return path;
	return `https://image.tmdb.org/t/p/${size}${path.startsWith('/') ? '' : '/'}${path}`;
}
