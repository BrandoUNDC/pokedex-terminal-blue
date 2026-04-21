import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "/PokeAPI/sprites/**",
      },
      {
        protocol: "https",
        hostname: "pokeapi.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.pokemon.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;