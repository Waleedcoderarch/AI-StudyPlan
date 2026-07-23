import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTheme } from '../App'

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/ask', label: 'Ask' },
  { path: '/notes', label: 'Notes' },
  { path: '/quiz', label: 'Quiz' },
]

export default function Navbar() {
  const { dark, toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'color-mix(in srgb, var(--bg-primary) 86%, transparent)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span
              className="grid place-items-center h-9 w-9 rounded-xl text-white text-sm font-bold transition-transform duration-300 group-hover:rotate-6"
              style={{ background: 'linear-gradient(145deg, #0f6f5c, #1faa8a)' }}
            >
              AH
            </span>
            <span className="font-display text-lg tracking-tight" style={{ color: 'var(--text-primary)' }}>
              AI Study Hub
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ path, label }) => {
              const active = pathname === path
              return (
                <Link
                  key={path}
                  to={path}
                  className="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    color: active ? 'var(--accent-deep)' : 'var(--text-muted)',
                    background: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="h-9 w-9 rounded-xl grid place-items-center text-xs font-semibold tracking-wide transition-transform hover:scale-105"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
              aria-label="Toggle theme"
            >
              {dark ? 'DAY' : 'NIGHT'}
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden h-9 w-9 rounded-xl grid place-items-center text-sm font-semibold"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              aria-label="Menu"
            >
              {menuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 space-y-1" style={{ borderTop: '1px solid var(--border)' }}>
            {NAV_LINKS.map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                className="block px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  color: pathname === path ? 'var(--accent-deep)' : 'var(--text-primary)',
                  background: pathname === path ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}
