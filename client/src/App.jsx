import React, { createContext, useContext, useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import DoubtSolver from './pages/DoubtSolver'
import NotesGenerator from './pages/NotesGenerator'
import QuizPage from './pages/QuizPage'

// ── Theme Context ─────────────────────────────────────────────────────────────
export const ThemeContext = createContext(null)
export const useTheme = () => useContext(ThemeContext)

// ── Session Context ───────────────────────────────────────────────────────────
export const SessionContext = createContext(null)
export const useSession = () => useContext(SessionContext)

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const [sessionId] = useState(() => {
    let id = localStorage.getItem('sessionId')
    if (!id) { id = uuidv4(); localStorage.setItem('sessionId', id) }
    return id
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleTheme = () => setDark(d => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      <SessionContext.Provider value={{ sessionId }}>
        <BrowserRouter>
          <div className="min-h-screen dot-grid transition-colors duration-300" style={{ background: 'var(--bg-primary)' }}>
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/"            element={<Home />} />
                <Route path="/ask"         element={<DoubtSolver />} />
                <Route path="/notes"       element={<NotesGenerator />} />
                <Route path="/quiz"        element={<QuizPage />} />
                <Route path="*"            element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </SessionContext.Provider>
    </ThemeContext.Provider>
  )
}
