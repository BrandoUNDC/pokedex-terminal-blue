"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { Pokemon, PokemonSpecies, PokemonType } from "../types";
import { GENERATIONS, TYPE_CHART } from "./constants";
import { usePokemonSearch } from "../hooks/usePokemonSearch";
import { usePokemonData, usePrefetch } from "../hooks/usePokemonAPI";
import { PokemonDetail } from "../components/PokemonDetail";
import { PokemonListItem } from "../components/PokemonListItem";
import { SearchAndFilter } from "../components/SearchAndFilter";
import styles from "./page.module.css";

interface PokemonListItem {
  id: number;
  name: string;
  url: string;
}

interface EvolutionChainResponse {
  chain: {
    species: { url: string; name: string };
    evolves_to: EvolutionChainResponse["chain"][];
    evolution_details: { min_level: number | null }[];
  };
}

interface MoveResponse {
  move: { name: string; url: string };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: { name: string };
  }[];
}

interface MoveDetailResponse {
  name: string;
  type: { name: string };
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  damage_class: { name: string } | null;
}

export default function Home() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [activeGeneration, setActiveGeneration] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [movesDetails, setMovesDetails] = useState<Map<string, MoveDetailResponse>>(new Map());
  const [movesLoading, setMovesLoading] = useState(false);
  const [typesCache, setTypesCache] = useState<Map<number, PokemonType[]>>(new Map());
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list');

  const listRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const moveCacheRef = useRef<Map<string, MoveDetailResponse>>(new Map());
  const moveFetchControllerRef = useRef<AbortController | null>(null);
  const typesFetchedRef = useRef<Set<number>>(new Set());
  const { prefetchPokemon } = usePrefetch();

  const ITEM_HEIGHT = 56;
  const VISIBLE_BUFFER = 5;

  const scrollToIndex = useCallback((index: number) => {
    const el = listRef.current;
    if (!el) return;
    const itemTop = index * ITEM_HEIGHT;
    const itemBottom = itemTop + ITEM_HEIGHT;
    const isAbove = itemTop < el.scrollTop;
    const isBelow = itemBottom > el.scrollTop + el.clientHeight;
    if (isAbove) el.scrollTop = itemTop;
    if (isBelow) el.scrollTop = itemBottom - el.clientHeight;
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchQuery]);

  const gen = GENERATIONS.find(g => g.id === activeGeneration) || GENERATIONS[0];
  const listUrl = `https://pokeapi.co/api/v2/pokemon?limit=${gen.limit}&offset=${gen.offset}`;

  const { data: listData, isLoading: listLoading } = usePokemonData<{ count: number; results: PokemonListItem[] }>(listUrl);

  const { data: fullPokemon, isLoading: pokemonLoading } = usePokemonData<Pokemon>(
    selectedId ? `https://pokeapi.co/api/v2/pokemon/${selectedId}` : null
  );

  const pokemonList: Pokemon[] = useMemo(() => {
    const baseList = (listData?.results || []).map((p: PokemonListItem) => {
      const id = parseInt(p.url.split("/").filter(Boolean).pop() || "0", 10);
      const cachedTypes = typesCache.get(id);
      return {
        id,
        name: p.name,
        types: cachedTypes || [],
        sprites: { front_default: "", front_shiny: "", other: { "official-artwork": { front_default: "" } } },
        stats: [],
        height: 0,
        weight: 0,
        abilities: [],
        species_url: p.url,
      };
    });

    if (fullPokemon?.types && fullPokemon.types.length > 0) {
      const idx = baseList.findIndex(p => p.id === fullPokemon.id);
      if (idx !== -1) {
        baseList[idx] = { ...baseList[idx], types: fullPokemon.types };
      }
    }

    return baseList;
  }, [listData, fullPokemon, typesCache]);

  const { data: speciesData } = usePokemonData<PokemonSpecies>(
    selectedId ? `https://pokeapi.co/api/v2/pokemon-species/${selectedId}` : null
  );

  const { data: evolutionData } = usePokemonData<EvolutionChainResponse>(
    speciesData?.evolution_chain?.url || null
  );

  const displayedPokemon = fullPokemon;

  useEffect(() => {
    if (!listData?.results || listData.results.length === 0) return;

    const idsToFetch = listData.results
      .map((p: PokemonListItem) => {
        const id = parseInt(p.url.split("/").filter(Boolean).pop() || "0", 10);
        return id;
      })
      .filter((id: number) => !typesFetchedRef.current.has(id));

    if (idsToFetch.length === 0) return;

    const BATCH_SIZE = 20;

    const fetchBatch = async (batch: number[]) => {
      const results = await Promise.all(
        batch.map(async (id) => {
          try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            if (!res.ok) return null;
            const data: Pokemon = await res.json();
            return { id, types: data.types };
          } catch {
            return null;
          }
        })
      );
      return results.filter((r): r is { id: number; types: PokemonType[] } => r !== null);
    };

    const fetchAll = async () => {
      for (let i = 0; i < idsToFetch.length; i += BATCH_SIZE) {
        const batch = idsToFetch.slice(i, i + BATCH_SIZE);
        const results = await fetchBatch(batch);
        if (results.length > 0) {
          setTypesCache(prev => {
            const next = new Map(prev);
            results.forEach(({ id, types }) => {
              typesFetchedRef.current.add(id);
              next.set(id, types);
            });
            return next;
          });
        }
      }
    };

    fetchAll();
  }, [listData]);

  useEffect(() => {
    if (!fullPokemon?.moves) return;

    const controller = new AbortController();
    moveFetchControllerRef.current = controller;

    const levelUpMoves = fullPokemon.moves
      .filter((m: MoveResponse) =>
        m.version_group_details?.some((v) => v.move_learn_method.name === "level-up")
      )
      .slice(0, 8);

    if (levelUpMoves.length === 0) return;

    const fetchMoveDetails = async () => {
      setMovesLoading(true);

      const movePromises = levelUpMoves.map(async (m: MoveResponse) => {
        if (controller.signal.aborted) return { url: m.move.url, detail: null };
        const cached = moveCacheRef.current.get(m.move.url);
        if (cached) return { url: m.move.url, detail: cached };

        try {
          const res = await fetch(m.move.url, { signal: controller.signal });
          if (controller.signal.aborted) return { url: m.move.url, detail: null };
          const data: MoveDetailResponse = await res.json();
          moveCacheRef.current.set(m.move.url, data);
          return { url: m.move.url, detail: data };
        } catch {
          return { url: m.move.url, detail: null };
        }
      });

      const results = await Promise.all(movePromises);
      if (controller.signal.aborted) return;

      const newDetails = new Map<string, MoveDetailResponse>();

      results.forEach(({ url, detail }) => {
        if (detail) {
          newDetails.set(url, detail);
        }
      });

      setMovesDetails(newDetails);
      setMovesLoading(false);
    };

    fetchMoveDetails();

    return () => {
      controller.abort();
    };
  }, [fullPokemon?.id, fullPokemon?.moves]);

  const prefetchNeighbors = useCallback((id: number) => {
    const prefetch = (url: string) => fetch(url).catch(() => {});
    if (id > 1) {
      prefetch(`https://pokeapi.co/api/v2/pokemon/${id - 1}`);
      prefetch(`https://pokeapi.co/api/v2/pokemon-species/${id - 1}`);
    }
    if (id < 1025) {
      prefetch(`https://pokeapi.co/api/v2/pokemon/${id + 1}`);
      prefetch(`https://pokeapi.co/api/v2/pokemon-species/${id + 1}`);
    }
  }, []);

  useEffect(() => {
    if (selectedId) {
      prefetchNeighbors(selectedId);
    }
  }, [selectedId, prefetchNeighbors]);

  const evolutionChain = useMemo(() => {
    if (!evolutionData?.chain) return [];
    const chain: { id: number; name: string; sprite: string; level?: number }[] = [];
    let current: EvolutionChainResponse["chain"] | undefined = evolutionData.chain;

    while (current) {
      const id = parseInt(current.species.url.split("/").filter(Boolean).pop() || "0", 10);
      chain.push({
        id,
        name: current.species.name,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
        level: current.evolution_details?.[0]?.min_level || undefined,
      });
      current = current.evolves_to?.[0];
    }
    return chain;
  }, [evolutionData]);

  const moves = useMemo(() => {
    if (!fullPokemon?.moves) return [];
    const levelUpMoves = fullPokemon.moves
      .filter((m: MoveResponse) =>
        m.version_group_details?.some((v) => v.move_learn_method.name === "level-up")
      )
      .slice(0, 8);

    return levelUpMoves.map((m: MoveResponse) => {
      const levelDetail = m.version_group_details.find(
        (v) => v.move_learn_method.name === "level-up"
      );
      const detail = movesDetails.get(m.move.url);

      return {
        name: m.move.name,
        level_learned_at: levelDetail?.level_learned_at || 0,
        type: detail?.type?.name || "",
        category: detail?.damage_class?.name || "level-up",
        power: detail?.power ?? null,
        accuracy: detail?.accuracy ?? null,
        pp: detail?.pp ?? null,
      };
    });
  }, [fullPokemon, movesDetails]);

  const weaknesses = useMemo(() => {
    if (!fullPokemon?.types || fullPokemon.types.length === 0) return [];
    const types = fullPokemon.types.map(t => t.type.name);
    const weaknessMap: Record<string, number> = {};

    types.forEach(t => {
      const chart = TYPE_CHART[t];
      if (!chart) return;
      Object.entries(chart.weak || {}).forEach(([targetType, mult]) => {
        weaknessMap[targetType] = (weaknessMap[targetType] || 1) * mult;
      });
      Object.entries(chart.resist || {}).forEach(([targetType, mult]) => {
        weaknessMap[targetType] = (weaknessMap[targetType] || 1) * mult;
      });
    });

    return Object.entries(weaknessMap)
      .filter(([, mult]) => mult > 1)
      .sort((a, b) => b[1] - a[1])
      .map(([type, mult]) => ({ type, multiplier: mult }));
  }, [fullPokemon]);

  const filteredPokemon = usePokemonSearch(pokemonList, searchQuery);

  const handleSelect = useCallback((pokemon: Pokemon) => {
    const idx = filteredPokemon.findIndex(p => p.id === pokemon.id);
    scrollToIndex(idx);
    setSelectedId(pokemon.id);
    setMobileView('detail');
  }, [filteredPokemon, scrollToIndex]);

  const handleNavigate = useCallback((id: number) => {
    const idx = filteredPokemon.findIndex(p => p.id === id);
    scrollToIndex(idx);
    setSelectedId(id);
    prefetchPokemon(id);
  }, [filteredPokemon, prefetchPokemon, scrollToIndex]);

  const handleEvolutionClick = useCallback((id: number) => {
    const idx = filteredPokemon.findIndex(p => p.id === id);
    scrollToIndex(idx);
    setSelectedId(id);
    prefetchPokemon(id);
  }, [filteredPokemon, prefetchPokemon, scrollToIndex]);

  const handleBackToList = useCallback(() => {
    setMobileView('list');
  }, []);

  const handleLogoClick = useCallback(() => {
    setSelectedId(1);
    setActiveGeneration(1);
    setSearchQuery("");
    setMobileView('list');
    setMovesDetails(new Map());
  }, []);

  const { currentIndex, prevPokemonId, nextPokemonId } = useMemo(() => {
    const idx = filteredPokemon.findIndex(p => p.id === selectedId);
    return {
      currentIndex: idx,
      prevPokemonId: idx > 0 ? filteredPokemon[idx - 1].id : null,
      nextPokemonId: idx < filteredPokemon.length - 1 ? filteredPokemon[idx + 1].id : null,
    };
  }, [filteredPokemon, selectedId]);

  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const listHeight = listRef.current?.clientHeight || 600;
  const totalHeight = filteredPokemon.length * ITEM_HEIGHT;

  const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - VISIBLE_BUFFER);
  const visibleCount = Math.ceil(listHeight / ITEM_HEIGHT) + VISIBLE_BUFFER * 2;
  const endIndex = Math.min(filteredPokemon.length, startIndex + visibleCount);
  const visiblePokemon = filteredPokemon.slice(startIndex, endIndex);
  const offsetY = startIndex * ITEM_HEIGHT;

  const isLoading = pokemonLoading || movesLoading;

  return (
    <div className={`${styles.container} ${mobileView === 'list' ? styles.showList : styles.showDetail}`}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <span className={styles.logoAccent}>v3.0</span>
            <h1 className={styles.logoText}>
              <button
                className={styles.logoBtn}
                onClick={handleLogoClick}
                aria-label="Return to home"
              >
                POKÉ<span>DEX</span>
              </button>
            </h1>
          </div>

          <div className={styles.generationSelector}>
            {GENERATIONS.map((g) => (
              <button
                key={g.id}
                className={`${styles.genBtn} ${activeGeneration === g.id ? styles.active : ""}`}
                onClick={() => {
                  setActiveGeneration(g.id);
                  setSelectedId(g.offset + 1);
                }}
              >
                {g.name}
              </button>
            ))}
          </div>

          <div className={styles.status}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>
              {listLoading ? "SYNCING..." : `${pokemonList.length} SPECIES`}
            </span>
          </div>
        </div>
      </header>

      <div className={styles.main}>
        <aside className={styles.sidebar}>
          <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />

          <nav className={styles.pokemonList} ref={listRef}>
            {listLoading ? (
              <div className={styles.loading}>LOADING DATABASE...</div>
            ) : filteredPokemon.length === 0 ? (
              <div className={styles.empty}>NO RESULTS FOUND</div>
            ) : (
              <div style={{ height: totalHeight, position: "relative" }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                  {visiblePokemon.map((pokemon) => (
                    <PokemonListItem
                      key={pokemon.id}
                      ref={(el) => {
                        if (el) itemRefs.current.set(pokemon.id, el);
                      }}
                      pokemon={pokemon}
                      isActive={selectedId === pokemon.id}
                      onClick={() => handleSelect(pokemon)}
                      types={pokemon.types}
                    />
                  ))}
                </div>
              </div>
            )}
          </nav>
        </aside>

        <main className={styles.detail} ref={detailRef}>
          {isLoading && !displayedPokemon ? (
            <div className={styles.skeleton}>
              <div className={styles.skeletonNav}>
                <div className={styles.skeletonBtn} />
                <div className={styles.skeletonBtn} />
              </div>
              <div className={styles.skeletonHeader}>
                <div className={styles.skeletonNumber} />
                <div className={styles.skeletonName} />
                <div className={styles.skeletonGenus} />
              </div>
              <div className={styles.skeletonBody}>
                <div className={styles.skeletonLeft}>
                  <div className={styles.skeletonSprite} />
                  <div className={styles.skeletonTypes}>
                    <div className={styles.skeletonType} />
                    <div className={styles.skeletonType} />
                  </div>
                </div>
                <div className={styles.skeletonRight}>
                  <div className={styles.skeletonSection}>
                    <div className={styles.skeletonStat} />
                    <div className={styles.skeletonStat} />
                    <div className={styles.skeletonStat} />
                    <div className={styles.skeletonStat} />
                    <div className={styles.skeletonStat} />
                    <div className={styles.skeletonStat} />
                  </div>
                  <div className={styles.skeletonSection}>
                    <div className={styles.skeletonAbility} />
                    <div className={styles.skeletonAbility} />
                  </div>
                </div>
              </div>
            </div>
          ) : displayedPokemon ? (
            <PokemonDetail
              pokemon={displayedPokemon}
              species={speciesData || null}
              isLoading={false}
              movesLoading={movesLoading}
              prevPokemonId={prevPokemonId}
              nextPokemonId={nextPokemonId}
              onNavigate={handleNavigate}
              onEvolutionClick={handleEvolutionClick}
              onBackToList={handleBackToList}
              evolutionChain={evolutionChain}
              moves={moves}
              weaknesses={weaknesses}
            />
          ) : (
            <div className={styles.placeholder}>
              <p>SELECT A POKEMON</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}