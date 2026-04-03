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
  function onDragOver(e)  { e.preventDefault(); setIsDrag(true) }
  function onDragLeave(e) { e.preventDefault(); setIsDrag(false) }
  function onDrop(e) { e.preventDefault(); setIsDrag(false); onFileSelect(e.dataTransfer.files?.[0] || null) }
  function onSubmit(e) {
    e.preventDefault()
    if (file) { onUpload(file); if (inputRef.current) inputRef.current.value = '' }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <input ref={inputRef} type="file" className="hidden" onChange={onFileChange} />

      {/* Drop zone */}
      <div
        className={`flex flex-col items-center justify-center gap-3 min-h-[180px] border-2 border-dashed rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
          isDrag
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
            : 'border-indigo-200 bg-indigo-50/30 hover:border-indigo-400 hover:bg-indigo-50'
        }`}
        onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
        onClick={browse} role="button" tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && browse()}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
          isDrag ? 'bg-indigo-500 scale-110' : 'bg-indigo-100'
        }`}>
          <UploadCloud size={22} className={isDrag ? 'text-white' : 'text-indigo-500'} />
        </div>
        {file ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">{file.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium text-gray-700">
              {isDrag ? 'Drop it here!' : 'Drag & drop or click to browse'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Any file type · Shared instantly</p>
          </div>
        )}
      </div>

      {/* File preview */}
      {file && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
            <FileText size={14} className="text-indigo-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onFileSelect(null) }}
            className="text-gray-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5">
        <button
          type="button" onClick={browse}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer"
        >
          Browse files
        </button>
        <button
          type="submit" disabled={uploading || !file}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 12px rgba(99,102,241,.3)' }}
        >
          {uploading ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Uploading…
            </>
          ) : (
            <><ArrowUp size={14} />Upload</>
          )}
        </button>
      </div>
    </form>
  )
}
