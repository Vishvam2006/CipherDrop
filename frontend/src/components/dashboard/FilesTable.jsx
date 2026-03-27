import { useState } from 'react'
import { FileText, FileImage, FileVideo, FileArchive, FileAudio, Trash2, Copy, Check, RefreshCw } from 'lucide-react'
import { formatBytes, formatDateTime, getExpiryMeta } from '../../utils/formatters.js'
import { StatusBadge } from '../ui/StatusBadge.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { Loader } from '../ui/Loader.jsx'

function getFileIcon(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase() || ''
  if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) return FileImage
  if (['mp4','mov','avi','mkv','webm'].includes(ext)) return FileVideo
  if (['mp3','wav','ogg','flac'].includes(ext)) return FileAudio
  if (['zip','rar','7z','tar','gz'].includes(ext)) return FileArchive
  return FileText
}

function FileCard({ file, now, recentLinks, onCopyLink, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const shareLinkEntry = recentLinks[file._id]
  const expiry = getExpiryMeta(file.expiresAt, now)
  const shareLinkActive = shareLinkEntry && !getExpiryMeta(shareLinkEntry.expiresAt, now).isExpired
  const Icon = getFileIcon(file.filename)

  async function handleCopy() {
    await onCopyLink(shareLinkEntry.shareLink)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  async function handleDelete() {
    setDeleting(true); await onDelete(file._id); setDeleting(false)
  }

  return (
    <div className="file-card group flex flex-col gap-3.5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
          <Icon size={16} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate" title={file.filename}>
            {file.filename}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatBytes(file.size)} · {formatDateTime(file.uploadDate)}
          </p>
        </div>
        <StatusBadge label={expiry.label} tone={expiry.tone} />
      </div>

      <div className="h-px bg-slate-100" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {shareLinkActive ? (
          <button onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100'
            }`}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center py-1.5 px-3 rounded-lg text-xs text-slate-400 bg-slate-50 border border-slate-200">
            No link
          </div>
        )}
        <button onClick={handleDelete} disabled={deleting}
          className="btn-danger py-1.5 px-3 text-xs" title="Delete">
          {deleting
            ? <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  )
}

export function FilesTable({ files, now, recentLinks, loading, refreshing, onRefresh, onCopyLink, onDelete }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">My Files</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''}` : 'No files yet'}
          </p>
        </div>
        <button onClick={onRefresh} disabled={loading || refreshing} className="btn-ghost py-1.5 px-3 text-xs gap-1.5">
          <RefreshCw size={12} className={loading || refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <Loader label="Loading files…" />
      ) : files.length === 0 ? (
        <EmptyState title="No uploads yet" description="Upload your first file and it will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {files.map((file) => (
            <FileCard key={file._id} file={file} now={now} recentLinks={recentLinks}
              onCopyLink={onCopyLink} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
