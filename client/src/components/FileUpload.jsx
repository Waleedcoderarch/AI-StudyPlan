import React, { useRef, useState } from 'react'
import { Spinner } from './LoadingSpinner'

export default function FileUpload({ onUpload, uploading, uploadProgress }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [error, setError] = useState('')

  const validateFile = (f) => {
    if (!f) return 'No file selected.'
    if (f.type !== 'application/pdf') return 'Only PDF files are supported.'
    if (f.size > 10 * 1024 * 1024) return 'File must be under 10 MB.'
    return null
  }

  const handleFile = (f) => {
    const err = validateFile(f)
    if (err) { setError(err); setFile(null); return }
    setError('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleChange = (e) => {
    const f = e.target.files[0]
    handleFile(f)
  }

  const handleUpload = () => {
    if (!file || uploading) return
    onUpload(file)
  }

  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200 ${
          dragging ? 'scale-[1.01]' : ''
        }`}
        style={{
          borderColor: dragging ? '#0ea5e9' : 'var(--border)',
          background: dragging
            ? 'rgba(14,165,233,0.06)'
            : 'var(--bg-tertiary)',
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleChange}
          disabled={uploading}
        />

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-transform duration-300 ${dragging ? 'scale-110' : ''}`}
          style={{ background: 'linear-gradient(135deg,rgba(14,165,233,0.15),rgba(139,92,246,0.15))' }}>
          📄
        </div>

        {file ? (
          <div className="text-center">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{file.name}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Drop your PDF here
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
              or click to browse — max 10 MB
            </p>
          </div>
        )}

        {dragging && (
          <div className="absolute inset-0 rounded-2xl border-2 border-sky-500 pointer-events-none" />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm bg-red-500/10 border border-red-500/20 text-red-500 animate-fade-in">
          <span>⚠</span> {error}
        </div>
      )}

      {/* Upload progress */}
      {uploading && uploadProgress > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
            <span>Uploading…</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-tertiary)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%`, background: 'linear-gradient(90deg,#0ea5e9,#8b5cf6)' }}
            />
          </div>
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="btn-primary w-full"
      >
        {uploading ? (
          <>
            <Spinner size="sm" color="#fff" />
            Processing PDF…
          </>
        ) : (
          <>
            <span>⬆</span>
            Upload & Extract Text
          </>
        )}
      </button>
    </div>
  )
}
