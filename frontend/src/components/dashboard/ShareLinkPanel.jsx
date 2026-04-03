import { useState } from 'react'
import { Copy, ExternalLink, Check, Link2, Clock } from 'lucide-react'
import { formatDateTime, getExpiryMeta } from '../../utils/formatters.js'
import { StatusBadge } from '../ui/StatusBadge.jsx'
import { EmptyState } from '../ui/EmptyState.jsx'

export function ShareLinkPanel({ entry, now, onCopyLink, onOpenLink }) {
  const expiry = entry ? getExpiryMeta(entry.expiresAt, now) : null
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await onCopyLink(entry.shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <Link2 size={12} className="text-indigo-500" />
        </div>
        <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">Share Link</span>
      </div>

      {entry ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800 truncate max-w-[200px]">{entry.filename}</p>
            <StatusBadge label={expiry.label} tone={expiry.tone} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock size={11} />
            <span>Uploaded {formatDateTime(entry.uploadDate)}</span>
          </div>

          {/* Link box */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 overflow-hidden">
            <a
              href={entry.shareLink} target="_blank" rel="noreferrer"
              className="flex-1 text-xs text-indigo-600 font-mono truncate hover:underline"
              title={entry.shareLink}
            >
              {entry.shareLink}
            </a>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button" onClick={handleCopy}
              className={`flex flex-1 items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                copied
                  ? 'bg-green-500 text-white'
                  : 'text-white hover:opacity-90'
              }`}
              style={!copied ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 2px 12px rgba(99,102,241,.3)' } : {}}
            >
              {copied ? <><Check size={14} />Copied!</> : <><Copy size={14} />Copy Link</>}
            </button>
            <button
              type="button" onClick={() => onOpenLink(entry.shareLink)}
              disabled={expiry.isExpired}
              className="flex items-center justify-center px-3.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Open link"
            >
              <ExternalLink size={14} />
            </button>
          </div>

          <p className="text-[11px] text-gray-400 text-center leading-relaxed">
            {expiry.isExpired
              ? 'This link has expired and the file has been deleted.'
              : 'Copy before it expires — the link cannot be recovered.'}
          </p>
        </div>
      ) : (
        <EmptyState title="No share link yet" description="Upload a file to generate a secure one-time link." />
      )}
    </div>
  )
}
