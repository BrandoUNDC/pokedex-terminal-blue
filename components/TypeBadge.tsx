"use client";

import { memo } from "react";
import styles from "./TypeBadge.module.css";

const TYPE_COLORS: Record<string, string> = {
  normal: "#A8A878",
  fire: "#F08030",
  water: "#6890F0",
  electric: "#F8D030",
  grass: "#78C850",
  ice: "#98D8D8",
  fighting: "#C03028",
  poison: "#A040A0",
  ground: "#E0C068",
  flying: "#A890F0",
  psychic: "#F85888",
  bug: "#A8B820",
  rock: "#B8A038",
  ghost: "#705898",
  dragon: "#7038F8",
  dark: "#705848",
  steel: "#B8B8D0",
  fairy: "#EE99AC",
};

interface TypeBadgeProps {
  type: string;
  size?: "small" | "medium" | "large";
  variant?: "badge" | "tag";
}

export const TypeBadge = memo<TypeBadgeProps>(({ type, size = "medium", variant = "badge" }) => {
  const color = TYPE_COLORS[type] || "#888888";
  const displayText = variant === "badge" ? type.charAt(0).toUpperCase() : type.toUpperCase();

  return (
    <span
      className={`${styles.badge} ${styles[size]} ${styles[variant]}`}
      style={{ backgroundColor: color }}
    >
      {displayText}
    </span>
  );
});

export { TYPE_COLORS };