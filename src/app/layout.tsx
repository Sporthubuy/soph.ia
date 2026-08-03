import { Outfit, Inter, JetBrains_Mono } from "next/font/google";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {/*
          SOPH.IA — dark-first design system per DESIGN_SYSTEM.md.
          Electric blue #3B82F6 + cyan #06B6D4 (gradient primary, glow), deep
          navy canvas #07090E, glassmorphic cards. Typographic pairing: Outfit
          for headings/display, Inter for body and editor, JetBrains Mono for
          technical data (KU ids, hashes, versions). Lucide icons. Logo: "S"
          isotype + lowercase "soph.ia" wordmark (isotype is a placeholder
          pending the official SVG).
        */}
        {children}
      </body>
    </html>
  );
}
