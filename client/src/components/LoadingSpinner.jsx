import React from 'react'

export function Spinner({ size = 'md', color = '#0ea5e9' }) {
  const sizes = { sm: 16, md: 24, lg: 36, xl: 48 }
  const px = sizes[size] || 24
  return (
    <svg
      width={px} height={px}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ color }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor" strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm w-fit"
      style={{ background: 'var(--bg-tertiary)' }}>
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="glass-card p-5 space-y-3">
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="shimmer-box rounded-lg h-4"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function PageLoader({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 animate-spin-slow" />
        <div className="absolute inset-2 rounded-full border-4 border-t-sky-500 border-r-violet-500 border-b-transparent border-l-transparent animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center text-2xl">✦</div>
      </div>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{message}</p>
    </div>
  )
}
