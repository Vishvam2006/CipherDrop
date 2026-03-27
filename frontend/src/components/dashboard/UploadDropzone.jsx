import { useRef, useState } from 'react'
import { UploadCloud, FileText, X, ArrowUp } from 'lucide-react'
import { formatBytes } from '../../utils/formatters.js'

export function UploadDropzone({ file, uploading, onFileSelect, onUpload }) {
  const inputRef = useRef(null)
  const [isDragActive, setIsDragActive] = useState(false)

  function handleBrowseClick() {
    if (inputRef.current) { inputRef.current.value = ''; inputRef.current.click() }
  }
  function handleFileChange(e) { onFileSelect(e.target.files?.[0] || null) }
  function handleDragOver(e) { e.preventDefault(); setIsDragActive(true) }
  function handleDragLeave(e) { e.preventDefault(); setIsDragActive(false) }
  function handleDrop(e) {
    e.preventDefault(); setIsDragActive(false)
    onFileSelect(e.dataTransfer.files?.[0] || null)
  }
  function handleSubmit(e) {
    e.preventDefault()
    if (file) { onUpload(file); if (inputRef.current) inputRef.current.value = '' }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />

      {/* Drop zone */}
      <div
        className={`dropzone-area flex flex-col items-center justify-center gap-3 min-h-[180px] cursor-pointer ${isDragActive ? 'drag-active' : ''}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
        onClick={handleBrowseClick} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleBrowseClick()}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${isDragActive ? 'bg-indigo-100 scale-110' : 'bg-indigo-50'}`}>
          <UploadCloud size={22} className="text-indigo-500" />
        </div>
        {file ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-800">{file.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-slate-700">
              {isDragActive ? 'Drop it here!' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Any file type accepted</p>
          </div>
        )}
      </div>

      {/* Preview row */}
      {file && (
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
            <FileText size={14} className="text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
            <p className="text-xs text-slate-400">{formatBytes(file.size)}</p>
          </div>
          <button type="button" onClick={(e) => { e.preventDefault(); onFileSelect(null) }}
            className="text-slate-400 hover:text-red-500 transition-colors p-1">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2.5">
        <button type="button" onClick={handleBrowseClick} className="btn-secondary flex-1">
          Browse
        </button>
        <button type="submit" disabled={uploading || !file} className="btn-primary flex-1">
          {uploading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Uploading…
            </span>
          ) : (
            <span className="flex items-center gap-2"><ArrowUp size={14} />Upload</span>
          )}
        </button>
      </div>
    </form>
  )
}
