'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 blur-backdrop border-b border-slate-800/50">
      <nav className="section-container flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-azure flex items-center justify-center font-bold text-slate-950">
            S
          </div>
          <span className="font-bold text-lg text-slate-100 group-hover:text-azure transition-colors">
            SOPH.IA
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-slate-300 hover-azure text-sm font-medium">
            Features
          </Link>
          <Link href="#benefits" className="text-slate-300 hover-azure text-sm font-medium">
            Benefits
          </Link>
          <Link href="#pricing" className="text-slate-300 hover-azure text-sm font-medium">
            Pricing
          </Link>
          <Link href="#docs" className="text-slate-300 hover-azure text-sm font-medium">
            Docs
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button className="button-secondary text-sm">
            Sign In
          </button>
          <button className="button-primary text-sm">
            Get Started
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-slate-300 hover:text-azure transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-900/90 border-b border-slate-800">
          <div className="section-container py-4 flex flex-col gap-4">
            <Link href="#features" className="text-slate-300 hover-azure py-2">
              Features
            </Link>
            <Link href="#benefits" className="text-slate-300 hover-azure py-2">
              Benefits
            </Link>
            <Link href="#pricing" className="text-slate-300 hover-azure py-2">
              Pricing
            </Link>
            <Link href="#docs" className="text-slate-300 hover-azure py-2">
              Docs
            </Link>
            <div className="flex flex-col gap-2 pt-4">
              <button className="button-secondary w-full text-sm">
                Sign In
              </button>
              <button className="button-primary w-full text-sm">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
