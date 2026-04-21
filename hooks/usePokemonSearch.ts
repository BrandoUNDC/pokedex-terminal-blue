import { useMemo } from "react";
import { Pokemon } from "../types";

export function usePokemonSearch(
  pokemonList: Pokemon[],
  searchQuery: string
) {
  return useMemo(() => {
    if (!searchQuery.trim()) return pokemonList;

    const query = searchQuery.toLowerCase().trim();
    return pokemonList.filter((pokemon) => {
      if (pokemon.name.toLowerCase().includes(query)) return true;
      if (pokemon.id.toString() === query) return true;
      return false;
    });
  }, [pokemonList, searchQuery]);
}