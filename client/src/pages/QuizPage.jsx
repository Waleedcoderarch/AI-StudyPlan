import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSession } from '../App'
import QuizUI from '../components/QuizUI'
import { Spinner } from '../components/LoadingSpinner'
import { generateQuiz, saveQuizResult } from '../services/api'

const QUESTION_COUNTS = [5, 7, 10]

const TOPIC_SUGGESTIONS = [
  'Photosynthesis', 'World War II', 'Newton\'s Laws of Motion',
  'Machine Learning Basics', 'DNA and Genetics', 'The French Revolution',
  'Organic Chemistry', 'Calculus Fundamentals', 'Climate Change',
  'The Solar System'
]

export default function QuizPage() {
  const { sessionId } = useSession()
  const [searchParams] = useSearchParams()
  const prefilledText = searchParams.get('text') || ''

  const [mode, setMode] = useState(prefilledText ? 'pdf' : 'topic') // 'topic' | 'pdf'
  const [topic, setTopic] = useState('')
  const [pdfText, setPdfText] = useState(prefilledText)
  const [questionCount, setQuestionCount] = useState(7)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [quizId, setQuizId] = useState(null)

  const handleGenerate = async () => {
    const input = mode === 'topic' ? topic.trim() : pdfText.trim()
    if (!input) {
      setError(mode === 'topic' ? 'Please enter a topic.' : 'Please paste PDF text.')
      return
    }

    setError('')
    setLoading(true)
    setQuiz(null)

    try {
      const res = await generateQuiz(input, mode === 'pdf' ? 'pdf' : 'topic', questionCount, sessionId)
      setQuiz({ title: res.title, questions: res.questions })
      setQuizId(res.quizId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNewQuiz = () => {
    setQuiz(null)
    setError('')
    setTopic('')
  }

  const handleQuizComplete = async (score, totalQuestions, timeTaken) => {
    try {
      await saveQuizResult({
        quizId,
        sessionId,
        score,
        totalQuestions,
        timeTaken,
        quizTitle: quiz?.title,
        topic: mode === 'topic' ? topic : 'PDF Content'
      })
    } catch (_) {}
  }

  return (
    <div className="page-enter mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-base">🎯</div>
        <h1 className="section-title">Quiz Generator</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
        Generate interactive MCQ quizzes on any topic or from PDF content
      </p>

      {!quiz ? (
        <div className="space-y-5 animate-fade-in">
          {/* Mode selector */}
          <div className="glass-card p-1.5 flex gap-1">
            {[['topic', '📚 By Topic'], ['pdf', '📄 From PDF Text']].map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${mode === m ? 'text-white shadow-md' : ''}`}
                style={mode === m
                  ? { background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)' }
                  : { color: 'var(--text-muted)', background: 'transparent' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="glass-card p-5 space-y-4">
            {mode === 'topic' ? (
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Enter Topic
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                  placeholder="e.g. Photosynthesis, World War II, Machine Learning…"
                  className="glass-input"
                />
                {/* Suggestions */}
                <div className="mt-3">
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Suggested topics:</p>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_SUGGESTIONS.slice(0, 6).map(s => (
                      <button
                        key={s}
                        onClick={() => setTopic(s)}
                        className="text-xs px-3 py-1.5 rounded-full border transition-all hover:-translate-y-0.5"
                        style={{ borderColor: 'var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Paste PDF Text (or it auto-fills from Notes page)
                </label>
                <textarea
                  value={pdfText}
                  onChange={e => setPdfText(e.target.value)}
                  placeholder="Paste the extracted text from your PDF here…"
                  rows={6}
                  className="glass-input resize-none"
                  style={{ minHeight: 140 }}
                />
                {pdfText && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                    {pdfText.length.toLocaleString()} characters loaded
                  </p>
                )}
              </div>
            )}

            {/* Question count */}
            <div>
              <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Number of Questions
              </label>
              <div className="flex gap-2">
                {QUESTION_COUNTS.map(n => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200 ${questionCount === n ? 'text-white' : ''}`}
                    style={questionCount === n
                      ? { background: 'linear-gradient(135deg,#0ea5e9,#8b5cf6)', borderColor: 'transparent' }
                      : { borderColor: 'var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }
                    }
                  >
                    {n} Qs
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm border animate-fade-in"
              style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Generate btn */}
          <button onClick={handleGenerate} disabled={loading} className="btn-primary w-full text-base py-3.5">
            {loading
              ? <><Spinner size="sm" color="#fff" /> Generating {questionCount} questions…</>
              : `✨ Generate ${questionCount}-Question Quiz`
            }
          </button>

          {loading && (
            <p className="text-center text-xs animate-pulse" style={{ color: 'var(--text-muted)' }}>
              This may take 10–20 seconds…
            </p>
          )}
        </div>
      ) : (
        <div className="animate-fade-in">
          <QuizUI quiz={quiz} onNewQuiz={handleNewQuiz} onComplete={handleQuizComplete} />
        </div>
      )}
    </div>
  )
}
