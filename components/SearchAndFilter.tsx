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
      <div className={styles.searchWrapper}>
        <input
          type="text"
          placeholder="SEARCH BY NAME OR NUMBER..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className={styles.search}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}