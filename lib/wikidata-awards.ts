import 'server-only';

/**
 * Premi e candidature da Wikidata, sia quelli assegnati al titolo
 * (P166 «premio ricevuto» / P1411 «candidato a» sull'opera, con i vincitori
 * nel qualificatore P1346) sia quelli assegnati alle persone «per l'opera»
 * (qualificatore P1686 sul premio della persona).
 */

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const USER_AGENT = 'CineScope/1.0 (awards lookup; server-side)';

export interface WikidataRecipient {
	name: string;
	tmdbPersonId: number | null;
}

export interface WikidataAward {
	/** QID del premio (es. Q103916, Oscar al miglior attore). */
	awardId: string;
	label: string;
	labelEn: string;
	won: boolean;
	year: string | null;
	recipients: WikidataRecipient[];
}

interface SparqlValue {
	value: string;
}

interface SparqlRow {
	st: SparqlValue;
	kind: SparqlValue;
	award: SparqlValue;
	awardLabel?: SparqlValue;
	awardEn?: SparqlValue;
	date?: SparqlValue;
	eventDate?: SparqlValue;
	recipient?: SparqlValue;
	recipientLabel?: SparqlValue;
	recipientTmdb?: SparqlValue;
}

function escapeLiteral(value: string): string {
	return value.replace(/["\\\n\r]/g, '');
}

function buildQuery(mediaType: 'movie' | 'tv', tmdbId: number | null, imdbId: string | null): string | null {
	const anchors: string[] = [];
	if (tmdbId) anchors.push(`{ ?film wdt:${mediaType === 'movie' ? 'P4947' : 'P4983'} "${tmdbId}" . }`);
	if (imdbId && /^tt\d+$/.test(imdbId)) anchors.push(`{ ?film wdt:P345 "${escapeLiteral(imdbId)}" . }`);
	if (!anchors.length) return null;

	return `
SELECT ?st ?kind ?award ?awardLabel ?awardEn ?date ?eventDate ?recipient ?recipientLabel ?recipientTmdb WHERE {
  { SELECT ?film WHERE { ${anchors.join(' UNION ')} } LIMIT 1 }
  {
    ?film p:P166 ?st . ?st ps:P166 ?award . BIND("won" AS ?kind)
    OPTIONAL { ?st pq:P1346 ?recipient . }
  } UNION {
    ?film p:P1411 ?st . ?st ps:P1411 ?award . BIND("nominated" AS ?kind)
    OPTIONAL { ?st pq:P1346 ?recipient . }
  } UNION {
    ?st pq:P1686 ?film . ?recipient p:P166 ?st . ?st ps:P166 ?award . BIND("won" AS ?kind)
  } UNION {
    ?st pq:P1686 ?film . ?recipient p:P1411 ?st . ?st ps:P1411 ?award . BIND("nominated" AS ?kind)
  }
  OPTIONAL { ?st pq:P585 ?date . }
  OPTIONAL { ?st pq:P805 ?event . ?event wdt:P585 ?eventDate . }
  OPTIONAL { ?award rdfs:label ?awardEn . FILTER(LANG(?awardEn) = "en") }
  OPTIONAL { ?recipient wdt:P4985 ?recipientTmdb . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "it,en". }
}
LIMIT 1500`;
}

function qid(uri: string): string {
	return uri.slice(uri.lastIndexOf('/') + 1);
}

function yearOf(date?: string): string | null {
	const match = date?.match(/^[+-]?(\d{4})/);
	return match ? match[1] : null;
}

/** Wikidata restituisce il QID come etichetta quando manca una traduzione. */
function isBareQid(label?: string): boolean {
	return !label || /^Q\d+$/.test(label);
}

export async function getWikidataAwards(
	mediaType: 'movie' | 'tv',
	tmdbId: number | null,
	imdbId: string | null
): Promise<WikidataAward[]> {
	const query = buildQuery(mediaType, tmdbId, imdbId);
	if (!query) return [];

	try {
		const res = await fetch(`${SPARQL_ENDPOINT}?format=json&query=${encodeURIComponent(query)}`, {
			headers: { Accept: 'application/sparql-results+json', 'User-Agent': USER_AGENT },
			signal: AbortSignal.timeout(10000),
			next: { revalidate: 86400 },
		});
		if (!res.ok) {
			console.warn(`[Wikidata] Risposta ${res.status} per ${mediaType} ${tmdbId ?? imdbId}`);
			return [];
		}
		const json = (await res.json()) as { results?: { bindings?: SparqlRow[] } };
		return mergeRows(json.results?.bindings ?? []);
	} catch (e) {
		console.warn('[Wikidata] Errore nel recupero dei premi:', e);
		return [];
	}
}

/**
 * Accorpa le righe SPARQL: lo stesso premio può comparire sia sull'opera sia
 * sulle singole persone, e ogni vincitore genera una riga.
 */
function mergeRows(rows: SparqlRow[]): WikidataAward[] {
	const byKey = new Map<string, WikidataAward & { recipientKeys: Set<string> }>();

	for (const row of rows) {
		const awardId = qid(row.award.value);
		const label = isBareQid(row.awardLabel?.value) ? row.awardEn?.value ?? '' : row.awardLabel!.value;
		if (!label) continue;

		const won = row.kind.value === 'won';
		const year = yearOf(row.date?.value) ?? yearOf(row.eventDate?.value);
		const key = `${awardId}|${won ? 'w' : 'n'}|${year ?? ''}`;

		let entry = byKey.get(key);
		if (!entry) {
			entry = {
				awardId,
				label,
				labelEn: row.awardEn?.value ?? label,
				won,
				year,
				recipients: [],
				recipientKeys: new Set(),
			};
			byKey.set(key, entry);
		}

		const recipientName = row.recipientLabel?.value;
		if (row.recipient && recipientName && !isBareQid(recipientName)) {
			const recipientKey = qid(row.recipient.value);
			if (!entry.recipientKeys.has(recipientKey)) {
				entry.recipientKeys.add(recipientKey);
				const tmdb = row.recipientTmdb?.value ? parseInt(row.recipientTmdb.value, 10) : NaN;
				entry.recipients.push({ name: recipientName, tmdbPersonId: Number.isNaN(tmdb) ? null : tmdb });
			}
		}
	}

	// Una candidatura poi vinta compare spesso anche come «candidato a»: tieni solo la vittoria
	// Il premio registrato sull'opera spesso non ha data, quello sulla persona sì: uniscili
	const all = Array.from(byKey.values()).filter((a) => {
		if (a.year) return true;
		const dated = Array.from(byKey.values()).find((b) => b.year && b.awardId === a.awardId && b.won === a.won);
		if (!dated) return true;
		for (const r of a.recipients) {
			if (!dated.recipients.some((x) => x.name === r.name)) dated.recipients.push(r);
		}
		return false;
	});
	const wins = all.filter((a) => a.won);
	const isWonLater = (a: WikidataAward) =>
		wins.some((w) => w.awardId === a.awardId && (!w.year || !a.year || w.year === a.year));

	return all
		.filter((a) => a.won || !isWonLater(a))
		.map((a) => ({ awardId: a.awardId, label: a.label, labelEn: a.labelEn, won: a.won, year: a.year, recipients: a.recipients }));
}
