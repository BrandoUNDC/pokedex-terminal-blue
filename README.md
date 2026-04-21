# Pokedex — Terminal Aesthetic

A React + TypeScript Pokédex app consuming the [PokeAPI](https://pokeapi.co), styled with a dark terminal aesthetic and blue accent UI.

## Features

- **Gen I–IV** selector (151 Pokémon per generation)
- **Sidebar** con virtual scroll (solo ~20 nodos DOM, no los 151 completos)
- **Pokemon detail panel**: sprite, tipos, stats, abilities, weaknesses (cálculo dual accurate), cadena de evolución, moves con power/accuracy reales, Pokédex entry
- **Type effectiveness** calculado localmente con estructura weak/resist (incluye ×4 e inmunidades)
- **Type badges** en sidebar y detalle (colores oficiales de tipos Pokémon — no tocados en el theme)
- **Search** por nombre o número
- **Caching**: SWR para API requests, move cache, types cache batch-fetched
- **Performance**: React.memo en leaf components, useMemo/useCallback en todo, AbortController para cancel of race conditions en navegación rápida, prefetch de Pokémon adyacentes
- **UI accent**: azul `#3B82F6` (no pink/purple del cyberpunk original)

## Stack

- **Next.js 16** (App Router, React 19)
- **TypeScript** strict
- **SWR** para data fetching y caching
- **CSS Modules** (no Tailwind)
- **PokeAPI** (sin backend propio)

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech highlights

| Area | Implementation |
|------|----------------|
| Virtual scroll | Manual, based on `scrollTop` — not `currentIndex` |
| Move details | Promise.all con AbortController — cancela requests obsoletos |
| Type chart | Static object in `constants.ts` — no runtime recalculation |
| Sidebar badges | Batch-fetch de 30 Pokémon al cargar, cacheado en Map |
| Memoization | `PokemonListItem`, `StatBar`, `TypeBadge` wrapped in `memo` |

## Project structure

```
pokedex/
├── app/
│   ├── page.tsx          # Main component — fetching, state, virtual scroll
│   ├── constants.ts      # GENERATIONS, TYPE_CHART — static, outside component
│   ├── globals.css       # CSS variables including --neon-blue accent
│   └── layout.tsx        # Font configuration
├── components/
│   ├── PokemonDetail.tsx  # Detail panel
│   ├── PokemonListItem.tsx
│   ├── TypeBadge.tsx     # Type badges (Pokemon type colors — not UI accent)
│   └── StatBar.tsx
├── hooks/
│   ├── usePokemonAPI.ts  # SWR config
│   └── usePokemonSearch.ts
└── types.ts
```