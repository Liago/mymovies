import 'server-only';

import { getOscarNominations, type OscarNomination } from './oscar-awards';
import { getWikidataAwards, type WikidataAward } from './wikidata-awards';
import { flattenCredits, getFullCredits, type CreditPerson } from './tmdb-credits';

export interface AwardRecipient {
	name: string;
	/** Id TMDB della persona: rende il nome cliccabile. */
	personId: number | null;
	profilePath: string | null;
	/** Ruolo nel titolo (personaggio o mansione), se la persona è nei crediti. */
	role: string | null;
}

export interface AwardEntry {
	category: string;
	year: string | null;
	won: boolean;
	recipients: AwardRecipient[];
	/** Dettaglio non legato a una persona (es. titolo della canzone candidata). */
	note: string | null;
}

export interface AwardGroup {
	key: string;
	name: string;
	wins: number;
	nominations: number;
	entries: AwardEntry[];
}

export interface AwardedPerson extends AwardRecipient {
	personId: number;
	wins: string[];
	nominations: number;
}

export interface AwardsDetail {
	groups: AwardGroup[];
	/** Persone del cast e della troupe premiate o candidate, prima chi ha vinto di più. */
	people: AwardedPerson[];
}

/** Cerimonie riconosciute dall'etichetta inglese del premio, nell'ordine di visualizzazione. */
const CEREMONIES: { key: string; name: string; match: RegExp }[] = [
	{ key: 'oscar', name: 'Oscar', match: /^Academy Award|Oscar/i },
	{ key: 'golden_globe', name: 'Golden Globe', match: /Golden Globe/i },
	{ key: 'bafta', name: 'BAFTA', match: /BAFTA|British Academy/i },
	{ key: 'emmy', name: 'Emmy', match: /Emmy/i },
	{ key: 'cannes', name: 'Festival di Cannes', match: /Cannes|Palme d'Or|Palm d'Or|Caméra d'Or/i },
	{ key: 'venice', name: 'Mostra di Venezia', match: /Venice|Golden Lion|Silver Lion|Volpi Cup|Marcello Mastroianni/i },
	{ key: 'berlin', name: 'Berlinale', match: /Berlin|Golden Bear|Silver Bear|Alfred Bauer/i },
	{ key: 'david', name: 'David di Donatello', match: /David di Donatello/i },
	{ key: 'nastro', name: "Nastri d'argento", match: /Nastro d'Argento|Silver Ribbon/i },
	{ key: 'sag', name: 'Screen Actors Guild', match: /Screen Actors Guild|SAG Award/i },
	{ key: 'critics', name: "Critics' Choice", match: /Critics' Choice/i },
	{ key: 'guilds', name: 'Premi delle Guild', match: /Directors Guild|Writers Guild|Producers Guild|Art Directors Guild|Costume Designers Guild|Cinema Audio Society|American Cinema Editors|American Society of Cinematographers/i },
	{ key: 'efa', name: 'European Film Awards', match: /European Film Award/i },
	{ key: 'cesar', name: 'César', match: /César/i },
	{ key: 'goya', name: 'Goya', match: /Goya Award/i },
	{ key: 'spirit', name: 'Independent Spirit', match: /Independent Spirit/i },
	{ key: 'saturn', name: 'Saturn Award', match: /Saturn Award/i },
	{ key: 'grammy', name: 'Grammy', match: /Grammy/i },
];
const OTHER = { key: 'other', name: 'Altri riconoscimenti' };

/** Categorie Oscar del dataset (in inglese) in italiano. */
const OSCAR_CATEGORY_IT: Record<string, string> = {
	'BEST PICTURE': 'Miglior film',
	'BEST DIRECTOR': 'Miglior regia',
	'BEST ACTOR': 'Miglior attore protagonista',
	'BEST ACTRESS': 'Miglior attrice protagonista',
	'BEST SUPPORTING ACTOR': 'Miglior attore non protagonista',
	'BEST SUPPORTING ACTRESS': 'Miglior attrice non protagonista',
	'BEST ORIGINAL SCREENPLAY': 'Miglior sceneggiatura originale',
	'BEST ADAPTED SCREENPLAY': 'Miglior sceneggiatura non originale',
	'BEST ORIGINAL STORY': 'Miglior soggetto originale',
	'BEST CINEMATOGRAPHY': 'Miglior fotografia',
	'BEST FILM EDITING': 'Miglior montaggio',
	'BEST SCORE': 'Miglior colonna sonora',
	'BEST ORIGINAL MUSICAL/SECONDARY SCORE CATEGORY': 'Miglior colonna sonora (adattamento)',
	'BEST ORIGINAL SONG': 'Miglior canzone',
	'BEST SOUND MIXING': 'Miglior sonoro',
	'BEST SOUND EDITING': 'Miglior montaggio sonoro',
	'BEST PRODUCTION DESIGN': 'Miglior scenografia',
	'BEST COSTUME DESIGN': 'Migliori costumi',
	'BEST MAKEUP AND HAIRSTYLING': 'Miglior trucco e acconciatura',
	'BEST VISUAL/SPECIAL EFFECTS': 'Migliori effetti speciali',
	'BEST ANIMATED FEATURE': "Miglior film d'animazione",
	'BEST INTERNATIONAL FEATURE FILM': 'Miglior film internazionale',
	'BEST DOCUMENTARY FEATURE': 'Miglior documentario',
	'BEST DOCUMENTARY SHORT': 'Miglior cortometraggio documentario',
	'BEST ANIMATED SHORT': "Miglior cortometraggio d'animazione",
	'BEST LIVE ACTION SHORT': 'Miglior cortometraggio',
	'BEST ASSISTANT DIRECTOR': 'Miglior aiuto regia',
	'BEST DANCE DIRECTION': 'Miglior coreografia',
	'UNIQUE AND ARTISTIC PRODUCTION': 'Miglior produzione artistica',
};

function oscarCategory(category: string): string {
	// Il dataset aggiunge «(Color)» anche dove la distinzione non esiste più
	const match = category.match(/^(.*?)\s*\((.+)\)$/);
	const base = (match ? match[1] : category).trim();
	const qualifier = match?.[2];
	const translated = OSCAR_CATEGORY_IT[base.toUpperCase()] ?? base;
	if (!qualifier || /^color$/i.test(qualifier)) return translated;
	if (/black and white/i.test(qualifier)) return `${translated} (bianco e nero)`;
	return OSCAR_CATEGORY_IT[category.toUpperCase()] ?? translated;
}

function normalizeName(name: string): string {
	return name
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '');
}

class PeopleIndex {
	private byId = new Map<number, CreditPerson>();
	private byName = new Map<string, CreditPerson>();

	constructor(people: CreditPerson[]) {
		for (const p of people) {
			this.byId.set(p.id, p);
			const key = normalizeName(p.name);
			if (!this.byName.has(key)) this.byName.set(key, p);
		}
	}

	resolve(name: string, personId: number | null): AwardRecipient {
		const person = (personId != null ? this.byId.get(personId) : undefined) ?? this.byName.get(normalizeName(name));
		if (person) {
			return { name: person.name, personId: person.id, profilePath: person.profilePath, role: person.role || null };
		}
		return { name, personId, profilePath: null, role: null };
	}

	has(name: string): boolean {
		return this.byName.has(normalizeName(name));
	}
}

function fromOscarDataset(nominations: OscarNomination[], people: PeopleIndex): AwardEntry[] {
	return nominations.map((nom) => {
		const titles = new Set(nom.movies.map((m) => normalizeName(m.title)));
		const recipients: AwardRecipient[] = [];
		const notes: string[] = [];
		const isSong = /song/i.test(nom.category);
		for (const nominee of nom.nominees) {
			if (titles.has(normalizeName(nominee))) continue; // il candidato è il film stesso
			// Per la canzone il dataset riporta il titolo del brano, non l'autore
			if (isSong && !people.has(nominee)) notes.push(`«${nominee}»`);
			else recipients.push(people.resolve(nominee, null));
		}
		return {
			category: oscarCategory(nom.category),
			year: nom.year.split('/')[0] || null,
			won: nom.won,
			recipients,
			note: notes.length ? notes.join(', ') : null,
		};
	});
}

function classify(labelEn: string): { key: string; name: string } {
	return CEREMONIES.find((c) => c.match.test(labelEn)) ?? OTHER;
}

/** Rende leggibile l'etichetta del premio togliendo il nome della cerimonia già nel titolo del gruppo. */
function wikidataCategory(award: WikidataAward, groupKey: string): string {
	const label = award.label.charAt(0).toUpperCase() + award.label.slice(1);
	if (groupKey === 'other') return label;
	const stripped = label
		.replace(/^(Premio Oscar|Oscar|Academy Award|Golden Globe|BAFTA|Premio BAFTA|Premio Emmy|Emmy|David di Donatello|Nastro d'argento|Premio César|César|Premio Goya|Goya)\s+(per il|per la|per lo|per l'|per i|per le|al|alla|allo|all'|ai|alle|for)\s+/i, '')
		.trim();
	if (!stripped || stripped === label) return label;
	return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}

function sortEntries(entries: AwardEntry[]): AwardEntry[] {
	return [...entries].sort((a, b) => {
		if (a.won !== b.won) return a.won ? -1 : 1;
		const year = parseInt(b.year ?? '0', 10) - parseInt(a.year ?? '0', 10);
		return year || a.category.localeCompare(b.category, 'it');
	});
}

function toGroup(key: string, name: string, entries: AwardEntry[]): AwardGroup {
	const wins = entries.filter((e) => e.won).length;
	return { key, name, wins, nominations: entries.length, entries: sortEntries(entries) };
}

function collectPeople(groups: AwardGroup[]): AwardedPerson[] {
	const byId = new Map<number, AwardedPerson>();
	for (const group of groups) {
		for (const entry of group.entries) {
			for (const r of entry.recipients) {
				if (r.personId == null || !r.role) continue; // solo chi è nei crediti del titolo
				const person = byId.get(r.personId) ?? { ...r, personId: r.personId, wins: [], nominations: 0 };
				byId.set(r.personId, person);
				person.nominations += 1;
				if (entry.won) person.wins.push(`${group.name} · ${entry.category}`);
			}
		}
	}
	return Array.from(byId.values()).sort((a, b) => b.wins.length - a.wins.length || b.nominations - a.nominations);
}

export async function getAwardsDetail(params: {
	mediaType: 'movie' | 'tv';
	tmdbId: number | null;
	imdbId: string | null;
	language?: string;
}): Promise<AwardsDetail> {
	const { mediaType, tmdbId, imdbId, language = 'it-IT' } = params;

	const [oscar, wikidata, credits] = await Promise.all([
		mediaType === 'movie' ? getOscarNominations({ imdbId, tmdbId }).catch(() => []) : Promise.resolve([] as OscarNomination[]),
		getWikidataAwards(mediaType, tmdbId, imdbId),
		tmdbId ? getFullCredits(mediaType, tmdbId, language) : Promise.resolve(null),
	]);

	const people = new PeopleIndex(credits ? flattenCredits(credits) : []);
	const byGroup = new Map<string, { name: string; entries: AwardEntry[] }>();
	const push = (key: string, name: string, entry: AwardEntry) => {
		const group = byGroup.get(key) ?? { name, entries: [] };
		group.entries.push(entry);
		byGroup.set(key, group);
	};

	const oscarNominations = oscar;
	for (const entry of fromOscarDataset(oscarNominations, people)) push('oscar', 'Oscar', entry);
	const hasOscarDataset = oscarNominations.length > 0;

	for (const award of wikidata) {
		const ceremony = classify(award.labelEn);
		// Il dataset Oscar è più completo di Wikidata: se c'è, usiamo quello
		if (ceremony.key === 'oscar' && hasOscarDataset) continue;
		push(ceremony.key, ceremony.name, {
			category: wikidataCategory(award, ceremony.key),
			year: award.year,
			won: award.won,
			recipients: award.recipients.map((r) => people.resolve(r.name, r.tmdbPersonId)),
			note: null,
		});
	}

	const order = [...CEREMONIES.map((c) => c.key), OTHER.key];
	const groups = Array.from(byGroup.entries())
		.sort(([a], [b]) => order.indexOf(a) - order.indexOf(b))
		.map(([key, g]) => toGroup(key, g.name, g.entries));

	return { groups, people: collectPeople(groups) };
}
