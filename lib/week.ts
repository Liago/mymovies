/** Utility per la settimana corrente (lunedì → domenica, ora locale). */

export function toISODate(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function startOfWeek(date: Date = new Date()): Date {
	const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const offset = (d.getDay() + 6) % 7; // lunedì = 0
	d.setDate(d.getDate() - offset);
	return d;
}

export function weekDays(date: Date = new Date()): Date[] {
	const start = startOfWeek(date);
	return Array.from({ length: 7 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

const dayShort = new Intl.DateTimeFormat('it-IT', { weekday: 'short' });
const dayLong = new Intl.DateTimeFormat('it-IT', { weekday: 'short', day: 'numeric', month: 'long' });
const monthName = new Intl.DateTimeFormat('it-IT', { month: 'long' });

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Lun" */
export function weekdayShort(d: Date): string {
	return capitalize(dayShort.format(d).replace('.', ''));
}

/** "Mer 21 ottobre" */
export function dayLabel(d: Date): string {
	return capitalize(dayLong.format(d).replace('.', ''));
}

/** "19 – 25 ottobre" oppure "28 ottobre – 3 novembre". */
export function weekRangeLabel(days: Date[]): string {
	const first = days[0];
	const last = days[days.length - 1];
	if (first.getMonth() === last.getMonth()) {
		return `${first.getDate()} – ${last.getDate()} ${monthName.format(last)}`;
	}
	return `${first.getDate()} ${monthName.format(first)} – ${last.getDate()} ${monthName.format(last)}`;
}

export function parseISODate(value: string): Date {
	const [y, m, d] = value.split('-').map(Number);
	return new Date(y, (m || 1) - 1, d || 1);
}
