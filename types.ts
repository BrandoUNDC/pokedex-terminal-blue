export interface PokemonType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonAbility {
  slot: number;
  is_hidden: boolean;
  ability: {
    name: string;
    url: string;
  };
}

export interface PokemonSprite {
  front_default: string;
  front_shiny: string;
  other: {
    "official-artwork": {
      front_default: string;
    };
  };
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  sprites: PokemonSprite;
  stats: PokemonStat[];
  height: number;
  weight: number;
  abilities: PokemonAbility[];
  species_url: string;
  moves?: PokemonMove[];
}

export interface PokemonMove {
  move: { name: string; url: string };
  version_group_details: {
    level_learned_at: number;
    move_learn_method: { name: string };
  }[];
}

export interface PokemonSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
    version: {
      name: string;
    };
  }[];
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
  evolution_chain: {
    url: string;
  };
}