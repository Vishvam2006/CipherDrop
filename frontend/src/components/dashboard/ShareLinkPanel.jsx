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
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
          <Link2 size={12} className="text-[var(--accent)]" />
        </div>
        <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)]">
          Share Link
        </span>
      </div>

      {entry ? (
        <div className="flex flex-col gap-4">
          {/* Filename + status */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate max-w-[200px]">
              {entry.filename}
            </p>
            <StatusBadge label={expiry.label} tone={expiry.tone} />
          </div>

          {/* Timestamp */}
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Clock size={11} />
            <span>Uploaded {formatDateTime(entry.uploadDate)}</span>
          </div>

          {/* Link display */}
          <div className="link-box">
            <a
              href={entry.shareLink} target="_blank" rel="noreferrer"
              className="flex-1 text-xs text-[var(--accent)] font-mono truncate hover:underline"
              title={entry.shareLink}
            >
              {entry.shareLink}
            </a>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className={`btn flex-1 py-2.5 text-sm rounded-xl font-semibold transition-all ${
                copied
                  ? 'bg-[var(--green)] text-white border border-transparent shadow-md'
                  : 'btn-primary'
              }`}
            >
              {copied
                ? <><Check size={14} />Copied!</>
                : <><Copy size={14} />Copy Link</>}
            </button>
            <button
              type="button"
              onClick={() => onOpenLink(entry.shareLink)}
              disabled={expiry.isExpired}
              className="btn btn-secondary px-4"
              title="Open link"
            >
              <ExternalLink size={14} />
            </button>
          </div>

          <p className="text-[11px] text-[var(--text-muted)] text-center leading-relaxed">
            {expiry.isExpired
              ? 'This link has expired and the file has been deleted.'
              : 'Copy this link before it expires — cannot be recovered after.'}
          </p>
        </div>
      ) : (
        <EmptyState
          title="No share link yet"
          description="Upload a file to generate a secure one-time link."
        />
      )}
    </div>
  )
}
