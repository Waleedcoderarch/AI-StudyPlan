import axios from 'axios'

const BASE_URL = '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s for AI calls
  headers: { 'Content-Type': 'application/json' }
})

// Response interceptor for consistent error handling
api.interceptors.response.use(
  res => res.data,
  err => {
    const message =
      err.response?.data?.message ||
      (err.code === 'ECONNABORTED' ? 'Request timed out. Please try again.' : null) ||
      (err.message === 'Network Error' ? 'Cannot connect to server. Is the backend running?' : null) ||
      err.message ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  }
)

// ── Doubt Solver ────────────────────────────────────────────────────────────
export const askQuestion = (question, sessionId, history = []) =>
  api.post('/ask', { question, sessionId, history })

export const getConversationHistory = sessionId =>
  api.get(`/ask/history/${sessionId}`)

// ── PDF Upload ───────────────────────────────────────────────────────────────
export const uploadPDF = (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('pdf', file)
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
    onUploadProgress
  })
}

// ── Notes ────────────────────────────────────────────────────────────────────
export const generateNotes = (text, fileName, sessionId, pages, fileSize) =>
  api.post('/notes', { text, fileName, sessionId, pages, fileSize })

export const getNotesHistory = sessionId =>
  api.get(`/notes/history/${sessionId}`)

// ── Quiz ─────────────────────────────────────────────────────────────────────
export const generateQuiz = (input, inputType = 'topic', questionCount = 7, sessionId) =>
  api.post('/quiz', { input, inputType, questionCount, sessionId })

export const saveQuizResult = (payload) =>
  api.post('/quiz/result', payload)

export const getQuizHistory = sessionId =>
  api.get(`/quiz/history/${sessionId}`)

// ── Health ───────────────────────────────────────────────────────────────────
export const checkHealth = () => api.get('/health')
