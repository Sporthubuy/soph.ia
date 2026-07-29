import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-[#e2e8f0] bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
              <span className="text-white text-xl">database</span>
            </div>
            <div>
              <h1 className="headline-lg text-black font-bold">SOPH.IA</h1>
            </div>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="body-md text-[#45464d] hover:text-black transition-colors">
              Sign In
            </Link>
            <Button render={<Link href="/register" />} size="sm" className="rounded">
              Start Free
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center px-6 py-32">
          <div className="absolute inset-0 dot-pattern opacity-50" />

          <div className="relative max-w-3xl mx-auto text-center space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e8f0] bg-white px-4 py-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="label-sm text-[#45464d]">v0.1 — Knowledge Operating System</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="headline-xl text-black font-bold leading-tight">
                The knowledge
                <br />
                <span className="text-[#4648d4]">compiles into intelligence</span>
              </h1>
              <p className="body-lg text-[#45464d] max-w-lg mx-auto">
                SOPH.IA is the infrastructure where your organization builds, versions, and governs collective knowledge to power AI agents.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button render={<Link href="/register" />} size="lg" className="rounded bg-black text-white hover:bg-black/90">
                Start Free
              </Button>
              <Button render={<Link href="/login" />} variant="outline" size="lg" className="rounded border-[#e2e8f0]">
                Sign In
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative px-6 py-20 bg-white border-t border-[#e2e8f0]">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="headline-lg text-black font-bold">How it works</h2>
              <p className="body-md text-[#45464d]">From scattered knowledge to AI agents in 3 steps</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { number: "1", title: "Document", desc: "Capture your knowledge as structured units" },
                { number: "2", title: "Version", desc: "Track changes with full audit trail" },
                { number: "3", title: "Compile", desc: "Automatically build AI agents from approved knowledge" }
              ].map((step) => (
                <div key={step.number} className="space-y-4 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#dae2fd] text-black font-bold text-lg">
                    {step.number}
                  </div>
                  <div>
                    <h3 className="body-lg font-semibold text-black mb-1">{step.title}</h3>
                    <p className="body-md text-[#45464d]">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative px-6 py-20">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-2">
              <h2 className="headline-lg text-black font-bold">Four pillars. One operating system.</h2>
              <p className="body-md text-[#45464d]">Everything you need for knowledge to become actionable intelligence</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { title: "Knowledge Units", desc: "Ideas, policies and rules encapsulated, versioned and with accountability" },
                { title: "Knowledge Graph", desc: "Visual map of interconnected nodes showing dependencies and relationships" },
                { title: "Review Center", desc: "Governance layer where humans approve AI-suggested knowledge changes" },
                { title: "Agent Compiler", desc: "Build and deploy AI agents from verified knowledge, no vendor lock-in" }
              ].map((feature) => (
                <div key={feature.title} className="panel p-6 space-y-3">
                  <h3 className="body-lg font-semibold text-black">{feature.title}</h3>
                  <p className="body-md text-[#45464d]">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-6 py-20 bg-white border-t border-[#e2e8f0]">
          <div className="max-w-lg mx-auto text-center space-y-6">
            <div className="panel p-10 space-y-6">
              <h2 className="headline-lg text-black font-bold">
                Ready to build <span className="text-[#4648d4]">intelligence</span>?
              </h2>
              <p className="body-md text-[#45464d]">
                No prompts. No generic chatbots. Real knowledge that compiles into agents.
              </p>
              <Button render={<Link href="/register" />} size="lg" className="w-full rounded bg-black text-white hover:bg-black/90">
                Create Account Free
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e2e8f0] bg-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="body-md text-black font-bold">SOPH.IA</p>
          <p className="label-sm text-[#45464d]">© 2026 SOPH.IA. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="label-sm text-[#45464d] hover:text-black transition-colors">
              Login
            </Link>
            <Link href="/register" className="label-sm text-[#45464d] hover:text-black transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
