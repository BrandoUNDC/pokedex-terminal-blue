"use client";

import { useEffect, useRef, useMemo, useCallback, memo } from "react";
import Image from "next/image";
import { Pokemon, PokemonSpecies } from "../types";
import { TypeBadge } from "./TypeBadge";
import { StatBar } from "./StatBar";
import { TYPE_COLORS } from "./TypeBadge";
import styles from "./PokemonDetail.module.css";

interface PokemonDetailProps {
  pokemon: Pokemon;
  species: PokemonSpecies | null;
  isLoading: boolean;
  movesLoading?: boolean;
  prevPokemonId: number | null;
  nextPokemonId: number | null;
  onNavigate: (id: number) => void;
  onEvolutionClick: (id: number) => void;
  evolutionChain?: EvolutionStage[];
  moves?: MoveInfo[];
  weaknesses?: Weakness[];
}

interface EvolutionStage {
  id: number;
  name: string;
  sprite: string;
  level?: number;
}

interface MoveInfo {
  name: string;
  level_learned_at: number;
  type: string;
  category?: string;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
}

interface Weakness {
  type: string;
  multiplier: number;
}

function formatNumber(num: number): string {
  return String(num).padStart(3, "0");
}

function formatHeight(height: number): string {
  return (height / 10).toFixed(1).replace(".", ",");
}

function formatWeight(weight: number): string {
  return (weight / 10).toFixed(1).replace(".", ",");
}

export const PokemonDetail = memo(
  ({
    pokemon,
    species,
    isLoading,
    movesLoading = false,
    prevPokemonId,
    nextPokemonId,
    onNavigate,
    onEvolutionClick,
    evolutionChain = [],
    moves = [],
    weaknesses = [],
  }: PokemonDetailProps) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mainType = pokemon.types[0]?.type.name || "normal";
    const typeColor = TYPE_COLORS[mainType] || "#888888";
    const typeBgColor = `var(--type-bg-${mainType}, #1a1a1a)`;

    useEffect(() => {
      if (cardRef.current) {
        cardRef.current.classList.remove(styles.enter);
        void cardRef.current.offsetWidth;
        cardRef.current.classList.add(styles.enter);
      }
    }, [pokemon.id]);

    const flavorText = useMemo(() =>
      species?.flavor_text_entries.find((e) => e.language.name === "es")
        ?.flavor_text ||
      species?.flavor_text_entries.find((e) => e.language.name === "en")
        ?.flavor_text ||
      "",
      [species?.flavor_text_entries]
    );

    const genus = useMemo(() =>
      species?.genera.find((g) => g.language.name === "es")?.genus ||
      species?.genera.find((g) => g.language.name === "en")?.genus ||
      "",
      [species?.genera]
    );

    const imageUrl = useMemo(() =>
      pokemon.sprites.other["official-artwork"].front_default ||
      pokemon.sprites.front_default,
      [pokemon.sprites]
    );

    const handlePrevClick = useCallback(() => {
      if (prevPokemonId) onNavigate(prevPokemonId);
    }, [prevPokemonId, onNavigate]);

    const handleNextClick = useCallback(() => {
      if (nextPokemonId) onNavigate(nextPokemonId);
    }, [nextPokemonId, onNavigate]);

    const handleEvolutionClick = useCallback((id: number) => () => {
      onEvolutionClick(id);
    }, [onEvolutionClick]);

    return (
      <div
        ref={cardRef}
        className={`${styles.card} ${isLoading ? styles.loading : ""} ${styles.enter}`}
        style={{ "--type-color": typeColor, "--type-bg": typeBgColor } as React.CSSProperties}
      >
        <header className={styles.header}>
          <div className={styles.navButtons}>
            <button
              className={styles.navBtn}
              onClick={handlePrevClick}
              disabled={!prevPokemonId}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
              {prevPokemonId ? formatNumber(prevPokemonId) : "---"}
            </button>
            <button
              className={styles.navBtn}
              onClick={handleNextClick}
              disabled={!nextPokemonId}
            >
              {nextPokemonId ? formatNumber(nextPokemonId) : "---"}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
          <span className={styles.number}>N° {formatNumber(pokemon.id)}</span>
          <h2 className={styles.name}>{pokemon.name}</h2>
          {genus && <p className={styles.genus}>{genus}</p>}
        </header>

        <div className={styles.body}>
          <div className={styles.leftColumn}>
            <section className={styles.spriteSection}>
              <div className={styles.spriteWrapper}>
                <div className={styles.spriteGlow} />
                <Image
                  src={imageUrl}
                  alt={pokemon.name}
                  width={160}
                  height={160}
                  className={styles.sprite}
                  priority
                />
              </div>
              <div className={styles.types}>
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.slot} type={t.type.name} size="large" variant="tag" />
                ))}
              </div>
              <div className={styles.measurements}>
                <div className={styles.measurement}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20"/>
                  </svg>
                  <span className={styles.measurementValue}>{formatHeight(pokemon.height)} m</span>
                </div>
                <div className={styles.measurement}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                  <span className={styles.measurementValue}>{formatWeight(pokemon.weight)} kg</span>
                </div>
              </div>
            </section>

            {weaknesses.length > 0 && (
              <section className={styles.weaknesses}>
                <h3 className={styles.sectionTitle}>WEAKNESSES</h3>
                <div className={styles.weaknessGrid}>
                  {weaknesses.map((w) => (
                    <div key={w.type} className={styles.weaknessItem}>
                      <span
                        className={styles.weaknessBadge}
                        style={{ backgroundColor: TYPE_COLORS[w.type] || "#888" }}
                      >
                        {w.type.substring(0, 3).toUpperCase()}
                      </span>
                      <span className={styles.weaknessMult}>
                        ×{w.multiplier.toFixed(w.multiplier % 1 === 0 ? 0 : 1)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {evolutionChain.length > 0 && (
              <section className={styles.evolution}>
                <h3 className={styles.sectionTitle}>EVOLUTION</h3>
                <div className={styles.evolutionChain}>
                  {evolutionChain.map((stage, idx) => (
                    <div key={stage.id} className={styles.evolutionStage}>
                      <button
                        className={`${styles.evolutionSprite} ${stage.id === pokemon.id ? styles.current : ""}`}
                        onClick={handleEvolutionClick(stage.id)}
                        title={`Go to ${stage.name}`}
                      >
                        <Image
                          src={stage.sprite}
                          alt={stage.name}
                          width={48}
                          height={48}
                          className={styles.evolutionImg}
                        />
                      </button>
                      <span className={styles.evolutionName}>{stage.name}</span>
                      {stage.level && <span className={styles.evolutionLevel}>Lv. {stage.level}</span>}
                      {idx < evolutionChain.length - 1 && (
                        <div className={styles.evolutionArrow}>
                          <svg width="20" height="12" viewBox="0 0 20 12" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M0 6h16M12 1l5 5-5 5"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.statsCard}>
              <h3 className={styles.sectionTitle}>BASE STATS</h3>
              <div className={styles.stats}>
                {pokemon.stats.map((stat) => (
                  <StatBar key={stat.stat.name} name={stat.stat.name} value={stat.base_stat} />
                ))}
              </div>
            </div>

            <div className={styles.abilitiesCard}>
              <h3 className={styles.sectionTitle}>ABILITIES</h3>
              <div className={styles.abilityList}>
                {pokemon.abilities.map((ability) => (
                  <span
                    key={ability.ability.name}
                    className={`${styles.abilityTag} ${ability.is_hidden ? styles.hidden : ""}`}
                  >
                    {ability.ability.name.replace("-", " ")}
                    {ability.is_hidden && " (HIDDEN)"}
                  </span>
                ))}
              </div>
            </div>

            {flavorText && (
              <div className={styles.description}>
                <h3 className={styles.sectionTitle}>POKÉDEX ENTRY</h3>
                <p className={styles.flavorText}>{flavorText.replace(/\f/g, " ")}</p>
              </div>
            )}

            <div className={styles.movesCard}>
              <h3 className={styles.sectionTitle}>MOVES (LEVEL UP)</h3>
              {movesLoading ? (
                <div className={styles.movesLoading}>
                  <div className={styles.moveSkeleton} />
                  <div className={styles.moveSkeleton} />
                  <div className={styles.moveSkeleton} />
                  <div className={styles.moveSkeleton} />
                </div>
              ) : moves.length > 0 ? (
                <div className={styles.movesTable}>
                  <div className={styles.movesHeader}>
                    <span>LV</span>
                    <span>MOVE</span>
                    <span>TYPE</span>
                    <span>POW</span>
                    <span>ACC</span>
                  </div>
                  {moves.map((move) => (
                    <div key={move.name} className={styles.moveRow}>
                      <span className={styles.moveLevel}>
                        {move.level_learned_at > 0 ? move.level_learned_at : "—"}
                      </span>
                      <span className={styles.moveName}>{move.name}</span>
                      {move.type && TYPE_COLORS[move.type] ? (
                        <span
                          className={styles.moveType}
                          style={{ backgroundColor: TYPE_COLORS[move.type] }}
                        >
                          {move.type.substring(0, 3).toUpperCase()}
                        </span>
                      ) : (
                        <span className={styles.moveType}>—</span>
                      )}
                      <span className={styles.movePower}>{move.power ?? "—"}</span>
                      <span className={styles.moveAcc}>{move.accuracy ?? "—"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noMoves}>No level-up moves available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

PokemonDetail.displayName = "PokemonDetail";