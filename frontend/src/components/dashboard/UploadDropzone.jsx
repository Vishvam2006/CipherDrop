import { useRef, useState } from 'react'
import { UploadCloud, FileText, X, ArrowUp } from 'lucide-react'
import { formatBytes } from '../../utils/formatters.js'

export function UploadDropzone({ file, uploading, onFileSelect, onUpload }) {
  const inputRef = useRef(null)
  const [isDrag, setIsDrag] = useState(false)

  function browse() {
    if (inputRef.current) { inputRef.current.value = ''; inputRef.current.click() }
  }
  function onFileChange(e) { onFileSelect(e.target.files?.[0] || null) }
  function onDragOver(e) { e.preventDefault(); setIsDrag(true) }
  function onDragLeave(e) { e.preventDefault(); setIsDrag(false) }
  function onDrop(e) { e.preventDefault(); setIsDrag(false); onFileSelect(e.dataTransfer.files?.[0] || null) }
  function onSubmit(e) {
    e.preventDefault()
    if (file) { onUpload(file); if (inputRef.current) inputRef.current.value = '' }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} />

      {/* Drop area */}
      <div
        className={`dropzone-area flex flex-col items-center justify-center gap-3 min-h-[180px] ${isDrag ? 'drag-active' : ''}`}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={browse} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && browse()}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
          isDrag ? 'bg-[var(--accent)] scale-110' : 'bg-[var(--accent-light)]'
        }`}>
          <UploadCloud size={22} className={isDrag ? 'text-white' : 'text-[var(--accent)]'} />
        </div>

        {file ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {isDrag ? 'Drop it here!' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Any file type · Shared instantly</p>
          </div>
        )}
      </div>

      {/* Selected file preview */}
      {file && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-mid)] flex items-center justify-center shrink-0">
            <FileText size={14} className="text-[var(--accent)]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{file.name}</p>
            <p className="text-xs text-[var(--text-muted)]">{formatBytes(file.size)}</p>
          </div>
          <button type="button"
            onClick={(e) => { e.preventDefault(); onFileSelect(null) }}
            className="btn text-[var(--text-muted)] hover:text-[var(--red)] p-1 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5">
        <button type="button" onClick={browse} className="btn btn-secondary flex-1">
          Browse files
        </button>
        <button type="submit" disabled={uploading || !file} className="btn btn-primary flex-1">
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <ArrowUp size={14} />
              Upload
            </>
          )}
        </button>
      </div>
    </form>
  )
}
