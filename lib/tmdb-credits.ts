import 'server-only';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export type CreditsMediaType = 'movie' | 'tv';

export interface CastCredit {
	id: number;
	name: string;
	profilePath: string | null;
	/** Personaggio (o personaggi, per le serie). */
	role: string;
	/** Numero di episodi (solo serie). */
	episodes: number | null;
}

export interface CrewCredit {
	id: number;
	name: string;
	profilePath: string | null;
	/** Mansioni in quel reparto, già tradotte e senza duplicati. */
	jobs: string[];
	episodes: number | null;
}

export interface CrewDepartment {
	key: string;
	label: string;
	people: CrewCredit[];
}

export interface FullCredits {
	mediaType: CreditsMediaType;
	tmdbId: number;
	title: string;
	poster: string | null;
	year: string | null;
	cast: CastCredit[];
	crew: CrewDepartment[];
}

/** Persona con un ruolo qualsiasi nel titolo: usata per collegare i premiati a cast e troupe. */
export interface CreditPerson {
	id: number;
	name: string;
	profilePath: string | null;
	role: string;
}

/** Reparti TMDB nell'ordine in cui li mostriamo, con etichetta italiana. */
const DEPARTMENTS: { key: string; label: string }[] = [
	{ key: 'Directing', label: 'Regia' },
	{ key: 'Writing', label: 'Sceneggiatura' },
	{ key: 'Production', label: 'Produzione' },
	{ key: 'Camera', label: 'Fotografia' },
	{ key: 'Editing', label: 'Montaggio' },
	{ key: 'Sound', label: 'Musica e suono' },
	{ key: 'Art', label: 'Scenografia' },
	{ key: 'Costume & Make-Up', label: 'Costumi e trucco' },
	{ key: 'Visual Effects', label: 'Effetti visivi' },
	{ key: 'Lighting', label: 'Luci' },
	{ key: 'Crew', label: 'Troupe' },
	{ key: 'Creator', label: 'Ideazione' },
];

/** Traduzione delle mansioni più comuni; le altre restano in inglese. */
const JOBS_IT: Record<string, string> = {
	Director: 'Regista',
	'Co-Director': 'Coregista',
	'Assistant Director': 'Aiuto regista',
	'First Assistant Director': 'Primo aiuto regista',
	'Second Assistant Director': 'Secondo aiuto regista',
	'Script Supervisor': 'Segretario di edizione',
	Screenplay: 'Sceneggiatura',
	Writer: 'Sceneggiatore',
	Story: 'Soggetto',
	Novel: 'Romanzo',
	Characters: 'Personaggi',
	Author: 'Autore',
	'Original Story': 'Soggetto originale',
	Teleplay: 'Sceneggiatura TV',
	'Executive Story Editor': 'Story editor esecutivo',
	'Story Editor': 'Story editor',
	Creator: 'Ideatore',
	Producer: 'Produttore',
	'Executive Producer': 'Produttore esecutivo',
	'Co-Producer': 'Coproduttore',
	'Associate Producer': 'Produttore associato',
	'Co-Executive Producer': 'Coproduttore esecutivo',
	'Line Producer': 'Line producer',
	Casting: 'Casting',
	'Casting Director': 'Direttore del casting',
	'Production Manager': 'Direttore di produzione',
	'Unit Production Manager': 'Direttore di produzione',
	'Director of Photography': 'Direttore della fotografia',
	'Camera Operator': 'Operatore di macchina',
	'Steadicam Operator': 'Operatore steadicam',
	'Still Photographer': 'Fotografo di scena',
	Editor: 'Montatore',
	'Additional Editor': 'Montatore aggiuntivo',
	'Original Music Composer': 'Musiche originali',
	'Music': 'Musiche',
	Composer: 'Compositore',
	'Music Supervisor': 'Supervisore musicale',
	'Sound Designer': 'Sound designer',
	'Supervising Sound Editor': 'Supervisore montaggio sonoro',
	'Sound Re-Recording Mixer': 'Mixer del suono',
	'Production Sound Mixer': 'Fonico di presa diretta',
	'Sound Editor': 'Montatore del suono',
	'Production Design': 'Scenografia',
	'Production Designer': 'Scenografo',
	'Art Direction': 'Direzione artistica',
	'Supervising Art Director': 'Supervisore direzione artistica',
	'Set Decoration': 'Arredamento',
	'Set Designer': 'Set designer',
	'Costume Design': 'Costumi',
	'Costume Designer': 'Costumista',
	'Makeup Artist': 'Truccatore',
	'Makeup Department Head': 'Capo truccatore',
	'Hairstylist': 'Parrucchiere',
	'Visual Effects Supervisor': 'Supervisore effetti visivi',
	'Visual Effects Producer': 'Produttore effetti visivi',
	'Special Effects Supervisor': 'Supervisore effetti speciali',
	'Animation Supervisor': 'Supervisore animazione',
	Gaffer: 'Capo elettricista',
	'Lighting Technician': 'Tecnico luci',
	'Stunt Coordinator': 'Coordinatore stunt',
	Stunts: 'Stuntman',
	Choreographer: 'Coreografo',
};

export function translateJob(job: string): string {
	return JOBS_IT[job] ?? job;
}

function yearFrom(date?: string | null): string | null {
	return date && date.length >= 4 ? date.slice(0, 4) : null;
}

interface TmdbCastRaw {
	id: number;
	name: string;
	profile_path: string | null;
	character?: string;
	order?: number;
	roles?: { character: string; episode_count: number }[];
	total_episode_count?: number;
}

interface TmdbCrewRaw {
	id: number;
	name: string;
	profile_path: string | null;
	department: string;
	job?: string;
	jobs?: { job: string; episode_count: number }[];
	total_episode_count?: number;
}

function mapCast(raw: TmdbCastRaw[]): CastCredit[] {
	return [...raw]
		.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
		.map((c) => {
			const roles = c.roles?.map((r) => r.character).filter(Boolean) ?? [];
			return {
				id: c.id,
				name: c.name,
				profilePath: c.profile_path,
				role: roles.length ? Array.from(new Set(roles)).join(' / ') : c.character || '',
				episodes: c.total_episode_count ?? null,
			};
		});
}

function mapCrew(raw: TmdbCrewRaw[], creators: { id: number; name: string; profile_path: string | null }[]): CrewDepartment[] {
	const byDept = new Map<string, Map<number, CrewCredit>>();

	const add = (dept: string, person: { id: number; name: string; profile_path: string | null }, jobs: string[], episodes: number | null) => {
		const people = byDept.get(dept) ?? new Map<number, CrewCredit>();
		byDept.set(dept, people);
		const existing = people.get(person.id);
		if (existing) {
			for (const j of jobs) if (!existing.jobs.includes(j)) existing.jobs.push(j);
			if (episodes != null) existing.episodes = Math.max(existing.episodes ?? 0, episodes);
			return;
		}
		people.set(person.id, {
			id: person.id,
			name: person.name,
			profilePath: person.profile_path,
			jobs: Array.from(new Set(jobs)),
			episodes,
		});
	};

	for (const c of creators) add('Creator', c, ['Ideatore'], null);

	for (const c of raw) {
		const jobs = (c.jobs?.map((j) => j.job) ?? [c.job ?? '']).filter(Boolean).map(translateJob);
		add(c.department || 'Crew', c, jobs, c.total_episode_count ?? null);
	}

	const known = DEPARTMENTS.filter((d) => byDept.has(d.key)).map((d) => ({
		key: d.key,
		label: d.label,
		people: Array.from(byDept.get(d.key)!.values()),
	}));
	const others = Array.from(byDept.entries())
		.filter(([key]) => !DEPARTMENTS.some((d) => d.key === key))
		.map(([key, people]) => ({ key, label: key, people: Array.from(people.values()) }));

	return [...known, ...others].map((d) => ({
		...d,
		// Per le serie, prima chi ha lavorato a più episodi
		people: d.people.sort((a, b) => (b.episodes ?? 0) - (a.episodes ?? 0)),
	}));
}

/** Risolve un id IMDb (tt…) nell'id TMDB del film o della serie. */
export async function resolveTmdbId(id: string, mediaType: CreditsMediaType): Promise<number | null> {
	if (/^\d+$/.test(id)) return parseInt(id, 10);
	if (!TMDB_API_KEY || !/^tt\d+$/.test(id)) return null;
	try {
		const res = await fetch(`${BASE_URL}/find/${id}?api_key=${TMDB_API_KEY}&external_source=imdb_id`, {
			next: { revalidate: 86400 },
		});
		if (!res.ok) return null;
		const data = await res.json();
		const item = mediaType === 'movie' ? data.movie_results?.[0] : data.tv_results?.[0];
		return item?.id ?? null;
	} catch (e) {
		console.error('[Credits] Errore nella risoluzione dell\'id IMDb:', e);
		return null;
	}
}

/**
 * Cast e troupe completi. Per le serie usa `aggregate_credits`, che riunisce
 * tutte le stagioni con il numero di episodi di ciascuno.
 */
export async function getFullCredits(mediaType: CreditsMediaType, tmdbId: number, language = 'it-IT'): Promise<FullCredits | null> {
	if (!TMDB_API_KEY) return null;
	const append = mediaType === 'movie' ? 'credits' : 'aggregate_credits';
	try {
		const res = await fetch(
			`${BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=${append}&language=${language}`,
			{ next: { revalidate: 3600 } }
		);
		if (!res.ok) return null;
		const data = await res.json();
		const credits = data[append] ?? {};

		return {
			mediaType,
			tmdbId,
			title: data.title ?? data.name ?? '',
			poster: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
			year: yearFrom(data.release_date ?? data.first_air_date),
			cast: mapCast(credits.cast ?? []),
			crew: mapCrew(credits.crew ?? [], mediaType === 'tv' ? data.created_by ?? [] : []),
		};
	} catch (e) {
		console.error('[Credits] Errore nel recupero dei crediti:', e);
		return null;
	}
}

/** Elenco piatto di tutte le persone accreditate (cast prima della troupe). */
export function flattenCredits(credits: FullCredits): CreditPerson[] {
	const people = new Map<number, CreditPerson>();
	for (const c of credits.cast) {
		people.set(c.id, { id: c.id, name: c.name, profilePath: c.profilePath, role: c.role });
	}
	for (const dept of credits.crew) {
		for (const p of dept.people) {
			if (!people.has(p.id)) {
				people.set(p.id, { id: p.id, name: p.name, profilePath: p.profilePath, role: p.jobs.join(', ') });
			}
		}
	}
	return Array.from(people.values());
}
