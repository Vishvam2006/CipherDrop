import { useState } from 'react'
import { FileText, FileImage, FileVideo, FileArchive, FileAudio, Trash2, Copy, Check, RefreshCw } from 'lucide-react'
import { formatBytes, formatDateTime, getExpiryMeta } from '../../utils/formatters.js'
import { StatusBadge } from '../ui/StatusBadge.jsx'
import { EmptyState }  from '../ui/EmptyState.jsx'
import { Loader }      from '../ui/Loader.jsx'

function getFileIcon(filename) {
  const ext = filename?.split('.').pop()?.toLowerCase() || ''
  if (['jpg','jpeg','png','gif','webp','svg','avif'].includes(ext)) return FileImage
  if (['mp4','mov','avi','mkv','webm'].includes(ext))              return FileVideo
  if (['mp3','wav','ogg','flac','aac'].includes(ext))              return FileAudio
  if (['zip','rar','7z','tar','gz','bz2'].includes(ext))           return FileArchive
  return FileText
}

function FileCard({ file, now, recentLinks, onCopyLink, onDelete }) {
  const [copied,   setCopied]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const Icon          = getFileIcon(file.filename)
  const shareLinkEntry = recentLinks[file._id]
  const expiry         = getExpiryMeta(file.expiresAt, now)
  const linkActive     = shareLinkEntry && !getExpiryMeta(shareLinkEntry.expiresAt, now).isExpired

  async function handleCopy() {
    await onCopyLink(shareLinkEntry.shareLink)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }
  async function handleDelete() {
    setDeleting(true); await onDelete(file._id); setDeleting(false)
  }

  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-4 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 group-hover:bg-indigo-100 transition-colors">
          <Icon size={16} className="text-indigo-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate" title={file.filename}>{file.filename}</p>
          <p className="text-xs text-gray-400 mt-0.5">{formatBytes(file.size)} · {formatDateTime(file.uploadDate)}</p>
        </div>
        <StatusBadge label={expiry.label} tone={expiry.tone} />
      </div>

      <div className="h-px bg-gray-100" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {linkActive ? (
          <button
            onClick={handleCopy}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
              copied
                ? 'bg-green-50 text-green-700 border-green-200'
                : 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-500 hover:text-white hover:border-transparent'
            }`}
          >
            {copied ? <><Check size={11} />Copied</> : <><Copy size={11} />Copy Link</>}
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-xs text-gray-400 bg-gray-50 border border-gray-200">
            No link
          </div>
        )}
        <button
          onClick={handleDelete} disabled={deleting}
          className="flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 disabled:opacity-50 transition-all duration-200 cursor-pointer"
          title="Delete"
        >
          {deleting
            ? <span className="w-3 h-3 border-2 border-red-200 border-t-red-500 rounded-full animate-spin" />
            : <Trash2 size={12} />}
        </button>
      </div>
    </div>
  )
}

export function FilesTable({ files, now, recentLinks, loading, refreshing, onRefresh, onCopyLink, onDelete }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">My Files</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {files.length > 0 ? `${files.length} file${files.length !== 1 ? 's' : ''} uploaded` : 'No files yet'}
          </p>
        </div>
        <button
          onClick={onRefresh} disabled={loading || refreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-all cursor-pointer"
        >
          <RefreshCw size={12} className={loading || refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {loading ? (
        <Loader label="Loading files…" />
      ) : files.length === 0 ? (
        <EmptyState title="No uploads yet" description="Upload your first file and it will appear here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {files.map((file) => (
            <FileCard key={file._id} file={file} now={now} recentLinks={recentLinks}
              onCopyLink={onCopyLink} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
