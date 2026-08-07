'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative min-h-screen pt-32 pb-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 gradient-mesh opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#5B9BFF]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#F43F5E]/5 rounded-full blur-3xl" />

      <div className="section-container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/50 border border-slate-800 mb-8 text-slate-300 text-sm">
            <Sparkles size={16} className="text-azure" />
            <span>Welcome to the future of knowledge management</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            <span className="block text-slate-100">Knowledge OS</span>
            <span className="block gradient-azure bg-clip-text text-transparent">for AI</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform how your organization manages, shares, and leverages knowledge. Versionable Knowledge Units powered by advanced AI, built for enterprise collaboration.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/app" className="button-primary flex items-center justify-center gap-2 group">
              Launch SOPH.IA
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="button-secondary">
              View Documentation
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {[
              {
                icon: '📚',
                title: 'Versionable KUs',
                description: 'Track every iteration of your knowledge units with full version history'
              },
              {
                icon: '🧠',
                title: 'Knowledge Graph',
                description: 'Visualize relationships between concepts and build intelligent connections'
              },
              {
                icon: '⚡',
                title: 'AI-Powered',
                description: 'Leverage advanced AI for intelligent search, synthesis, and recommendations'
              }
            ].map((feature, idx) => (
              <div key={idx} className="card-base group hover:border-azure/50 hover:bg-gradient-to-br hover:from-slate-900/80 hover:to-slate-950/50">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-slate-100 mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visualization */}
        <div className="mt-20 relative">
          <div className="aspect-video bg-gradient-to-b from-slate-900/50 to-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 1200 600" xmlns="http://www.w3.org/2000/svg">
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.5" opacity="0.3" />
                </pattern>
                <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5B9BFF" />
                  <stop offset="100%" stopColor="#8BB9FF" />
                </linearGradient>
              </defs>

              {/* Grid */}
              <rect width="1200" height="600" fill="url(#grid)" />

              {/* Connection Lines */}
              <g stroke="#5B9BFF" strokeWidth="2" opacity="0.4">
                <line x1="300" y1="200" x2="600" y2="300" />
                <line x1="600" y1="300" x2="900" y2="200" />
                <line x1="600" y1="300" x2="400" y2="450" />
                <line x1="600" y1="300" x2="800" y2="450" />
              </g>

              {/* Nodes */}
              <g>
                <circle cx="300" cy="200" r="20" fill="url(#nodeGradient)" opacity="0.8" />
                <circle cx="600" cy="300" r="28" fill="#5B9BFF" opacity="1" />
                <circle cx="900" cy="200" r="20" fill="url(#nodeGradient)" opacity="0.8" />
                <circle cx="400" cy="450" r="18" fill="#8BB9FF" opacity="0.6" />
                <circle cx="800" cy="450" r="18" fill="#8BB9FF" opacity="0.6" />

                {/* Labels */}
                <text x="300" y="205" textAnchor="middle" className="text-xs fill-slate-100" opacity="0.7">KU</text>
                <text x="600" y="310" textAnchor="middle" className="text-sm fill-slate-900" opacity="0.9" fontWeight="bold">Core</text>
                <text x="900" y="205" textAnchor="middle" className="text-xs fill-slate-100" opacity="0.7">KU</text>
              </g>

              {/* Decorative Elements */}
              <g opacity="0.1">
                <circle cx="200" cy="100" r="40" fill="#5B9BFF" />
                <circle cx="1000" cy="500" r="60" fill="#F43F5E" />
              </g>
            </svg>

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent opacity-40" />
          </div>
        </div>
      </div>
    </section>
  )
}
