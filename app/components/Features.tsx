'use client'

import { Database, Brain, Lock, Zap, BarChart3, Users } from 'lucide-react'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  gradient?: boolean
}

const features: Feature[] = [
  {
    icon: <Database className="w-6 h-6" />,
    title: 'Knowledge Graph',
    description: 'Connect and visualize relationships between all your knowledge units. Build an intelligent, interconnected knowledge base.',
    gradient: true
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: 'AI-Powered Intelligence',
    description: 'Leverage advanced AI for semantic search, automatic categorization, and intelligent recommendations.',
    gradient: true
  },
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Enterprise Security',
    description: 'Built-in role-based access control, encryption, and compliance features for peace of mind.',
    gradient: true
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'Real-time Collaboration',
    description: 'Work together in real-time with version control, comments, and team workflows.',
    gradient: true
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Advanced Analytics',
    description: 'Track knowledge usage, engagement, and impact with detailed insights and reporting.',
    gradient: true
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Team Management',
    description: 'Organize teams, manage permissions, and create workflows tailored to your organization.',
    gradient: true
  }
]

export function Features() {
  return (
    <section id="features" className="relative py-24 border-t border-slate-800">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features
            <span className="block text-azure">Built for Scale</span>
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Everything you need to manage, organize, and leverage knowledge at enterprise scale.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="card-base group hover:border-azure/50 hover:shadow-lg hover:shadow-azure/20 cursor-pointer"
            >
              <div className="text-azure mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-100 mb-3">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Decorative Element */}
        <div className="mt-20 pt-20 border-t border-slate-800">
          <div className="text-center">
            <h3 className="text-2xl font-semibold mb-8 text-slate-100">
              Ready to transform your knowledge management?
            </h3>
            <button className="button-primary text-lg px-8 py-4">
              Start Your Journey
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
