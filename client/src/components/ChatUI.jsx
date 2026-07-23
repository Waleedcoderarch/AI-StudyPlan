import React, { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TypingIndicator } from './LoadingSpinner'

function MessageBubble({ msg, index }) {
  const isUser = msg.role === 'user'
  return (
    <div
      className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center text-sm font-bold shadow-md ${
          isUser
            ? 'bg-gradient-to-br from-sky-500 to-violet-600 text-white'
            : 'bg-gradient-to-br from-emerald-400 to-sky-500 text-white'
        }`}
      >
        {isUser ? '✦' : '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
            isUser
              ? 'rounded-tr-sm text-white'
              : 'rounded-tl-sm'
          }`}
          style={
            isUser
              ? { background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', color: '#fff' }
              : { background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
          }
        >
          {isUser ? (
            <p style={{ lineHeight: 1.6 }}>{msg.content}</p>
          ) : (
            <div className="prose-custom">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)', paddingLeft: isUser ? 0 : 4, paddingRight: isUser ? 4 : 0, textAlign: isUser ? 'right' : 'left' }}>
          {msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'just now'}
        </span>
      </div>
    </div>
  )
}

export default function ChatUI({ messages, isLoading, onSend, disabled }) {
  const bottomRef = useRef(null)
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const q = input.trim()
    if (!q || isLoading || disabled) return
    onSend(q)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
    }
  }

  const QUICK = [
    'Explain photosynthesis simply',
    'What is machine learning?',
    'How does gravity work?',
    'Explain DNA in simple terms'
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-6 py-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center text-3xl border" style={{ borderColor: 'var(--border)' }}>
              🤖
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                Ask me anything!
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                I'll give you clear, structured answers instantly.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-sm">
              {QUICK.map(q => (
                <button
                  key={q}
                  onClick={() => onSend(q)}
                  disabled={disabled}
                  className="text-xs px-3 py-2.5 rounded-xl border text-left transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'var(--bg-tertiary)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} msg={msg} index={i} />
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 flex-shrink-0 rounded-xl bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center text-sm text-white">🤖</div>
            <TypingIndicator />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <div
          className="flex items-end gap-2 rounded-2xl p-2 border transition-all"
          style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            disabled={disabled || isLoading}
            placeholder="Ask your doubt here… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none py-2 px-2 leading-relaxed"
            style={{ maxHeight: 140, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading || disabled}
            className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
          AI can make mistakes — always verify important information
        </p>
      </div>
    </div>
  )
}
