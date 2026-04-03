import { useState } from 'react'
import {
  FileText, FileImage, FileVideo, FileArchive, FileAudio,
  Trash2, Copy, Check, RefreshCw
} from 'lucide-react'
import { formatBytes, formatDateTime, getExpiryMeta } from '../../utils/formatters.js'
import { StatusBadge } from '../ui/StatusBadge.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'
import { Loader } from '../ui/Loader.jsx'

function getFileIcon(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase() || ''
  if (['jpg','jpeg','png','gif','webp','svg','avif'].includes(ext)) return FileImage
  if (['mp4','mov','avi','mkv','webm'].includes(ext)) return FileVideo
  if (['mp3','wav','ogg','flac','aac'].includes(ext)) return FileAudio
  if (['zip','rar','7z','tar','gz','bz2'].includes(ext)) return FileArchive
  return FileText
}

function FileCard({ file, now, recentLinks, onCopyLink, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const Icon = getFileIcon(file.filename)
  const shareLinkEntry = recentLinks[file._id]
  const expiry = getExpiryMeta(file.expiresAt, now)
  const linkActive = shareLinkEntry && !getExpiryMeta(shareLinkEntry.expiresAt, now).isExpired

  async function handleCopy() {
    await onCopyLink(shareLinkEntry.shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDelete() {
    setDeleting(true)
    await onDelete(file._id)
    setDeleting(false)
  }

  return (
    <div className="file-card group flex flex-col gap-4">
      {/* Header row */}
      <div className="flex items-start gap-3">
        <div className="icon-wrap group-hover:bg-[var(--accent-light)] transition-colors">
          <Icon size={16} className="text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate" title={file.filename}>
            {file.filename}
          </p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {formatBytes(file.size)} · {formatDateTime(file.uploadDate)}
          </p>
        </div>
        <StatusBadge label={expiry.label} tone={expiry.tone} />
      </div>

      <div className="divider" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {linkActive ? (
          <button
            onClick={handleCopy}
            className={`btn flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
              copied
                ? 'bg-[var(--green-bg)] text-[var(--green)] border-[var(--green-border)]'
                : 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent-mid)] hover:bg-[var(--accent)] hover:text-white hover:border-transparent'
            }`}
          >
            {copied ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy Link</>}
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] border border-[var(--border)]">
            No link
          </div>
        )}
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="btn btn-danger py-2 px-3 text-xs"
          title="Delete file"
        >
          {deleting
            ? <span className="w-3 h-3 border-2 border-[var(--red-border)] border-t-[var(--red)] rounded-full animate-spin" />
            : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  )
}

export function FilesTable({ files, now, recentLinks, loading, refreshing, onRefresh, onCopyLink, onDelete }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Table header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">My Files</h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {files.length > 0
              ? `${files.length} file${files.length !== 1 ? 's' : ''} uploaded`
              : 'No files yet'}
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading || refreshing}
          className="btn btn-ghost gap-1.5 text-xs"
        >
          <RefreshCw size={12} className={loading || refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <Loader label="Loading files…" />
      ) : files.length === 0 ? (
        <EmptyState
          title="No uploads yet"
          description="Upload your first file and it will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {files.map((file) => (
            <FileCard
              key={file._id}
              file={file}
              now={now}
              recentLinks={recentLinks}
              onCopyLink={onCopyLink}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
