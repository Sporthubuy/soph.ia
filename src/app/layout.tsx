import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
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
      <body className={`${plusJakarta.variable} ${jetbrainsMono.variable} antialiased`}>
        {/*
          SOPH.IA — dark-first design system per DESIGN_SYSTEM.md.
          Electric blue #3B82F6 + cyan #06B6D4 (gradient primary, glow), deep
          navy canvas #07090E, glassmorphic cards. Plus Jakarta Sans UI +
          JetBrains Mono for data. Lucide icons. Logo: "S" isotype + lowercase
          "soph.ia" wordmark (isotype is a placeholder pending the official SVG).
        */}
        {children}
      </body>
    </html>
  );
}
