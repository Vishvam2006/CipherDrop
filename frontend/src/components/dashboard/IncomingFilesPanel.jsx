import { ArrowDownToLine, Copy, Download, Inbox } from 'lucide-react'
import { formatDateTime } from '../../utils/formatters.js'
import { EmptyState } from '../ui/EmptyState.jsx'

export function IncomingFilesPanel({ transfers, onCopyLink, onDownload }) {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <Inbox size={12} className="text-indigo-500" />
        </div>
        <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">Incoming Files</span>
        {transfers.length > 0 && (
          <span className="ml-auto bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {transfers.length} new
          </span>
        )}
      </div>

      {transfers.length === 0 ? (
        <EmptyState title="No incoming files" description="When a friend sends you a file, it will appear here instantly." />
      ) : (
        <div className="flex flex-col gap-3">
          {transfers.map((t) => (
            <div key={t.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200 hover:border-indigo-200 transition-all duration-200">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{t.filename}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    From <span className="font-medium text-gray-600">{t.fromEmail}</span>
                    {' · '}{formatDateTime(t.createdAt)}
                  </p>
                </div>
                <span className="flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
                  <ArrowDownToLine size={10} />Ready
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button" onClick={() => onDownload(t)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white rounded-lg hover:opacity-90 transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                >
                  <Download size={12} />Download
                </button>
                <button
                  type="button" onClick={() => onCopyLink(t.link)}
                  className="flex items-center justify-center px-3 bg-white border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-100 transition-all cursor-pointer"
                  title="Copy link"
                >
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
