# 🎯 Implementazione Lists & TMDB Sync - Checkpoint

##  Stato Attuale

### ✅ Completato

1. **Schema Database Extended**
   - File: `supabase-migration-extended.sql`
   - Tabelle create:
     - `favorites` - Preferiti utente
     - `watchlist` - Watchlist utente  
     - `ratings` - Voti utente
     - `user_lists` + `list_items` - Liste personalizzate
     - `rss_feeds` - Feed RSS (migrati da localStorage)
   - **AZIONE RICHIESTA**: Eseguire questa migration su Supabase

2. **TMDB API - Rated Items**
   - Aggiunta funzione `getRatedMedia()` in `lib/tmdb-user.ts`
   - Permette di fetchare i film/serie votati dall'utente da TMDB

3. **FavoritesContext** (Parziale)
   - File: `context/FavoritesContext.tsx`
   - Implementato ma richiede API routes

### 🚧 In Progress / Da Fare

#### 1. Completare i Context
- [ ] `context/WatchlistContext.tsx` (simile a FavoritesContext)
- [ ] `context/RatingsContext.tsx` (simile a FavoritesContext)  
- [ ] `context/RSSContext.tsx` (migrazione da `lib/rss-feeds.ts`)

#### 2. API Routes
- [ ] `app/api/favorites/route.ts` (GET, POST, DELETE)
- [ ] `app/api/watchlist/route.ts` (GET, POST, DELETE)
- [ ] `app/api/ratings/route.ts` (GET, POST, DELETE)
- [ ] `app/api/rss-feeds/route.ts` (GET, POST, DELETE)

#### 3. Server Actions per Sync
Aggiornare `app/actions/user-data.ts` con:
- [ ] `syncFavoritesFromTMDB()` - Fetch da TMDB → Supabase
- [ ] `syncWatchlistFromTMDB()` - Fetch da TMDB → Supabase
- [ ] `syncRatingsFromTMDB()` - Fetch da TMDB → Supabase
- [ ] `syncLocalFavorites()` - Guest localStorage → DB
- [ ] `syncLocalWatchlist()` - Guest localStorage → DB
- [ ] `syncLocalRatings()` - Guest localStorage → DB
- [ ] `pushFavoritesToTMDB()` - DB → TMDB (nuovi item)
- [ ] `pushWatchlistToTMDB()` - DB → TMDB (nuovi item)
- [ ] `pushRatingsToTMDB()` - DB → TMDB (nuovi item)

#### 4. Logica di Sync Completa
Aggiornare `context/AuthContext.tsx`:
```tsx
useEffect(() => {
  if (user) {
    // 1. Sync profile
    await syncUserProfile(user);
    
    // 2. Fetch da TMDB e salva su Supabase
    await syncAllFromTMDB(user.id, sessionId);
    
    // 3. Merge local guest data
    await syncAllLocalData(user.id);
    
    // 4. Push new items to TMDB  
    await pushLocalToTMDB(user.id, sessionId);
    
    // 5. Clear localStorage
    clearGuestData();
  }
}, [user]);
```

#### 5. Aggiornare UI
- [ ] `components/ActionButtons.tsx` - Usare i nuovi Context invece di richiedere login immediato
- [ ] `app/(main)/profile/favorites/page.tsx` - Usare FavoritesContext
- [ ] `app/(main)/profile/watchlist/page.tsx` - Usare WatchlistContext

## 📝 Prossimi Passi

1. **PER TE**: Esegui la migration SQL su Supabase
2. **PER ME**: Completare tutti i Context rimanenti
3. **PER ME**: Implementare API routes
4. **PER ME**: Implementare logica di sync completa
5. **TESTING**: Verificare il flusso guest → login → sync

## ❓ Note Tecniche

### Strategia di Sync
- **TMDB ha priorità** (è la fonte di verità)
- Items presenti solo localmente vengono **pushati a TMDB**
- In caso di conflitto (stesso item rated diversamente), **TMDB wins**

### Performance
- Sync è **asincrono** e non blocca il login
- **Optimistic UI** per azioni immediate
- Fallback a localStorage se API fails

Vuoi che continui con l'implementazione completa ora?
