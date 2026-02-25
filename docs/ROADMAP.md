# 🗺️ CineScope - Roadmap di Sviluppo

Questo documento delinea la roadmap per i futuri sviluppi, ottimizzazioni e risoluzione del debito tecnico di **CineScope**.
L'analisi è basata sulla codebase attuale, le integrazioni API (TMDb, OMDb, Supabase) e lo stack tecnologico (Next.js 16, App Router).

## 🚀 Fase 1: Sicurezza, Stabilità e Core UX (Priorità Alta)

### 1. Sicurezza e Supabase Integration (API & Auth)
- **Ottimizzazione Server Clients**: Attualmente alcune API (es. `/api/tracker`) utilizzano `createAdminClient()` (Service Role) bypassando per necessità le policies RLS di Supabase.
  - *Azione*: Valutare la migrazione delle route API per utilizzare il client standard autenticato delegando interamente la sicurezza alle Row Level Security (RLS) di Supabase, riducendo l'uso della chiave Service Role.
- **Sicurezza Auth Cookie**: Assicurarsi che i cookie di sessione (`sb-auth-token`) mantengano i criteri di sicurezza in produzione (`HttpOnly`, `Secure` over HTTPS) per mitigare rischi XSS.

### 2. Testing Framework (Critico)
- **Unit & Component Testing**: Configurazione di **Vitest** + **React Testing Library** per testare i componenti UI isolati e le funzioni di utility (es. le chiamate di fetch in `lib/tmdb.ts`).
- **End-to-End (E2E) Testing**: Aggiunta di framework come **Playwright** per collaudare i flussi di navigazione critici (Autenticazione, Ricerca, Aggiunta alle Liste e Watchlist).

### 3. Error Handling e Resilienza (API)
- **Gestione Centralizzata Errori**: Le pipeline API attuali prevedono blocchi catch laconici che mascherano gli errori restituendo `null` o arry vuoti.
  - *Azione*: Implementare `error.tsx` ed *Error Boundaries* globali nella UI. Ritornare corretti status code (400, 401, 500) dalle API Next.js informando l'utente o il logger.
- **Rate Limiting**: Sviluppare meccanismi di throttling/caching (Next.js `unstable_cache` o Redis) per rispettare i severi limiti di richieste posti da TMDb (40 req/10s).

### 4. Ottimizzazione Asset e Performance
- **Media Optimization**: È prioritario rimpiazzare tutti i marcatori `<img>` nativi con il componente `<Image>` di Next.js per beneficiare del formato ottimizzato (WebP/AVIF), del lazy-loading nativo e dei blur data-url (da implementare su `MovieCard.tsx`, `HeroSection.tsx`).
- **Performance Dati**: Evitare i rallentamenti a "cascata" (waterfall) nella pagina Profilo (5 chiamate consecutive) unificando le promise in un unico `Promise.all()` o creando un singolo endpoint aggregato GraphQL/REST.

---

## 🏗️ Fase 2: Nuove Funzionalità (Priorità Media)

### 1. Arricchimento della "Discovery"
- **Filtri Avanzati**: Sviluppare una sidebar di filtri per scovare i film mediante: *Genere*, *Anno di uscita*, *Media Voti* e *Ordinamento*. Il backend supporta già nativamente questi parametri via query string TMDb.
- **Pagine Personaggio/Attore**: Attivare la route dinamica dedicata in `/app/(main)/person/[id]` (che userà la funzione `getPersonDetailsById` già creata) per ospitare bio estese e filmografie complete del Cast.

### 2. Architettura UI ed Accessibilità
- **Loading States Visivi (Skeleton)**: Sostituire i componenti transitori (spesso spinner asincroni o spazi vuoti) con *Skeleton Loaders* uniformi che replicano la silhouette delle card, riducendo i salti di layout.
- **A11y (Accessibilità)**:
  - Definizione massiva di descrittori `aria-label` ai controlli bottoni, modali e input.
  - Inserimento di *Focus Traps* efficaci (fondamentali nei `TrailerModal` e nel `SearchOverlay`).
  - Accessibilità da tastiera abilitata per scorrere i vari caroselli orizzontali in homepage.

### 3. Traduzioni (i18n) e Consistenza
- Completare il passaggio al `LanguageContext` sostituendo tutte le etichette di testo ancora scritte brutalmente "hardcoded" nel codice (come i link in `Navbar.tsx` e bottoni vari).

---

## 🌟 Fase 3: Modernizzazione e "Nice to Have" (Lungo Termine)

### 1. Progressive Web App (PWA)
- Sviluppare un `manifest.json` ed integrare un Service Worker (es. via `next-pwa`) per offrire un'esperienza "App-like" sul mobile e caching di base per navigazione offline o su connessioni degradate.

### 2. Condivisione Social e Notifiche
- Integrare la **Web Share API** dei browser sui dettagli del film per consentire invii agevoli via mobile (WhatsApp, Twitter, ecc.).
- Attivare il pulsante Notifiche (attualmente inattivo sulla barra) per aggiornare l'utente riguardo nuove uscite nella sua Watchlist.

### 3. Ripianamento del Debito Tecnico
- **Strict Typing TS**: Rimozione programmatica delle quasi 30 occorrenze di `any` nei file lib, implementando interfacce TypeScript rigide.
- Scansione periodica del **Bundle Size** tramite analyzer, separando i bundle JS tramite component level code-splitting per tagliare il tempo di TTI (Time to Interactive).

---
*Roadmap generata su analisi della codebase - Q1 2025*
