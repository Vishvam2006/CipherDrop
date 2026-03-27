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
      <div className="flex items-center gap-2">
        <Link2 size={13} className="text-indigo-500" />
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">Share Link</span>
      </div>

      {entry ? (
        <div className="flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{entry.filename}</p>
            <StatusBadge label={expiry.label} tone={expiry.tone} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Clock size={11} />
            <span>Uploaded {formatDateTime(entry.uploadDate)}</span>
          </div>

          <div className="link-box">
            <a href={entry.shareLink} target="_blank" rel="noreferrer"
              className="flex-1 text-xs text-indigo-600 font-mono truncate hover:text-indigo-800 transition-colors"
              title={entry.shareLink}>
              {entry.shareLink}
            </a>
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={handleCopy}
              className={`btn-primary flex-1 transition-all duration-200 ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              style={copied ? { background: '#059669', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' } : {}}>
              {copied
                ? <span className="flex items-center gap-1.5"><Check size={13} />Copied!</span>
                : <span className="flex items-center gap-1.5"><Copy size={13} />Copy Link</span>}
            </button>
            <button type="button" onClick={() => onOpenLink(entry.shareLink)}
              disabled={expiry.isExpired} className="btn-secondary px-3.5" title="Open">
              <ExternalLink size={14} />
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            {expiry.isExpired ? 'This link has expired.' : 'Copy before it expires — links cannot be recovered.'}
          </p>
        </div>
      ) : (
        <EmptyState title="No share link yet" description="Upload a file to get a secure link." />
      )}
    </div>
  )
}
