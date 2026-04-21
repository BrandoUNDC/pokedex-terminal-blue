import type { Metadata } from "next";
import { JetBrains_Mono, Orbitron } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const orbitron = Orbitron({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "POKEDEX // SYSTEM",
  description: "Base de datos Pokemon v2.0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${jetbrainsMono.variable} ${orbitron.variable}`}>
      <body>{children}</body>
    </html>
  );
}