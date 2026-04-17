import React, { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'

const OPTION_LABELS = ['A', 'B', 'C', 'D']

function OptionButton({ label, text, selected, correct, revealed, onClick }) {
  let style = {}
  let extra = ''

  if (revealed) {
    if (label === correct) {
      style = { background: 'rgba(34,197,94,0.15)', borderColor: '#22c55e', color: '#22c55e' }
    } else if (selected === label && label !== correct) {
      style = { background: 'rgba(239,68,68,0.12)', borderColor: '#ef4444', color: '#ef4444' }
    } else {
      style = { opacity: 0.45 }
    }
  } else if (selected === label) {
    style = { background: 'rgba(14,165,233,0.12)', borderColor: '#0ea5e9', color: '#0ea5e9' }
  }

  return (
    <button
      onClick={onClick}
      disabled={revealed}
      className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${revealed ? '' : 'hover:border-sky-400 hover:-translate-y-0.5'} disabled:cursor-default`}
      style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', ...style }}
    >
      <span className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
        style={{ background: 'var(--bg-tertiary)' }}>
        {label}
      </span>
      <span className="leading-relaxed">{text}</span>
      {revealed && label === correct && <span className="ml-auto text-green-500 flex-shrink-0">✓</span>}
      {revealed && selected === label && label !== correct && <span className="ml-auto text-red-500 flex-shrink-0">✗</span>}
    </button>
  )
}

function Timer({ seconds, total }) {
  const pct = ((total - seconds) / total) * 100
  const color = seconds <= 10 ? '#ef4444' : seconds <= 20 ? '#f59e0b' : '#0ea5e9'
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0')
  const secs = String(seconds % 60).padStart(2, '0')

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-8">
        <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="13" fill="none" stroke="var(--border)" strokeWidth="3" />
          <circle
            cx="16" cy="16" r="13" fill="none"
            stroke={color} strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 13}`}
            strokeDashoffset={`${2 * Math.PI * 13 * (pct / 100)}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
          />
        </svg>
      </div>
      <span className="text-sm font-mono font-semibold" style={{ color }}>{mins}:{secs}</span>
    </div>
  )
}

function ResultScreen({ questions, answers, timeTaken, onRetry, onNewQuiz }) {
  const score = answers.filter(a => a.selected === a.correct).length
  const pct = Math.round((score / questions.length) * 100)
  const grade = pct >= 80 ? { label: 'Excellent! 🏆', color: '#22c55e' }
              : pct >= 60 ? { label: 'Good Job! 👏', color: '#0ea5e9' }
              : pct >= 40 ? { label: 'Keep Practicing 📚', color: '#f59e0b' }
              : { label: 'Needs Work 💪', color: '#ef4444' }
  const mins = Math.floor(timeTaken / 60)
  const secs = timeTaken % 60

  return (
    <div className="animate-fade-in space-y-6">
      {/* Score card */}
      <div className="glass-card p-8 text-center">
        <div className="relative inline-block mb-4">
          <svg className="w-28 h-28" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke={grade.color} strokeWidth="8"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold" style={{ fontFamily: 'var(--font-display)', color: grade.color }}>{pct}%</span>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{grade.label}</h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          You scored <strong style={{ color: 'var(--text-primary)' }}>{score}/{questions.length}</strong> in&nbsp;
          {mins > 0 ? `${mins}m ` : ''}{secs}s
        </p>
      </div>

      {/* Review */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm" style={{ color: 'var(--text-muted)' }}>QUESTION REVIEW</h3>
        {questions.map((q, i) => {
          const a = answers[i]
          const correct = a?.selected === a?.correct
          return (
            <div key={q.id} className="glass-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  <span className="mr-2 font-bold" style={{ color: 'var(--text-muted)' }}>Q{i + 1}.</span>
                  {q.question}
                </p>
                <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: correct ? '#22c55e' : '#ef4444' }}>
                  {correct ? '✓' : '✗'}
                </span>
              </div>
              {!correct && a?.selected && (
                <p className="text-xs text-red-400">Your answer: {a.selected} — {q.options[a.selected]}</p>
              )}
              <p className="text-xs text-green-500">✓ Correct: {a?.correct} — {q.options[a?.correct]}</p>
              {q.explanation && (
                <p className="text-xs italic mt-1" style={{ color: 'var(--text-muted)' }}>💡 {q.explanation}</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onRetry} className="btn-secondary flex-1">↩ Retry Quiz</button>
        <button onClick={onNewQuiz} className="btn-primary flex-1">+ New Quiz</button>
      </div>
    </div>
  )
}

export default function QuizUI({ quiz, onNewQuiz }) {
  const { questions, title } = quiz
  const TIME_PER_Q = 30
  const TOTAL_TIME = questions.length * TIME_PER_Q

  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [answers, setAnswers] = useState([])
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [done, setDone] = useState(false)
  const [timeTaken, setTimeTaken] = useState(0)

  const current = questions[currentIdx]

  const finishQuiz = useCallback((finalAnswers, takenTime) => {
    setDone(true)
    setTimeTaken(takenTime ?? (TOTAL_TIME - timeLeft))
  }, [TOTAL_TIME, timeLeft])

  // Timer
  useEffect(() => {
    if (done) return
    if (timeLeft <= 0) {
      // Time up — auto-finish
      const remaining = questions.slice(currentIdx).map((q) => ({
        selected: null,
        correct: q.correctAnswer
      }))
      finishQuiz([...answers, ...remaining], TOTAL_TIME)
      return
    }
    const t = setTimeout(() => setTimeLeft(l => l - 1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, done])

  const handleSelect = (label) => {
    if (revealed) return
    setSelected(label)
  }

  const handleConfirm = () => {
    if (!selected || revealed) return
    setRevealed(true)
  }

  const handleNext = () => {
    const newAnswers = [...answers, { selected, correct: current.correctAnswer }]
    if (currentIdx + 1 >= questions.length) {
      finishQuiz(newAnswers, TOTAL_TIME - timeLeft)
      setAnswers(newAnswers)
      return
    }
    setAnswers(newAnswers)
    setCurrentIdx(i => i + 1)
    setSelected(null)
    setRevealed(false)
  }

  const handleRetry = () => {
    setCurrentIdx(0); setSelected(null); setRevealed(false)
    setAnswers([]); setTimeLeft(TOTAL_TIME); setDone(false); setTimeTaken(0)
  }

  if (done) {
    return <ResultScreen questions={questions} answers={answers} timeTaken={timeTaken} onRetry={handleRetry} onNewQuiz={onNewQuiz} />
  }

  const progress = ((currentIdx) / questions.length) * 100

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>
            Question {currentIdx + 1} / {questions.length}
          </p>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
        </div>
        <Timer seconds={timeLeft} total={TOTAL_TIME} />
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${progress}%`, background: 'linear-gradient(90deg,#0ea5e9,#8b5cf6)' }}
        />
      </div>

      {/* Question */}
      <div className="glass-card p-5">
        <p className="font-semibold text-base leading-relaxed" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {current.question}
        </p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {OPTION_LABELS.map(label => (
          current.options[label] ? (
            <OptionButton
              key={label}
              label={label}
              text={current.options[label]}
              selected={selected}
              correct={current.correctAnswer}
              revealed={revealed}
              onClick={() => handleSelect(label)}
            />
          ) : null
        ))}
      </div>

      {/* Explanation */}
      {revealed && current.explanation && (
        <div className="px-4 py-3 rounded-xl text-sm animate-fade-in" style={{ background: 'rgba(14,165,233,0.08)', border: '1px solid rgba(14,165,233,0.2)', color: 'var(--text-primary)' }}>
          💡 <strong>Explanation:</strong> {current.explanation}
        </div>
      )}

      {/* Action */}
      <div className="flex gap-3">
        {!revealed ? (
          <button onClick={handleConfirm} disabled={!selected} className="btn-primary flex-1">
            Confirm Answer
          </button>
        ) : (
          <button onClick={handleNext} className="btn-primary flex-1">
            {currentIdx + 1 >= questions.length ? '🏁 Finish Quiz' : 'Next Question →'}
          </button>
        )}
      </div>
    </div>
  )
}
