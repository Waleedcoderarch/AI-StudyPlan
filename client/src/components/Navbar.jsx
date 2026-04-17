import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../App'

const NAV_LINKS = [
  { path: '/',      label: 'Home',        icon: '⬡' },
  { path: '/ask',   label: 'Ask AI',      icon: '💬' },
  { path: '/notes', label: 'Notes',       icon: '📄' },
  { path: '/quiz',  label: 'Quiz',        icon: '🎯' },
]

export default function Navbar() {
  const { dark, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-xl border-b'
          : 'backdrop-blur-sm'
      }`}
      style={{
        background: scrolled
          ? dark ? 'rgba(8,13,20,0.9)' : 'rgba(248,250,252,0.9)'
          : 'transparent',
        borderColor: 'var(--border)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 opacity-90 group-hover:opacity-100 transition-opacity" />
              <span className="relative flex items-center justify-center h-full text-white text-sm font-bold">✦</span>
            </div>
            <span className="font-bold text-base tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              AI Study<span className="gradient-text">Hub</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  pathname === path
                    ? 'bg-sky-500/10 text-sky-500 shadow-inner'
                    : 'hover:bg-sky-500/5'
                }`}
                style={{ color: pathname === path ? '#0ea5e9' : 'var(--text-muted)' }}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-base transition-all duration-200 hover:scale-110"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
              aria-label="Toggle theme"
            >
              {dark ? '☀️' : '🌙'}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              aria-label="Menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            className="md:hidden pb-4 pt-2 animate-fade-in space-y-1"
            style={{ borderTop: `1px solid var(--border)` }}
          >
            {NAV_LINKS.map(({ path, label, icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  pathname === path ? 'bg-sky-500/10 text-sky-500' : ''
                }`}
                style={{ color: pathname === path ? '#0ea5e9' : 'var(--text-primary)' }}
              >
                <span>{icon}</span> {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
