export const GENERATIONS = [
  { id: 1, name: "Gen I", offset: 0, limit: 151 },
  { id: 2, name: "Gen II", offset: 151, limit: 100 },
  { id: 3, name: "Gen III", offset: 251, limit: 135 },
  { id: 4, name: "Gen IV", offset: 386, limit: 107 },
];

export const TYPE_CHART: Record<string, { weak: Record<string, number>; resist: Record<string, number> }> = {
  normal: { weak: { rock: 2, ghost: 0, steel: 2 }, resist: { steel: 2 } },
  fire: { weak: { water: 2, ground: 2, rock: 2 }, resist: { fire: 2, grass: 0.5, ice: 0.5, bug: 0.5, steel: 0.5, fairy: 0.5 } },
  water: { weak: { grass: 2, electric: 2 }, resist: { fire: 0.5, water: 0.5, ice: 0.5, steel: 0.5 } },
  electric: { weak: { ground: 2 }, resist: { water: 0.5, electric: 0.5, flying: 0.5, steel: 0.5 } },
  grass: { weak: { fire: 2, ice: 2, flying: 2, poison: 2, bug: 2 }, resist: { water: 0.25, ground: 0.5, grass: 0.5, rock: 0.5, dragon: 0.5 } },
  ice: { weak: { fire: 2, fighting: 2, rock: 2, steel: 2 }, resist: { water: 0.5, ice: 0.5, grass: 0.5, ground: 0.5, flying: 0.5, dragon: 0.5 } },
  fighting: { weak: { flying: 2, psychic: 2, fairy: 2 }, resist: { rock: 0.5, bug: 0.5, dark: 0.5 } },
  poison: { weak: { ground: 2, psychic: 2 }, resist: { grass: 0.5, poison: 0.5, fighting: 0.5, bug: 0.5, fairy: 0.5 } },
  ground: { weak: { water: 2, grass: 2, ice: 2 }, resist: { rock: 0.5, bug: 0.5 } },
  flying: { weak: { electric: 2, ice: 2, rock: 2 }, resist: { grass: 0.5, fighting: 0.5, bug: 0.5, ground: 0.5 } },
  psychic: { weak: { bug: 2, ghost: 2, dark: 2 }, resist: { fighting: 0.5, psychic: 0.5 } },
  bug: { weak: { fire: 2, flying: 2, rock: 2, steel: 2 }, resist: { grass: 0.5, fighting: 0.5, ground: 0.5 } },
  rock: { weak: { water: 2, grass: 2, fighting: 2, ground: 2, steel: 2 }, resist: { normal: 0.5, fire: 0.5, poison: 0.5, flying: 0.5 } },
  ghost: { weak: { ghost: 2, dark: 2 }, resist: { normal: 0, fighting: 0.5 } },
  dragon: { weak: { ice: 2, dragon: 2, fairy: 2 }, resist: { fire: 0.5, water: 0.5, electric: 0.5, grass: 0.5 } },
  dark: { weak: { fighting: 2, bug: 2, fairy: 2 }, resist: { ghost: 0.5, dark: 0.5, psychic: 0 } },
  steel: { weak: { fire: 2, fighting: 2, ground: 2 }, resist: { normal: 0.5, fire: 0.5, water: 0.5, electric: 0.5, ice: 0.5, psychic: 0.5, rock: 0.5, dragon: 0.5, steel: 0.5, fairy: 0.5 } },
  fairy: { weak: { poison: 2, steel: 2 }, resist: { fighting: 0.5, bug: 0.5, dark: 0.5, dragon: 0 } },
};