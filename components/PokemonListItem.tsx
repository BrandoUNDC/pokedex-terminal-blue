"use client";

import { forwardRef, memo } from "react";
import { PokemonType } from "../types";
import { TypeBadge } from "./TypeBadge";
import styles from "./PokemonListItem.module.css";

interface PokemonListItemProps {
  pokemon: { id: number; name: string };
  isActive: boolean;
  onClick: () => void;
  types?: PokemonType[];
}

function formatNumber(num: number): string {
  return String(num).padStart(3, "0");
}

export const PokemonListItem = memo(
  forwardRef<HTMLButtonElement, PokemonListItemProps>(
    ({ pokemon, isActive, onClick, types = [] }, ref) => {
      return (
        <button
          ref={ref}
          onClick={onClick}
          className={`${styles.item} ${isActive ? styles.active : ""}`}
        >
          <span className={styles.number}>{formatNumber(pokemon.id)}</span>
          <span className={styles.name}>{pokemon.name}</span>
          <div className={styles.types}>
            {types.map((t) => (
              <TypeBadge key={t.slot} type={t.type.name} size="small" />
            ))}
          </div>
        </button>
      );
    }
  )
);

PokemonListItem.displayName = "PokemonListItem";