import { ArrowDownToLine, Copy, Download, Inbox } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters.js'
import { EmptyState } from '../ui/EmptyState.jsx'

export function IncomingFilesPanel({ transfers, onCopyLink, onDownload }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] flex items-center justify-center">
          <Inbox size={12} className="text-[var(--accent)]" />
        </div>
        <span className="text-xs font-semibold tracking-wider uppercase text-[var(--text-muted)]">
          Incoming Files
        </span>
        {transfers.length > 0 && (
          <span className="ml-auto badge badge-live">
            {transfers.length} new
          </span>
        )}
      </div>

      {transfers.length === 0 ? (
        <EmptyState
          title="No incoming files"
          description="When a friend sends you a file, it will appear here instantly."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {transfers.map((t) => (
            <div key={t.id}
              className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)] hover:border-[var(--border-accent)] transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                    {t.filename}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    From <span className="font-medium text-[var(--text-secondary)]">{t.fromEmail}</span>
                    {' · '}{formatDateTime(t.createdAt)}
                  </p>
                </div>
                <span className="badge badge-live shrink-0">
                  <ArrowDownToLine size={10} />
                  Ready
                </span>
              </div>

              <div className="flex gap-2">
                <button type="button" onClick={() => onDownload(t)}
                  className="btn btn-primary flex-1 py-2 text-xs">
                  <Download size={12} />
                  Download
                </button>
                <button type="button" onClick={() => onCopyLink(t.link)}
                  className="btn btn-secondary px-3" title="Copy link">
                  <Copy size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
