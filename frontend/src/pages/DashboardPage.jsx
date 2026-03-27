import { useCallback, useEffect, useState } from 'react'
import { UploadCloud, Files } from 'lucide-react'
import { UploadDropzone } from '../components/dashboard/UploadDropzone.jsx'
import { ShareLinkPanel } from '../components/dashboard/ShareLinkPanel.jsx'
import { FilesTable } from '../components/dashboard/FilesTable.jsx'
import { Navbar } from '../components/ui/Navbar.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { deleteOwnedFile, fetchMyFiles, uploadOwnedFile } from '../services/api/files.js'
import { getTotalStorage, sortFilesByUploadDate } from '../utils/formatters.js'
import { getStoredRecentLinks, persistRecentLinks, removeStoredRecentLink } from '../utils/storage.js'

function filterLinksForFiles(links, files) {
  const validFileIds = new Set(files.map((f) => f._id))
  return Object.fromEntries(Object.entries(links).filter(([id]) => validFileIds.has(id)))
}

export function DashboardPage() {
  const { logout, token } = useAuth()
  const { showToast } = useToast()
  const [activePage, setActivePage] = useState('upload')
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [recentLinks, setRecentLinks] = useState(() => getStoredRecentLinks())
  const [loadingFiles, setLoadingFiles] = useState(true)
  const [refreshingFiles, setRefreshingFiles] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  const notifySessionEnd = useCallback((msg) => {
    logout(); showToast({ title: 'Session ended', message: msg, tone: 'error' })
  }, [logout, showToast])

  const notifyError = useCallback((title, msg) => {
    showToast({ title, message: msg, tone: 'error' })
  }, [showToast])

  const loadFiles = useCallback(async ({ background = false } = {}) => {
    background ? setRefreshingFiles(true) : setLoadingFiles(true)
    try {
      const res = await fetchMyFiles(token)
      const next = sortFilesByUploadDate(Array.isArray(res?.files) ? res.files : [])
      setFiles(next)
      setRecentLinks((cur) => {
        const filtered = filterLinksForFiles(cur, next)
        persistRecentLinks(filtered); return filtered
      })
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Unable to load files', err.message || 'Please try again.')
    } finally {
      setLoadingFiles(false); setRefreshingFiles(false)
    }
  }, [notifyError, notifySessionEnd, token])

  useEffect(() => { loadFiles() }, [loadFiles])

  async function handleUpload(file) {
    setUploading(true)
    try {
      const res = await uploadOwnedFile(token, file)
      const rec = res?.file
      if (rec?._id && res?.shareLink) {
        setRecentLinks((cur) => {
          const next = { ...cur, [rec._id]: { fileId: rec._id, filename: rec.filename, shareLink: res.shareLink, expiresAt: rec.expiresAt, uploadDate: rec.uploadDate, createdAt: Date.now() } }
          persistRecentLinks(next); return next
        })
      }
      setSelectedFile(null)
      showToast({ title: 'Upload complete', message: 'Your file is ready to share.', tone: 'success' })
      await loadFiles({ background: true })
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Upload failed', err.message || 'Please try another file.')
    } finally {
      setUploading(false) }
  }

  async function handleDelete(fileId) {
    if (!window.confirm('Delete this file?')) return
    try {
      const res = await deleteOwnedFile(token, fileId)
      setFiles((c) => c.filter((f) => f._id !== fileId))
      setRecentLinks(() => removeStoredRecentLink(fileId))
      showToast({ title: 'Deleted', message: res?.message || 'File removed.', tone: 'success' })
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Delete failed', err.message || 'Please try again.')
    }
  }

  async function handleCopyLink(link) {
    try {
      await navigator.clipboard.writeText(link)
      showToast({ title: 'Copied!', message: 'Link is on your clipboard.', tone: 'success' })
    } catch {
      showToast({ title: 'Copy failed', message: link, tone: 'error' })
    }
  }

  function handleOpenLink(link) { window.open(link, '_blank', 'noopener,noreferrer') }
  function handleLogout() { logout(); showToast({ title: 'Signed out', message: 'See you next time.', tone: 'success' }) }

  const recentLinkEntries = Object.values(recentLinks).sort((a, b) => b.createdAt - a.createdAt)
  const latestShareEntry = recentLinkEntries[0] || null
  const totalStorage = getTotalStorage(files)

  return (
    <div className="bg-page min-h-screen">
      <Navbar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* Upload page */}
        {activePage === 'upload' && (
          <div className="page-enter">
            {/* Hero */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
                <UploadCloud size={12} className="text-indigo-500" />
                <span className="text-xs font-semibold text-indigo-600">File Sharing</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Share files <span className="gradient-text">instantly.</span>
              </h1>
              <p className="text-slate-500 mt-2 text-sm">Upload and generate a secure link in seconds.</p>
            </div>

            {/* Two-column */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
              {/* Upload card */}
              <div className="surface-card p-6">
                <p className="text-sm font-semibold text-slate-800 mb-1">Upload a file</p>
                <p className="text-xs text-slate-400 mb-5">Drop any file to generate a shareable link.</p>
                <UploadDropzone
                  file={selectedFile} uploading={uploading}
                  onFileSelect={setSelectedFile} onUpload={handleUpload}
                />
              </div>

              {/* Share link card */}
              <div className="surface-card p-6">
                <ShareLinkPanel
                  entry={latestShareEntry} now={now}
                  onCopyLink={handleCopyLink} onOpenLink={handleOpenLink}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3.5 mt-5">
              {[
                ['Files uploaded', files.length],
                ['Storage used', totalStorage > 0 ? (totalStorage >= 1048576 ? `${(totalStorage/1048576).toFixed(1)} MB` : `${(totalStorage/1024).toFixed(0)} KB`) : '0 B'],
                ['Link lifetime', '60s'],
              ].map(([label, val]) => (
                <div key={label} className="surface-card p-4">
                  <p className="text-xs text-slate-400 font-medium mb-1">{label}</p>
                  <p className="text-xl font-bold text-slate-900">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files page */}
        {activePage === 'files' && (
          <div className="page-enter">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-4">
              <Files size={12} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600">My Files</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">Your uploads</h1>
            <p className="text-slate-500 text-sm mb-6">Manage and share all your files.</p>
            <div className="surface-card p-6">
              <FilesTable
                files={files} now={now} recentLinks={recentLinks}
                loading={loadingFiles} refreshing={refreshingFiles}
                onRefresh={() => loadFiles({ background: true })}
                onCopyLink={handleCopyLink} onDelete={handleDelete}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
