# 🎬 CineScope - Movie & TV Shows Discovery Platform

<p align="center">
  <strong>Una piattaforma moderna e immersiva per scoprire film e serie TV</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.0.7-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS" />
</p>

---

## 📋 Indice

- [Panoramica](#-panoramica)
- [Funzionalità](#-funzionalità)
- [Stack Tecnologico](#-stack-tecnologico)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Installazione](#-installazione)
- [Configurazione](#-configurazione)
- [API Utilizzate](#-api-utilizzate)
- [Componenti](#-componenti)
- [Pagine](#-pagine)
- [Sviluppo](#-sviluppo)
- [Deploy](#-deploy)

---

## 🎯 Panoramica

**CineScope** è un'applicazione web moderna costruita con Next.js 16 che permette agli utenti di esplorare, cercare e scoprire film e serie TV. L'interfaccia utente presenta un design cinematografico immersivo con tema scuro, effetti glassmorphism, e animazioni fluide.

### Caratteristiche Principali

- 🎥 **Homepage Immersiva** con sezione hero a schermo intero
- 🔍 **Ricerca Avanzata** con overlay a tutto schermo e ricerca in tempo reale
- 📺 **Catalogo Film & Serie TV** con caroselli navigabili
- 🎬 **Pagine Dettaglio** con informazioni complete su cast, rating e trailer
- 📱 **Design Responsive** ottimizzato per tutti i dispositivi
- ⚡ **Server Components** per prestazioni ottimali

---

## ✨ Funzionalità

Interfaccia "Nativa" (ispirata ad Apple TV / Letterboxd) in tema **chiaro e scuro**, con accento ambra e navigazione ridotta: header con pill **Home · Film · Serie TV · Esplora** su desktop, tab bar in vetro **Home · Esplora · Timeline · Tracker · Profilo** su mobile.

### 🏠 Home
- Hero a carosello con i primi 3 titoli di tendenza (autoplay 8s, pausa al passaggio del mouse)
- **Prossimi episodi** dal tracker, con pulsante "visto" rapido
- **Incluso nei tuoi abbonamenti** (Netflix, Prime Video, Disney+, NOW, Apple TV+) con filtro per servizio
- **Classifica della settimana**, **Al cinema**, **Serie popolari**

### 🔎 Ricerca
- Modale da header (anche con ⌘K / Ctrl+K), filtri Tutto · Film · Serie TV · Persone
- Su mobile la ricerca è nella tab **Esplora**, insieme al catalogo

### 🎬 Schede Film e Serie
- Hero con voti IMDb / Rotten Tomatoes / Metacritic / TMDB e azioni (Trailer, Watchlist, Preferito, Lista, Tracker)
- Tab sticky: Panoramica · Premi · Recensioni · Simili (film), Episodi · Panoramica · Cast · Simili (serie)
- Colonna "Dove guardarlo" (JustWatch) e "Il tuo voto"
- Serie: stagioni e episodi da spuntare direttamente nella pagina, riquadro "Prossimo episodio"

### 📚 Catalogo, Timeline, Tracker, Profilo, Notizie
- `/catalogo/[list]` unico per Di tendenza, Più votati, Al cinema, In uscita con `?type=movie|tv&genre=`
- Timeline della settimana delle serie seguite, filtrabile per giorno
- Tracker con statistiche e progressi (In corso · Da iniziare · Completate)
- Profilo con Watchlist, Preferiti, Liste e Voti; impostazioni per tema, lingua dei contenuti, feed RSS e logout
- Notizie dai feed RSS dell'utente

---

## 🛠 Stack Tecnologico

| Tecnologia | Versione | Descrizione |
|------------|----------|-------------|
| **Next.js** | 16.0.7 | Framework React con App Router |
| **React** | 19.2.0 | Libreria UI |
| **TypeScript** | 5.x | Tipizzazione statica |
| **Tailwind CSS** | 4.x | Framework CSS utility-first |
| **Lucide React** | 0.555.0 | Libreria di icone |

### Font
- **Figtree** (400–800) via `next/font/google`, unica famiglia per titoli e testo

---

## 📁 Struttura del Progetto

```
movie-ratings/
├── app/
│   ├── (main)/                    # Route group con layout condiviso
│   │   ├── catalogo/[list]/      # Catalogo unico (liste × tipo × genere)
│   │   ├── esplora/              # Ricerca + catalogo (mobile)
│   │   ├── movie/[id]/           # Scheda film
│   │   ├── tv/[id]/              # Scheda serie con episodi
│   │   ├── timeline/             # Episodi della settimana
│   │   ├── tracker/              # Progressi delle serie
│   │   ├── profile/              # Profilo, liste, feed RSS
│   │   ├── history/              # Cronologia
│   │   └── news/                 # Notizie RSS
│   ├── api/                      # API Routes (ricerca, tracker, liste…)
│   ├── actions.ts                # Server Actions
│   ├── globals.css               # Design token (chiaro/scuro) e utility
│   ├── layout.tsx                # Root layout (tema, font, provider)
│   └── page.tsx                  # Home
│
├── components/
│   ├── ui/                       # Primitive: Artwork, Segmented, PageShell, PageHeader, StatCard, HScroll…
│   ├── home/                     # Hero carosello e righe della Home
│   ├── detail/                   # Hero, tab, episodi, "Dove guardarlo" delle schede
│   ├── catalog/                  # Griglia e filtri del catalogo, ricerca di Esplora
│   ├── timeline/ tracker/ news/ profile/
│   ├── Navbar.tsx                # Header desktop con popover Esplora
│   ├── MobileTabBar.tsx          # Tab bar mobile
│   ├── SearchOverlay.tsx         # Modale di ricerca (⌘K)
│   ├── MovieCard.tsx             # Poster con badge voto/servizio
│   └── PersonCard.tsx / PersonModal.tsx
│
├── lib/
│   ├── omdb.ts                   # Client API OMDb
│   ├── tmdb.ts                   # Client API TMDb
│   ├── tmdb-catalog.ts           # Catalogo e titoli inclusi negli abbonamenti
│   ├── tmdb-shows.ts             # Progressi serie, episodi, calendario
│   └── progress.ts / format.ts   # Calcolo progressi e formattazione (it-IT)
│
├── public/                       # Asset statici
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── .env.local                    # Variabili d'ambiente (locale)
├── .gitignore
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── README.md
└── tsconfig.json
```

---

## 🚀 Installazione

### Prerequisiti

- **Node.js** 18.x o superiore
- **npm**, **yarn**, **pnpm** o **bun**

### Passaggi

1. **Clona il repository**
   ```bash
   git clone <repository-url>
   cd movie-ratings
   ```

2. **Installa le dipendenze**
   ```bash
   npm install
   # oppure
   yarn install
   # oppure
   pnpm install
   ```

3. **Configura le variabili d'ambiente** (vedi sezione [Configurazione](#-configurazione))

4. **Avvia il server di sviluppo**
   ```bash
   npm run dev
   ```

5. **Apri il browser** su [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Configurazione

### Variabili d'Ambiente

Crea un file `.env.local` nella root del progetto con le seguenti variabili:

```env
# TMDb API - The Movie Database
TMDB_API_KEY=your_tmdb_api_key_here

# OMDb API - Open Movie Database  
OMDB_API_KEY=your_omdb_api_key_here
```

### Come Ottenere le API Key

#### TMDb API
1. Registrati su [TMDb](https://www.themoviedb.org/signup)
2. Vai su **Settings** → **API**
3. Richiedi una API key

#### OMDb API
1. Registrati su [OMDb API](http://www.omdbapi.com/apikey.aspx)
2. Scegli il piano (disponibile piano gratuito)
3. Riceverai la key via email

---

## 🔌 API Utilizzate

### TMDb (The Movie Database)

**Base URL:** `https://api.themoviedb.org/3`

| Endpoint | Funzione | Descrizione |
|----------|----------|-------------|
| `/find/{imdb_id}` | `getMovieTrailer()` | Trova contenuto da IMDb ID |
| `/search/person` | `getPersonDetails()` | Cerca dettagli persona |
| `/person/{id}/combined_credits` | `getPersonCredits()` | Credits di una persona |
| `/discover/movie` | `getDiscoverMovies()` | Film popolari paginati |
| `/discover/tv` | `getTVShows()` | Serie TV popolari paginate |
| `/movie/upcoming` | `getUpcomingMovies()` | Film in uscita |
| `/movie/{id}` | `getMovieDetailTMDb()` | Dettaglio singolo film |
| `/movie/{id}/videos` | `getMovieTrailerTMDb()` | Video/trailer del film |
| `/tv/{id}` | `getTVDetailTMDb()` | Dettaglio serie TV |
| `/tv/{id}/videos` | `getTVTrailerTMDb()` | Video/trailer serie TV |

### OMDb (Open Movie Database)

**Base URL:** `http://www.omdbapi.com`

| Parametro | Funzione | Descrizione |
|-----------|----------|-------------|
| `s={query}` | `searchMovies()` | Ricerca per titolo |
| `i={imdbId}` | `getMovieDetail()` | Dettaglio da IMDb ID |

---

## 🧩 Componenti

### Componenti principali

| Componente | Descrizione |
|------------|-------------|
| `Navbar` | Logo, pill Home · Film · Serie TV · Esplora, ricerca, tema, avatar |
| `MobileTabBar` | Tab bar in vetro sotto i 768px |
| `SearchOverlay` | Ricerca TMDB `search/multi` con debounce 250ms e filtri |
| `HeroCarousel` | Hero della Home con autoplay |
| `DetailHero` / `DetailTabs` | Hero e tab sticky delle schede film/serie |
| `SeasonEpisodes` / `NextEpisodeBox` | Episodi da spuntare e prossimo episodio |
| `WhereToWatch` / `UserRating` | Disponibilità JustWatch e voto dell'utente |
| `MovieCard` | Poster 2:3 con badge in vetro (voto, servizio) |
| `ui/Segmented` | Segmented control, chip e tab sottolineati |
| `ui/Artwork` | Immagine TMDB con placeholder a righe |

---

## 📄 Pagine

### Routes Principali

| Route | File | Descrizione |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home |
| `/catalogo/[list]` | `app/(main)/catalogo/[list]/page.tsx` | Catalogo (`trending`, `top-rated`, `now-playing`, `upcoming`) |
| `/esplora` | `app/(main)/esplora/page.tsx` | Ricerca + catalogo (tab mobile) |
| `/movie/[id]` | `app/(main)/movie/[id]/page.tsx` | Scheda film |
| `/tv/[id]` | `app/(main)/tv/[id]/page.tsx` | Scheda serie con episodi |
| `/timeline` | `app/(main)/timeline/page.tsx` | Episodi della settimana |
| `/tracker` | `app/(main)/tracker/page.tsx` | Progressi delle serie |
| `/profile` | `app/(main)/profile/page.tsx` | Profilo e libreria (`?tab=watchlist\|preferiti\|liste\|voti`) |
| `/news` | `app/(main)/news/page.tsx` | Notizie dai feed RSS |

Le vecchie URL (`/trending`, `/movies`, `/tv`, `/top-rated`, `/now-playing`, `/new-releases`, `/discovery`, `/tv/following`, `/profile/watchlist`, `/profile/favorites`, `/profile/lists`) reindirizzano alle nuove pagine (`next.config.ts`).

### API Routes

| Route | Metodo | Descrizione |
|-------|--------|-------------|
| `/api/search` | GET | Ricerca film/serie con `?q=query` |

---

## 💻 Sviluppo

### Scripts Disponibili

```bash
# Avvia server di sviluppo
npm run dev

# Build per produzione
npm run build

# Avvia server di produzione
npm run start

# Esegui linting
npm run lint
```

### Design System

Il progetto utilizza un design system definito in `globals.css`:

#### Token (`app/globals.css`)
I colori sono variabili CSS su `:root` (chiaro) e `.dark` (scuro), esposte a Tailwind come `bg-bg`, `bg-bg2`, `bg-card`, `text-fg`, `text-fg2`, `text-fg3`, `border-line`, `bg-acc`, `text-accfg`, `bg-acc-soft`, `bg-ph1`, `bg-ph2`.

```css
--bg: #0e0e10 / #f5f5f3;      /* sfondo pagina (scuro / chiaro) */
--card: #18181b / #ffffff;    /* card e pannelli */
--acc: oklch(0.78 0.15 70) / oklch(0.68 0.16 70); /* ambra */
```

L'accento si cambia con `--acc-hue` (70 Ambra, 50 Arancio, 28 Rosso). Il tema è gestito da `next-themes` (classe `dark` su `<html>`, default = preferenza di sistema).

#### Classi Utility
- `glass` - vetro di header, tab bar e badge
- `glass-on-image` - pulsanti sopra le immagini
- `hero-fade` / `hero-fade-strong` - sfumatura del backdrop verso lo sfondo
- `placeholder-stripes` - skeleton delle immagini
- `kicker`, `no-scrollbar`, `animate-fade-in`, `animate-pop-in`

### Path Aliases

Configurato in `tsconfig.json`:
```json
{
  "paths": {
    "@/*": ["./*"]
  }
}
```

Utilizzo:
```tsx
import { getMovieDetail } from '@/lib/omdb';
import MovieCard from '@/components/MovieCard';
```

---

## 🚀 Deploy

### Vercel (Consigliato)

Il modo più semplice per deployare è usare [Vercel](https://vercel.com):

1. Collega il repository a Vercel
2. Configura le variabili d'ambiente in Vercel Dashboard
3. Deploy automatico ad ogni push

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Build Manuale

```bash
# Build
npm run build

# Start server produzione
npm run start
```

### Variabili d'Ambiente in Produzione

Assicurati di configurare le seguenti env vars nel tuo hosting:

- `TMDB_API_KEY`
- `OMDB_API_KEY`

---

## 📚 Risorse Aggiuntive

- [Next.js Documentation](https://nextjs.org/docs)
- [TMDb API Documentation](https://developers.themoviedb.org/3)
- [OMDb API Documentation](http://www.omdbapi.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/icons)

---

## 📝 Licenza

Questo progetto è privato.

---

<p align="center">
  Made with ❤️ using Next.js
</p>
