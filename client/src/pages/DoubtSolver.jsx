import React, { useState, useEffect } from 'react'
import { useSession } from '../App'
import ChatUI from '../components/ChatUI'
import { askQuestion, getConversationHistory } from '../services/api'

export default function DoubtSolver() {
  const { sessionId } = useSession()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Load conversation history
  useEffect(() => {
    getConversationHistory(sessionId)
      .then(res => {
        if (res.messages?.length > 0) {
          const loaded = res.messages.flatMap(m => [
            { id: `u-${m._id}`, role: 'user',      content: m.question,  timestamp: m.timestamp },
            { id: `a-${m._id}`, role: 'assistant', content: m.answer,    timestamp: m.timestamp }
          ])
          setMessages(loaded)
        }
      })
      .catch(() => {}) // Silently fail — DB may not be configured
      .finally(() => setLoadingHistory(false))
  }, [sessionId])

  const handleSend = async (question) => {
    setError('')

    // Optimistically add user message
    const userMsg = { id: Date.now() + '-u', role: 'user', content: question, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    // Build history for context (last 6 exchanges)
    const history = []
    const recent = messages.slice(-12)
    for (let i = 0; i < recent.length - 1; i += 2) {
      if (recent[i]?.role === 'user' && recent[i + 1]?.role === 'assistant') {
        history.push({ question: recent[i].content, answer: recent[i + 1].content })
      }
    }

    try {
      const res = await askQuestion(question, sessionId, history)
      const aiMsg = {
        id: Date.now() + '-a',
        role: 'assistant',
        content: res.answer,
        timestamp: res.timestamp
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      setError(err.message)
      // Remove the optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMsg.id))
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([])
    setError('')
  }

  return (
    <div className="page-enter mx-auto max-w-4xl px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white"
              style={{ background: 'linear-gradient(145deg, #0f6f5c, #1faa8a)' }}
            >
              01
            </div>
            <h1 className="section-title">Doubt Solver</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ask clearly — get structured answers with conversation memory
          </p>
        </div>
        {messages.length > 0 && (
          <button onClick={handleClear} className="btn-secondary text-xs py-2 px-3">
            Clear chat
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-4 text-sm border"
          style={{ background: 'rgba(180,83,9,0.08)', borderColor: 'rgba(180,83,9,0.25)', color: '#b45309' }}>
          <div>
            <strong>Error:</strong> {error}
            <button onClick={() => setError('')} className="ml-3 underline text-xs opacity-70">dismiss</button>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: 480, display: 'flex', flexDirection: 'column' }}>
        {loadingHistory ? (
          <div className="flex items-center justify-center h-full gap-3" style={{ color: 'var(--text-muted)' }}>
            <div className="w-5 h-5 border-2 border-[color:var(--accent)] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm">Loading history…</span>
          </div>
        ) : (
          <ChatUI
            messages={messages}
            isLoading={loading}
            onSend={handleSend}
            disabled={false}
          />
        )}
      </div>

      <div className="flex items-center justify-between mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>History saves automatically</span>
        <span>{messages.filter(m => m.role === 'user').length} questions</span>
      </div>
    </div>
  )
}
