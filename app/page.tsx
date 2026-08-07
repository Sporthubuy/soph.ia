import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { Features } from './components/Features'
import { Benefits } from './components/Benefits'
import { Footer } from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Header />
      <Hero />
      <Features />
      <Benefits />
      <Footer />
    </main>
  )
}
