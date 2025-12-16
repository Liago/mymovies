# Analisi Funzionalità - CineScope

> **Documento di analisi tecnica** per l'identificazione di funzionalità mancanti, miglioramenti e ottimizzazioni.
> Data: Dicembre 2024

---

## Sommario

1. [Panoramica Progetto](#panoramica-progetto)
2. [Funzionalità Mancanti](#funzionalità-mancanti)
3. [Miglioramenti Necessari](#miglioramenti-necessari)
4. [Ottimizzazioni Performance](#ottimizzazioni-performance)
5. [Problemi di Accessibilità](#problemi-di-accessibilità)
6. [Debito Tecnico](#debito-tecnico)
7. [Roadmap Priorità](#roadmap-priorità)

---

## Panoramica Progetto

**CineScope** è un'applicazione web moderna costruita con:
- Next.js 16.0.10 (App Router)
- React 19.2.0
- Tailwind CSS 4
- TypeScript 5
- Integrazione API: TMDb + OMDb

### Funzionalità Attuali
- Navigazione film/serie TV
- Autenticazione OAuth TMDb
- Favoriti, Watchlist, Liste personalizzate
- Ricerca debounced
- Pagine dettaglio con trailer e recensioni
- Supporto multilingua (IT/EN)
- Design responsive con glassmorphism

---

## Funzionalità Mancanti

### 1. Pagina News - NON IMPLEMENTATA
| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `app/(main)/news/page.tsx` |
| **Stato** | Placeholder "Coming Soon" |
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Descrizione** | La pagina mostra solo un messaggio statico. Mancano: feed notizie cinema, integrazione API news, aggregazione contenuti |
| **Suggerimento** | Integrare API come NewsAPI, TMDB Changes, o feed RSS di siti cinema |

---

### 2. Testing - COMPLETAMENTE ASSENTE
| Aspetto | Dettaglio |
|---------|-----------|
| **Stato** | Nessun framework configurato |
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Critica |
| **Descrizione** | Mancano completamente: unit test, integration test, E2E test. Nessun file di configurazione Jest/Vitest/Playwright |
| **Suggerimento** | Configurare Vitest + React Testing Library per unit test, Playwright per E2E |

---

### 3. Filtri Avanzati nella Discovery
| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `app/(main)/discovery/page.tsx` |
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Alta |
| **Descrizione** | La pagina Discovery non ha filtri. Mancano: filtro per genere, anno, valutazione, ordinamento, regione |
| **Suggerimento** | Implementare sidebar filtri con URL params per SEO. Le API TMDb supportano già `with_genres`, `year`, `vote_average.gte`, `sort_by` |

---

### 4. Pagina Dettaglio Persona/Attore
| Aspetto | Dettaglio |
|---------|-----------|
| **Stato** | Non esiste route `/person/[id]` |
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Descrizione** | Le PersonCard linkano a una pagina che non esiste. La funzione `getPersonDetailsById` è implementata ma non usata in una pagina dedicata |
| **Suggerimento** | Creare `app/(main)/person/[id]/page.tsx` con biografia, filmografia, gallery foto |

---

### 5. Paginazione per Preferiti/Watchlist
| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `app/(main)/profile/favorites/page.tsx`, `watchlist/page.tsx` |
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Descrizione** | Non c'è paginazione. Utenti con molti contenuti vedranno performance degradate |
| **Suggerimento** | Implementare infinite scroll o paginazione classica con `page` param |

---

### 6. Notifiche - NON FUNZIONANTE
| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `components/Navbar.tsx:106-109` |
| **Priorità** | 🟢 Bassa |
| **Importanza** | 🟡 Media |
| **Descrizione** | Icona campanella presente con badge rosso, ma nessuna funzionalità implementata |
| **Suggerimento** | Rimuovere se non si intende implementare, oppure aggiungere sistema notifiche per nuove uscite/aggiornamenti |

---

### 7. PWA / Modalità Offline
| Aspetto | Dettaglio |
|---------|-----------|
| **Stato** | Non configurato |
| **Priorità** | 🟢 Bassa |
| **Importanza** | 🟢 Bassa |
| **Descrizione** | Manca service worker, manifest.json per PWA, supporto offline |
| **Suggerimento** | Usare `next-pwa` per caching automatico e esperienza app-like |

---

### 8. Cronologia Visualizzazioni
| Aspetto | Dettaglio |
|---------|-----------|
| **Stato** | Non implementato |
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Descrizione** | Non c'è tracciamento di cosa l'utente ha già visto |
| **Suggerimento** | Salvare history locale (localStorage) o su account TMDB se supportato |

---

### 9. Condivisione Social
| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `app/(main)/movie/[id]/page.tsx` |
| **Priorità** | 🟢 Bassa |
| **Importanza** | 🟢 Bassa |
| **Descrizione** | Mancano pulsanti share per social media |
| **Suggerimento** | Aggiungere Web Share API con fallback per Twitter, Facebook, WhatsApp |

---

### 10. Stagioni/Episodi per Serie TV
| Aspetto | Dettaglio |
|---------|-----------|
| **File** | `app/(main)/tv/[id]/page.tsx` |
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Alta |
| **Descrizione** | Le pagine TV mostrano solo info generali. Manca visualizzazione stagioni, lista episodi, tracking episodi visti |
| **Suggerimento** | Implementare accordion stagioni con `GET /tv/{id}/season/{season_number}` |

---

## Miglioramenti Necessari

### 1. Gestione Errori Centralizzata
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Critica |
| **Problema** | Errori API gestiti con `console.error` e return vuoti. Nessun feedback utente |
| **File Esempio** | `lib/tmdb.ts` - tutti i catch ritornano `[]` o `null` silenziosamente |
| **Suggerimento** | Implementare Error Boundaries, toast notifications, pagine errore personalizzate |

---

### 2. Loading States Consistenti
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Problema** | Loading states inconsistenti tra componenti. Alcuni usano spinner, altri skeleton, altri nulla |
| **Suggerimento** | Creare componenti Skeleton riusabili per MovieCard, PersonCard, pagine |

---

### 3. Ottimizzazione Immagini
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Alta |
| **Problema** | Uso di `<img>` nativo invece di `next/image` in molti componenti |
| **File** | `MovieCard.tsx:24`, `HeroSection.tsx`, `discovery/page.tsx:32` |
| **Suggerimento** | Sostituire con `Image` di Next.js per lazy loading automatico, ottimizzazione formato, placeholder blur |

---

### 4. Traduzioni Incomplete
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Problema** | Molte stringhe hardcoded in italiano nel codice invece di usare il sistema i18n |
| **File** | `Navbar.tsx:149-181` - testi menu in italiano hardcoded |
| **Suggerimento** | Centralizzare tutte le traduzioni in `LanguageContext`, usare chiavi invece di stringhe |

---

### 5. SEO e Metadata
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Alta |
| **Problema** | Mancano metadata dinamici per pagine dettaglio |
| **File** | `app/(main)/movie/[id]/page.tsx` |
| **Suggerimento** | Implementare `generateMetadata()` per ogni pagina con title, description, Open Graph, Twitter cards |

---

### 6. Sicurezza Cookie
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Importanza** | 🔴 Alta |
| **Problema** | `tmdb_user` cookie non è httpOnly, espone dati utente a XSS |
| **File** | `api/auth/tmdb/callback/route.ts` |
| **Suggerimento** | Minimizzare dati in cookie client-readable, o usare session server-side |

---

### 7. Rate Limiting API
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Problema** | Nessuna gestione rate limiting per chiamate TMDB (40 req/10s limit) |
| **Suggerimento** | Implementare caching con revalidazione, request queuing, retry con backoff |

---

### 8. Ricerca - Routing Errato per TV
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Alta |
| **Problema** | `SearchOverlay.tsx:141` - tutti i risultati linkano a `/movie/{id}` anche le serie TV |
| **Suggerimento** | Usare `/${result.type}/${result.id}` per routing corretto |

---

### 9. Play Button Non Funzionante
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Importanza** | 🟡 Media |
| **Problema** | `MovieCard.tsx:40-45` - play button con placeholder vuoto |
| **Suggerimento** | Collegare a TrailerModal o rimuovere se non necessario |

---

### 10. Back Navigation Hardcoded
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟢 Bassa |
| **Importanza** | 🟢 Bassa |
| **Problema** | `movie/[id]/page.tsx:66-72` - link "Back to Discovery" hardcoded |
| **Suggerimento** | Usare `router.back()` o salvare referrer per navigazione intelligente |

---

## Ottimizzazioni Performance

### 1. Bundle Size
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Suggerimento** | Analizzare con `@next/bundle-analyzer`, lazy load componenti pesanti |

### 2. API Calls Duplicate
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Problema** | Pagina profilo fa 5 chiamate API separate in waterfall |
| **File** | `profile/page.tsx:53-57` |
| **Suggerimento** | Usare `Promise.all()` o endpoint aggregato |

### 3. Caching Server Actions
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🔴 Alta |
| **Problema** | Server actions non usano cache Next.js |
| **Suggerimento** | Aggiungere `unstable_cache` o `revalidate` appropriato |

### 4. Font Loading
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟢 Bassa |
| **Suggerimento** | Usare `next/font` per Space Grotesk e Inter |

---

## Problemi di Accessibilità

### 1. Attributi ARIA Mancanti
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🔴 Alta |
| **Importanza** | 🔴 Alta |
| **Problema** | Molti elementi interattivi senza label accessibili |
| **Esempi** | MovieCard click handler, dropdown menu, rating buttons |

### 2. Contrasto Colori
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Problema** | Testo `text-zinc-500` su sfondo nero può non rispettare WCAG AA |

### 3. Focus Management
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Problema** | Focus trap assente nei modal (TrailerModal, SearchOverlay) |

### 4. Skip Navigation
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Problema** | Manca link "Skip to content" per utenti screen reader |

### 5. Keyboard Navigation
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🔴 Alta |
| **Problema** | Carousel non navigabile con tastiera |

---

## Debito Tecnico

### 1. Type Safety
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Problema** | Uso frequente di `any` type |
| **File** | `lib/tmdb.ts` - 30+ occorrenze di `any` |
| **Suggerimento** | Definire interfacce per tutte le response API |

### 2. Duplicazione Traduzioni
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟡 Media |
| **Problema** | Traduzioni duplicate in `LanguageContext.tsx` e `profile/page.tsx` |
| **Suggerimento** | Centralizzare in file JSON separati |

### 3. Componenti Legacy
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟢 Bassa |
| **Problema** | `SearchBar.tsx` e `Sidebar.tsx` sembrano inutilizzati |
| **Suggerimento** | Verificare e rimuovere se non necessari |

### 4. Console Logs
| Aspetto | Dettaglio |
|---------|-----------|
| **Priorità** | 🟢 Bassa |
| **Problema** | Molti `console.error` e `console.warn` in produzione |
| **Suggerimento** | Usare logger strutturato o rimuovere in build production |

---

## Roadmap Priorità

### Fase 1 - Critici (Immediato)
| # | Task | Priorità | Importanza |
|---|------|----------|------------|
| 1 | Configurare testing framework (Vitest) | 🔴 Alta | 🔴 Critica |
| 2 | Fix routing ricerca (TV vs Movie) | 🔴 Alta | 🔴 Alta |
| 3 | Sostituire `<img>` con `next/image` | 🔴 Alta | 🔴 Alta |
| 4 | Implementare gestione errori centralizzata | 🔴 Alta | 🔴 Critica |
| 5 | Aggiungere metadata SEO dinamici | 🔴 Alta | 🔴 Alta |

### Fase 2 - Importanti (Breve Termine)
| # | Task | Priorità | Importanza |
|---|------|----------|------------|
| 6 | Implementare filtri Discovery | 🔴 Alta | 🔴 Alta |
| 7 | Creare pagina stagioni/episodi TV | 🔴 Alta | 🔴 Alta |
| 8 | Migliorare accessibilità (ARIA, focus) | 🔴 Alta | 🔴 Alta |
| 9 | Aggiungere caching API | 🔴 Alta | 🟡 Media |
| 10 | Correggere sicurezza cookie | 🟡 Media | 🔴 Alta |

### Fase 3 - Miglioramenti (Medio Termine)
| # | Task | Priorità | Importanza |
|---|------|----------|------------|
| 11 | Creare pagina persona/attore | 🟡 Media | 🟡 Media |
| 12 | Implementare paginazione profilo | 🟡 Media | 🟡 Media |
| 13 | Centralizzare e completare traduzioni | 🟡 Media | 🟡 Media |
| 14 | Creare skeleton loaders consistenti | 🟡 Media | 🟡 Media |
| 15 | Aggiungere cronologia visualizzazioni | 🟡 Media | 🟡 Media |

### Fase 4 - Nice to Have (Lungo Termine)
| # | Task | Priorità | Importanza |
|---|------|----------|------------|
| 16 | Implementare pagina News | 🟡 Media | 🟡 Media |
| 17 | Configurare PWA | 🟢 Bassa | 🟢 Bassa |
| 18 | Aggiungere condivisione social | 🟢 Bassa | 🟢 Bassa |
| 19 | Implementare notifiche | 🟢 Bassa | 🟡 Media |
| 20 | Cleanup codice legacy | 🟢 Bassa | 🟢 Bassa |

---

## Legenda Priorità/Importanza

| Simbolo | Significato |
|---------|-------------|
| 🔴 Alta/Critica | Necessario per produzione, impatta UX/sicurezza |
| 🟡 Media | Migliora significativamente l'esperienza |
| 🟢 Bassa | Nice to have, può essere differito |

---

## Note Finali

Il progetto CineScope ha una **base solida** con architettura moderna e design accattivante. I punti critici da affrontare prioritariamente sono:

1. **Testing** - Fondamentale per manutenibilità
2. **Gestione errori** - UX attualmente silenziosa su errori
3. **SEO** - Necessario per visibilità
4. **Accessibilità** - Requisito legale in molti paesi

La roadmap proposta permette di affrontare i problemi in ordine di impatto, garantendo miglioramenti incrementali senza bloccare lo sviluppo di nuove funzionalità.
