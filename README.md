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

### 🏠 Homepage
- **Hero Section** dinamica con il film trending del momento
- **Caroselli interattivi** per:
  - Trending Movies
  - Popular TV Shows  
  - New Releases
- Pulsante "Watch Trailer" per visualizzare i trailer in modal
- Link "More Info" per accedere ai dettagli

### 🔎 Sistema di Ricerca
- Overlay di ricerca a tutto schermo attivabile dalla navbar
- Ricerca debounced per ottimizzare le chiamate API
- Risultati in tempo reale con poster, tipo e descrizione
- Chiusura con tasto ESC o click sul pulsante close

### 🎬 Pagina Dettaglio Film
- Backdrop blur immersivo con poster del film
- Informazioni dettagliate: titolo, anno, durata, rating IMDb
- Sinossi completa
- Box Office e Rotten Tomatoes (quando disponibili)
- Sezione Cast & Crew con foto degli attori
- Pulsante per riprodurre il trailer

### 📺 Pagina Dettaglio Serie TV
- Layout simile ai film con adattamenti specifici
- Informazioni su: numero stagioni, episodi, status
- Elenco generi con badge stilizzati
- Nome dei creatori della serie

### 📄 Pagine Lista
- `/movies` - Tutti i film con paginazione "Load More"
- `/tv` - Tutte le serie TV con paginazione
- `/new-releases` - Film in uscita

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
- **Space Grotesk** - Font per titoli e heading
- **Inter** - Font per il body text

---

## 📁 Struttura del Progetto

```
movie-ratings/
├── app/
│   ├── (main)/                    # Route group con layout condiviso
│   │   ├── discovery/             # Pagina discovery
│   │   ├── movie/
│   │   │   └── [id]/             # Dettaglio film (dinamico)
│   │   │       └── page.tsx
│   │   ├── movies/               # Lista tutti i film
│   │   ├── new-releases/         # Film in uscita
│   │   ├── news/                 # Pagina news
│   │   └── tv/
│   │       ├── [id]/             # Dettaglio serie TV (dinamico)
│   │       │   └── page.tsx
│   │       └── page.tsx          # Lista serie TV
│   ├── api/
│   │   └── search/
│   │       └── route.ts          # API Route per la ricerca
│   ├── actions.ts                # Server Actions
│   ├── globals.css               # Stili globali e design tokens
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage
│
├── components/
│   ├── ConditionalLayout.tsx     # Layout condizionale
│   ├── HeroSection.tsx           # Sezione hero homepage
│   ├── InfiniteMovieGrid.tsx     # Griglia con caricamento infinito
│   ├── MovieCard.tsx             # Card singolo film/serie
│   ├── MovieCarousel.tsx         # Carosello orizzontale
│   ├── Navbar.tsx                # Barra di navigazione
│   ├── PersonCard.tsx            # Card attore/regista
│   ├── PlayButton.tsx            # Pulsante play
│   ├── SearchBar.tsx             # Barra di ricerca (legacy)
│   ├── SearchOverlay.tsx         # Overlay ricerca full-screen
│   ├── Sidebar.tsx               # Sidebar navigazione
│   ├── TrailerButton.tsx         # Pulsante per trailer
│   └── TrailerModal.tsx          # Modal video trailer
│
├── lib/
│   ├── omdb.ts                   # Client API OMDb
│   └── tmdb.ts                   # Client API TMDb
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

### Core Components

#### `HeroSection`
Sezione hero a tutto schermo con:
- Immagine backdrop in background con effetti gradient
- Titolo e rating del film
- Pulsanti "Watch Trailer" e "More Info"
- Animazioni di entrata

```tsx
<HeroSection item={heroMovie} />
```

#### `MovieCarousel`
Carosello orizzontale scorrevole:
- Titolo della sezione
- Controlli di navigazione left/right
- Link "View All" opzionale
- Snap scroll per mobile

```tsx
<MovieCarousel 
  title="Trending Movies" 
  movies={movies} 
  viewAllLink="/movies" 
/>
```

#### `MovieCard`
Card singola per film/serie:
- Poster con aspect ratio 2:3
- Badge rating con colore dinamico
- Hover effects con scale e glow
- Link alla pagina dettaglio

#### `SearchOverlay`
Overlay ricerca full-screen:
- Input con icona di ricerca
- Debounce 350ms sulle query
- Griglia risultati responsive
- Chiusura con ESC o click

#### `Navbar`
Barra navigazione sticky:
- Logo CineScope con gradient
- Links navigazione desktop
- Menu hamburger mobile
- Pulsanti search e notifiche
- Effetto blur on scroll

#### `TrailerModal`
Modal per riproduzione trailer:
- Embed YouTube responsive
- Chiusura con click esterno o X
- Backdrop blur

### UI Components

| Componente | Descrizione |
|------------|-------------|
| `PersonCard` | Card attore con foto da TMDb |
| `TrailerButton` | Pulsante styled per aprire trailer |
| `PlayButton` | Pulsante play circolare |
| `InfiniteMovieGrid` | Griglia con infinite scroll |

---

## 📄 Pagine

### Routes Principali

| Route | File | Descrizione |
|-------|------|-------------|
| `/` | `app/page.tsx` | Homepage con hero e caroselli |
| `/movies` | `app/(main)/movies/page.tsx` | Lista film paginata |
| `/tv` | `app/(main)/tv/page.tsx` | Lista serie TV paginata |
| `/movie/[id]` | `app/(main)/movie/[id]/page.tsx` | Dettaglio film |
| `/tv/[id]` | `app/(main)/tv/[id]/page.tsx` | Dettaglio serie TV |
| `/new-releases` | `app/(main)/new-releases/page.tsx` | Film in uscita |
| `/discovery` | `app/(main)/discovery/page.tsx` | Pagina discovery |

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

#### Colori Principali
```css
--background: #050505;       /* Sfondo principale */
--foreground: #ffffff;       /* Testo principale */
--primary: #6366f1;          /* Accent primario (indigo) */
--secondary: #a855f7;        /* Accent secondario (purple) */
--surface-1: #0f0f12;        /* Surface scura */
--surface-2: #18181b;        /* Surface chiara */
```

#### Classi Utility
- `.glass-panel` - Effetto glassmorphism
- `.text-gradient` - Testo con gradient bianco/grigio
- `.text-gradient-primary` - Testo con gradient primary/secondary
- `.animate-fade-in` - Animazione fade in
- `.animate-slide-up` - Animazione slide up

#### Transizioni
```css
--transition-fast: 200ms cubic-bezier(0.16, 1, 0.3, 1);
--transition-smooth: 400ms cubic-bezier(0.16, 1, 0.3, 1);
```

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
