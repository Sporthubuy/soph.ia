import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${hankenGrotesk.variable} ${jetbrainsMono.variable} antialiased`}>
        {/*
          DIRECTION CONTRACT · SOPH.IA · world=graph-native · theme=dark · register=operate
          THESIS: The org's knowledge is a navigable night sky. It refuses the AI-default
            light dashboard and the neon-on-black cliche; nodes and the lines between them
            are the whole interface language, not a widget on one page.
          OWN-WORLD: Midnight cool-ink ground (#080b12 -> #0f1420) under a faint dot substrate
            (the graph canvas itself). Luminous azure #5b9bff is the connective light; status
            is the color of a body's glow (emerald / amber / slate). Hanken Grotesk UI, JetBrains
            Mono for coordinates (ids, hashes, versions, trust). Drawn line icons, never emoji.
          STORY: The operator sees knowledge as connected bodies with state, trusts what glows
            verified, and acts - propose, review, compile - from inside the constellation.
          FIRST VIEWPORT: Dark shell, node-cluster logo top-left, nav items as bodies with a
            connective active edge; content on the dotted sky. Primary action in azure.
          FORM: node-and-edge constellation. User-pinned direction (Graph-native); new-work section 3
            roll waived per "a user- or brief-pinned direction beats the roll, always".
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
        */}
        {children}
      </body>
    </html>
  );
}
