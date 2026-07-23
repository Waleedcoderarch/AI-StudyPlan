import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { checkHealth } from '../services/api'

const TOOLS = [
  {
    path: '/ask',
    title: 'Doubt Solver',
    desc: 'Ask anything and get clear, step-by-step explanations with memory.',
    mark: '01',
    accent: '#1faa8a',
  },
  {
    path: '/notes',
    title: 'Notes Studio',
    desc: 'Drop a PDF and receive structured study notes you can revise from.',
    mark: '02',
    accent: '#c9783a',
  },
  {
    path: '/quiz',
    title: 'Quiz Arena',
    desc: 'Generate MCQs from any topic and score yourself instantly.',
    mark: '03',
    accent: '#1a3348',
  },
]

function HeroScene() {
  return (
    <div className="scene-3d relative h-[340px] sm:h-[420px] lg:h-[520px] w-full" aria-hidden="true">
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Orbit ring */}
        <div className="absolute w-[78%] max-w-[460px] aspect-square rounded-full border border-[color:var(--border)] opacity-60 animate-orbit" />

        {/* Back plane */}
        <div
          className="plane-3d absolute w-[72%] max-w-[420px] aspect-[4/3] rounded-[28px] animate-float-slow"
          style={{
            background: 'linear-gradient(145deg, #122334 0%, #1a3348 55%, #0f6f5c 140%)',
            boxShadow: '0 40px 80px rgba(7,16,24,0.35)',
            transform: 'rotateX(18deg) rotateY(-22deg) translateZ(-40px)',
          }}
        >
          <div className="absolute inset-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5">
            <div className="h-2 w-24 rounded bg-white/25 mb-4" />
            <div className="space-y-2">
              <div className="h-2 w-full rounded bg-white/15" />
              <div className="h-2 w-5/6 rounded bg-white/15" />
              <div className="h-2 w-4/6 rounded bg-white/15" />
            </div>
            <div className="mt-8 grid grid-cols-3 gap-2">
              <div className="h-14 rounded-xl bg-[#1faa8a]/35" />
              <div className="h-14 rounded-xl bg-[#c9783a]/30" />
              <div className="h-14 rounded-xl bg-white/10" />
            </div>
          </div>
        </div>

        {/* Front floating sheet */}
        <div
          className="plane-3d absolute w-[58%] max-w-[320px] aspect-[3/4] rounded-[22px] animate-float-mid"
          style={{
            background: 'linear-gradient(160deg, #fffdf9, #efeae2)',
            boxShadow: '0 30px 70px rgba(11,23,36,0.22)',
            transform: 'rotateX(10deg) rotateY(16deg) translateZ(60px)',
            right: '8%',
            top: '12%',
          }}
        >
          <div className="p-5 h-full flex flex-col">
            <div className="text-[10px] tracking-[0.25em] uppercase text-[#5b6b7c] font-semibold">Session</div>
            <div className="mt-3 font-display text-2xl text-[#0b1724] leading-tight">Study plane</div>
            <div className="mt-auto space-y-2">
              <div className="h-2 rounded bg-[#1faa8a]/25 w-full" />
              <div className="h-2 rounded bg-[#1faa8a]/20 w-4/5" />
              <div className="h-2 rounded bg-[#c9783a]/25 w-3/5" />
            </div>
          </div>
        </div>

        {/* Accent chip */}
        <div
          className="absolute left-[8%] bottom-[18%] rounded-2xl px-4 py-3 text-sm font-semibold text-white animate-rise"
          style={{
            background: 'linear-gradient(135deg, #0f6f5c, #1faa8a)',
            boxShadow: '0 18px 40px rgba(31,170,138,0.35)',
            transform: 'rotateX(8deg) rotateY(-8deg)',
            animationDelay: '0.35s',
          }}
        >
          Live AI workspace
        </div>
      </div>
    </div>
  )
}

function TiltTool({ tool, index }) {
  const ref = useRef(null)

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    const rotX = (0.5 - y) * 10
    const rotY = (x - 0.5) * 14
    el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`
  }

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
  }

  return (
    <Link
      to={tool.path}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="tilt-card group block no-underline rounded-[28px] border p-6 sm:p-7"
      style={{
        borderColor: 'var(--border)',
        background: 'linear-gradient(165deg, color-mix(in srgb, var(--bg-secondary) 92%, transparent), color-mix(in srgb, var(--bg-tertiary) 70%, transparent))',
        boxShadow: 'var(--shadow)',
        animationDelay: `${0.15 + index * 0.08}s`,
      }}
    >
      <div className="flex items-baseline justify-between mb-8">
        <span className="font-mono text-xs tracking-widest" style={{ color: tool.accent }}>{tool.mark}</span>
        <span
          className="h-10 w-10 rounded-xl grid place-items-center text-white text-lg transition-transform duration-300 group-hover:rotate-6"
          style={{ background: tool.accent }}
        >
          →
        </span>
      </div>
      <h3 className="font-display text-2xl mb-2" style={{ color: 'var(--text-primary)' }}>{tool.title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{tool.desc}</p>
    </Link>
  )
}

export default function Home() {
  const [apiOnline, setApiOnline] = useState(null)

  useEffect(() => {
    checkHealth()
      .then(() => setApiOnline(true))
      .catch(() => setApiOnline(false))
  }, [])

  return (
    <div className="page-enter">
      {/* Hero — one composition */}
      <section className="relative overflow-hidden min-h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 atmosphere pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-6 items-center">
            <div className="max-w-xl">
              <p
                className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] tracking-tight animate-rise"
                style={{ color: 'var(--text-primary)' }}
              >
                AI Study Hub
              </p>
              <h1
                className="mt-5 text-xl sm:text-2xl font-medium leading-snug animate-rise"
                style={{ color: 'var(--text-primary)', animationDelay: '0.08s' }}
              >
                A dimensional workspace for doubts, notes, and quizzes.
              </h1>
              <p
                className="mt-4 text-base leading-relaxed animate-rise max-w-md"
                style={{ color: 'var(--text-muted)', animationDelay: '0.16s' }}
              >
                Built for focused learning — ask clearly, capture notes from PDFs, and pressure-test what you know.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 animate-rise" style={{ animationDelay: '0.24s' }}>
                <Link to="/ask" className="btn-primary px-7 py-3.5 text-base">
                  Enter workspace
                </Link>
                <Link to="/notes" className="btn-secondary px-7 py-3.5 text-base">
                  Generate notes
                </Link>
              </div>

              {apiOnline !== null && (
                <p
                  className="mt-6 text-xs font-medium tracking-wide animate-rise"
                  style={{ color: apiOnline ? 'var(--accent-deep)' : '#b45309', animationDelay: '0.32s' }}
                >
                  {apiOnline ? 'Systems connected' : 'Backend offline — start the API'}
                </p>
              )}
            </div>

            <div className="animate-rise" style={{ animationDelay: '0.12s' }}>
              <HeroScene />
            </div>
          </div>
        </div>
      </section>

      {/* Tools — interaction surfaces */}
      <section className="relative px-4 sm:px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-xl">
            <h2 className="font-display text-3xl sm:text-4xl" style={{ color: 'var(--text-primary)' }}>
              Three surfaces. One flow.
            </h2>
            <p className="mt-3 text-sm sm:text-base" style={{ color: 'var(--text-muted)' }}>
              Move from question to notes to quiz without leaving the study plane.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 scene-3d">
            {TOOLS.map((tool, i) => (
              <TiltTool key={tool.path} tool={tool} index={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
