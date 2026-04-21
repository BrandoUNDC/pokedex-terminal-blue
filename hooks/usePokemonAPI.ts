import useSWR, { SWRConfiguration } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const swrOptions: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 60000,
  keepPreviousData: true,
};

export function usePokemonData<T>(endpoint: string | null, fallbackData?: T) {
  return useSWR<T>(endpoint, fetcher, {
    ...swrOptions,
    fallbackData,
  });
}

export function usePokemonSpecies(id: number | null) {
  return useSWR(
    id ? `https://pokeapi.co/api/v2/pokemon-species/${id}` : null,
    fetcher,
    swrOptions
  );
}

export function usePokemonEvolutionChain(url: string | null) {
  return useSWR(url, fetcher, swrOptions);
}

export function usePokemonBasic(id: number | null) {
  return useSWR(
    id ? `https://pokeapi.co/api/v2/pokemon/${id}` : null,
    fetcher,
    swrOptions
  );
}

export function useMoveDetails(url: string | null) {
  return useSWR(
    url,
    fetcher,
    {
      ...swrOptions,
      dedupingInterval: Infinity,
    }
  );
}

export function usePrefetch() {
  const prefetchPokemon = (id: number) => {
    if (id <= 0 || id > 1025) return;

    const prefetch = (url: string) => {
      fetch(url).then(() => {}).catch(() => {});
    };

    prefetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    prefetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
  };

  return { prefetchPokemon };
}