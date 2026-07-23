import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { checkHealth } from '../services/api'

const FEATURES = [
  {
    path: '/ask',
    icon: '💬',
    title: 'AI Doubt Solver',
    desc: 'Ask any question and get detailed, structured explanations with conversation history.',
    gradient: 'from-sky-500 to-blue-600',
    glow: 'rgba(14,165,233,0.25)',
    badge: 'Conversational',
    badgeColor: '#0ea5e9',
  },
  {
    path: '/notes',
    icon: '📄',
    title: 'Notes Generator',
    desc: 'Upload any PDF and get concise, well-structured study notes in seconds.',
    gradient: 'from-violet-500 to-purple-700',
    glow: 'rgba(139,92,246,0.25)',
    badge: 'PDF Powered',
    badgeColor: '#8b5cf6',
  },
  {
    path: '/quiz',
    icon: '🎯',
    title: 'Quiz Generator',
    desc: 'Generate interactive MCQ quizzes on any topic with automatic scoring & explanations.',
    gradient: 'from-emerald-500 to-teal-600',
    glow: 'rgba(16,185,129,0.25)',
    badge: 'Interactive',
    badgeColor: '#10b981',
  },
]

const STATS = [
  { label: 'AI-Powered', value: '100%' },
  { label: 'Topics Supported', value: '∞' },
  { label: 'Response Speed', value: '<3s' },
  { label: 'MCQ Options', value: '4 each' },
]

export default function Home() {
  const [apiOnline, setApiOnline] = useState(null)

  useEffect(() => {
    checkHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  return (
    <div className="page-enter min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pt-20 pb-16 text-center">
        {/* Ambient blobs */}
        <div className="absolute -top-20 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #0ea5e9, transparent)' }} />
        <div className="absolute top-10 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        <div className="relative mx-auto max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold mb-6 animate-fade-in"
            style={{ borderColor: 'rgba(14,165,233,0.3)', background: 'rgba(14,165,233,0.08)', color: '#0ea5e9' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            Powered by GPT · Full-Stack AI Application
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 animate-slide-up"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)', animationDelay: '80ms' }}
          >
            Your Personal
            <br />
            <span className="gradient-text">AI Study Hub</span>
          </h1>

          <p className="text-base sm:text-lg leading-relaxed mb-8 animate-slide-up max-w-xl mx-auto"
            style={{ color: 'var(--text-muted)', animationDelay: '160ms' }}>
            Solve doubts instantly, transform PDFs into structured notes, and test your knowledge — all powered by AI.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 animate-slide-up" style={{ animationDelay: '240ms' }}>
            <Link to="/ask" className="btn-primary text-base px-7 py-3.5">
              Ask AI a Question →
            </Link>
            <Link to="/notes" className="btn-secondary text-base px-7 py-3.5">
              Upload a PDF
            </Link>
          </div>

          {/* API status */}
          {apiOnline !== null && (
            <div className={`inline-flex items-center gap-2 mt-6 text-xs rounded-full px-3 py-1.5 border animate-fade-in ${
              apiOnline
                ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5'
                : 'text-red-400 border-red-500/20 bg-red-500/5'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {apiOnline ? 'Backend online & connected' : 'Backend offline — start the server'}
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 pb-10">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATS.map(s => (
            <div key={s.label} className="glass-card p-4 text-center">
              <div className="text-2xl font-bold gradient-text" style={{ fontFamily: 'var(--font-display)' }}>{s.value}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature cards */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="section-title text-center mb-2">Everything you need to study smarter</h2>
          <p className="text-center text-sm mb-8" style={{ color: 'var(--text-muted)' }}>Three powerful AI tools in one clean interface</p>

          <div className="grid sm:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Link
                key={f.path}
                to={f.path}
                className="glass-card p-6 flex flex-col gap-4 group no-underline"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    style={{ boxShadow: `0 8px 24px ${f.glow}` }}
                  >
                    {f.icon}
                  </div>
                  <span className="badge text-xs" style={{ background: `${f.badgeColor}15`, color: f.badgeColor }}>
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-base mb-1.5" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>

                <div className="mt-auto flex items-center gap-1 text-xs font-semibold" style={{ color: f.badgeColor }}>
                  Try it now <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
