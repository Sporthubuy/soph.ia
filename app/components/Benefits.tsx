'use client'

import { TrendingUp, Clock, Shield, Lightbulb } from 'lucide-react'

export function Benefits() {
  const benefits = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'Increase Productivity',
      description: 'Find and leverage knowledge 10x faster. Reduce time spent searching and recreating solutions.',
      metrics: '45% faster knowledge discovery'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Save Time & Resources',
      description: 'Eliminate redundant work and silos. Let your team focus on what matters most.',
      metrics: '3 hours saved per week per employee'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Preserve Knowledge',
      description: 'Never lose institutional knowledge again. Capture, version, and protect critical information.',
      metrics: '100% knowledge retention'
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: 'Drive Innovation',
      description: 'Connect ideas across teams. Build on existing knowledge to create breakthrough innovations.',
      metrics: '2x faster innovation cycles'
    }
  ]

  return (
    <section id="benefits" className="relative py-24 border-t border-slate-800">
      <div className="section-container">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Real Impact
            <span className="block text-azure">Measurable Results</span>
          </h2>
          <p className="text-lg text-slate-400">
            Organizations using SOPH.IA see immediate improvements in productivity, collaboration, and innovation.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, idx) => (
            <div
              key={idx}
              className="card-base border-l-2 border-l-azure hover:border-l-azure hover:shadow-lg hover:shadow-azure/20"
            >
              <div className="text-azure mb-4">
                {benefit.icon}
              </div>
              <h3 className="text-2xl font-semibold text-slate-100 mb-3">
                {benefit.title}
              </h3>
              <p className="text-slate-400 mb-4 leading-relaxed">
                {benefit.description}
              </p>
              <div className="text-sm font-mono text-azure">
                {benefit.metrics}
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Enterprise Customers', value: '500+' },
            { label: 'Knowledge Units Managed', value: '1M+' },
            { label: 'Team Collaboration', value: '99.9% Uptime' },
            { label: 'AI Processing', value: '1B+ Queries/mo' }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 card-base">
              <div className="text-3xl font-bold text-azure mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
