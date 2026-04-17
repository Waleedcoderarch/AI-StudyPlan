import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSession } from '../App'
import FileUpload from '../components/FileUpload'
import { Spinner } from '../components/LoadingSpinner'
import { uploadPDF, generateNotes } from '../services/api'

const STEPS = ['Upload PDF', 'Extract Text', 'Generate Notes']

function StepIndicator({ step }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                i < step ? 'text-white' : i === step ? 'text-white' : ''
              }`}
              style={{
                background: i < step
                  ? 'linear-gradient(135deg,#0ea5e9,#8b5cf6)'
                  : i === step
                    ? 'linear-gradient(135deg,#0ea5e9,#8b5cf6)'
                    : 'var(--bg-tertiary)',
                color: i <= step ? '#fff' : 'var(--text-muted)',
                boxShadow: i === step ? '0 0 0 4px rgba(14,165,233,0.2)' : 'none',
              }}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span className="text-xs whitespace-nowrap" style={{ color: i === step ? '#0ea5e9' : 'var(--text-muted)' }}>{s}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className="h-0.5 w-12 sm:w-20 mx-1 mb-4 rounded-full transition-all duration-500"
              style={{ background: i < step ? 'linear-gradient(90deg,#0ea5e9,#8b5cf6)' : 'var(--border)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

export default function NotesGenerator() {
  const { sessionId } = useSession()
  const [step, setStep] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [pdfData, setPdfData] = useState(null)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleUpload = async (file) => {
    setError('')
    setUploading(true)
    setProgress(0)

    try {
      const res = await uploadPDF(file, (e) => {
        if (e.total) setProgress(Math.round((e.loaded / e.total) * 90))
      })
      setProgress(100)
      setPdfData({ ...res, fileName: file.name })
      setStep(1)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleGenerateNotes = async () => {
    if (!pdfData?.extractedText) return
    setError('')
    setGenerating(true)

    try {
      const res = await generateNotes(
        pdfData.extractedText,
        pdfData.fileName,
        sessionId,
        pdfData.pages,
        pdfData.fileSize
      )
      setNotes(res.notes)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const handleDownload = () => {
    const clean = notes
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
    const blob = new Blob([`STUDY NOTES: ${pdfData?.fileName || 'Document'}\n${'='.repeat(60)}\n\n${clean}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `notes-${(pdfData?.fileName || 'document').replace(/\.pdf$/i, '')}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleReset = () => {
    setStep(0); setPdfData(null); setNotes(''); setError(''); setProgress(0)
  }

  return (
    <div className="page-enter mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-base">📄</div>
            <h1 className="section-title">Notes Generator</h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Upload a PDF and get AI-powered structured study notes</p>
        </div>
        {step > 0 && (
          <button onClick={handleReset} className="btn-secondary text-xs py-2 px-3">↩ Start Over</button>
        )}
      </div>

      <StepIndicator step={step} />

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl mb-5 text-sm border animate-fade-in"
          style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.25)', color: '#ef4444' }}>
          <span>⚠</span> {error}
          <button onClick={() => setError('')} className="ml-auto text-xs underline opacity-70">dismiss</button>
        </div>
      )}

      {/* Step 0: Upload */}
      {step === 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <h2 className="font-semibold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            Upload your PDF
          </h2>
          <FileUpload onUpload={handleUpload} uploading={uploading} uploadProgress={progress} />
        </div>
      )}

      {/* Step 1: Text extracted, ready to generate */}
      {step === 1 && pdfData && (
        <div className="space-y-5 animate-fade-in">
          <div className="glass-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-700/20 flex items-center justify-center text-xl border" style={{ borderColor: 'var(--border)' }}>📄</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{pdfData.fileName}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {pdfData.pages} pages · {(pdfData.fileSize / 1024).toFixed(0)} KB · {pdfData.textLength?.toLocaleString()} characters extracted
                  </p>
                </div>
              </div>
              <span className="badge text-xs" style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>✓ Extracted</span>
            </div>
          </div>

          {/* Text preview */}
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Extracted Text Preview</h3>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>First 500 chars</span>
            </div>
            <div className="rounded-xl p-3 text-xs leading-relaxed overflow-hidden" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', maxHeight: 120 }}>
              {pdfData.extractedText?.substring(0, 500)}…
            </div>
          </div>

          <button onClick={handleGenerateNotes} disabled={generating} className="btn-primary w-full">
            {generating ? <><Spinner size="sm" color="#fff" /> Generating notes with AI…</> : '✨ Generate Study Notes'}
          </button>
        </div>
      )}

      {/* Step 2: Notes displayed */}
      {step === 2 && notes && (
        <div className="space-y-5 animate-fade-in">
          {/* Action bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Notes generated for <strong style={{ color: 'var(--text-primary)' }}>{pdfData?.fileName}</strong>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDownload} className="btn-secondary text-sm py-2 px-4">
                ⬇ Download .txt
              </button>
              <button onClick={handleGenerateNotes} disabled={generating} className="btn-secondary text-sm py-2 px-4">
                {generating ? <><Spinner size="sm" /> Regenerating…</> : '↻ Regenerate'}
              </button>
            </div>
          </div>

          {/* Notes card */}
          <div className="glass-card p-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <div className="prose-custom">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{notes}</ReactMarkdown>
            </div>
          </div>

          {/* Generate quiz CTA */}
          <div className="glass-card p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Want to test your knowledge?</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Generate a quiz from this document</p>
            </div>
            <a
              href={`/quiz?text=${encodeURIComponent(pdfData?.extractedText?.substring(0, 3000) || '')}`}
              className="btn-primary whitespace-nowrap text-sm py-2"
            >
              🎯 Take Quiz
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
