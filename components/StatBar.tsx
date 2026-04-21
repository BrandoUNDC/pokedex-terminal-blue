import { memo } from "react";
import styles from "./StatBar.module.css";

interface StatBarProps {
  name: string;
  value: number;
  maxValue?: number;
}

const STAT_NAMES: Record<string, string> = {
  hp: "PS",
  attack: "ATA",
  defense: "DEF",
  "special-attack": "SPA",
  "special-defense": "SPD",
  speed: "VEL",
};

export const StatBar = memo<StatBarProps>(({ name, value, maxValue = 255 }) => {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const displayName = STAT_NAMES[name] || name.toUpperCase();

  return (
    <div className={styles.container}>
      <span className={styles.name}>{displayName}</span>
      <div className={styles.barContainer}>
        <div className={styles.maxBar} />
        <div className={styles.barFill} style={{ width: `${percentage}%` }} />
      </div>
      <span className={styles.value}>{value}</span>
      <span className={styles.maxValue}>/{maxValue}</span>
    </div>
  );
});