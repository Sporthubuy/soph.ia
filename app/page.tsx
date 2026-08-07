import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { ConnectionBanner } from './components/ConnectionBanner'
import { Features } from './components/Features'
import { FAQ } from './components/FAQ'
import { FinalCTA } from './components/FinalCTA'
import { Footer } from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
      <Header />
      <Hero />
      <HowItWorks />
      <ConnectionBanner />
      <Features />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  )
}
