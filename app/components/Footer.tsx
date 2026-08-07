'use client'

import Link from 'next/link'
import { Heart, Star, Share2, Mail } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-slate-800 bg-gradient-to-b from-slate-950 to-slate-900/50">
      <div className="section-container py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-azure flex items-center justify-center font-bold text-slate-950">
                S
              </div>
              <span className="font-bold text-slate-100">SOPH.IA</span>
            </Link>
            <p className="text-sm text-slate-400">
              Knowledge OS for AI. Transform how organizations manage knowledge.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'Security', 'Roadmap'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-slate-400 hover-azure">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Company</h4>
            <ul className="space-y-2">
              {['About', 'Blog', 'Careers', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-slate-400 hover-azure">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Developers</h4>
            <ul className="space-y-2">
              {['Documentation', 'API Docs', 'SDK', 'GitHub'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-slate-400 hover-azure">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Legal</h4>
            <ul className="space-y-2">
              {['Privacy', 'Terms', 'Security', 'Compliance'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm text-slate-400 hover-azure">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 py-8">
          {/* Social Links */}
          <div className="flex justify-between items-center flex-col md:flex-row gap-8">
            <p className="text-sm text-slate-400">
              © {currentYear} SOPH.IA. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {[
                { icon: <Heart size={18} />, href: '#', label: 'GitHub' },
                { icon: <Share2 size={18} />, href: '#', label: 'Twitter' },
                { icon: <Star size={18} />, href: '#', label: 'LinkedIn' },
                { icon: <Mail size={18} />, href: '#', label: 'Email' }
              ].map((social, idx) => (
                <Link
                  key={idx}
                  href={social.href}
                  className="text-slate-400 hover:text-azure transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
