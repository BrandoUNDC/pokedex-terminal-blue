"use client";

import styles from "./SearchAndFilter.module.css";

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function SearchAndFilter({
  searchQuery,
  onSearchChange,
}: SearchAndFilterProps) {
  return (
    <div className={styles.container}>
      <input
        type="text"
        placeholder="SEARCH BY NAME OR NUMBER..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className={styles.search}
      />
    </div>
  );
}