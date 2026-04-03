import { useCallback, useEffect, useRef, useState } from 'react'
import { UploadCloud, Files, Users, HardDrive, Zap, Activity } from 'lucide-react'

import { FriendsPanel }      from '../components/dashboard/FriendsPanel.jsx'
import { IncomingFilesPanel } from '../components/dashboard/IncomingFilesPanel.jsx'
import { UploadDropzone }     from '../components/dashboard/UploadDropzone.jsx'
import { ShareLinkPanel }     from '../components/dashboard/ShareLinkPanel.jsx'
import { FilesTable }         from '../components/dashboard/FilesTable.jsx'
import { Navbar }             from '../components/ui/Navbar.jsx'

import { useAuth }  from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'

import { deleteOwnedFile, downloadSharedFile, fetchMyFiles, uploadOwnedFile } from '../services/api/files.js'
import { acceptFriendRequest, fetchActiveFriends, fetchFriendRequests, fetchFriends, sendFriendRequest } from '../services/api/friends.js'
import { createAppSocket }    from '../services/socket.js'
import { getUserIdFromToken }  from '../utils/auth.js'
import { getTotalStorage, sortFilesByUploadDate } from '../utils/formatters.js'
import { getStoredRecentLinks, persistRecentLinks, removeStoredRecentLink } from '../utils/storage.js'

/* ── Helpers ─────────────────────────────── */
function filterLinksForFiles(links, files) {
  const ids = new Set(files.map((f) => f._id))
  return Object.fromEntries(Object.entries(links).filter(([id]) => ids.has(id)))
}

function sortByEmail(users) {
  return [...(Array.isArray(users) ? users : [])].sort(
    (a, b) => (a?.email || '').localeCompare(b?.email || '')
  )
}

function sortRequestsByEmail(reqs) {
  return [...(Array.isArray(reqs) ? reqs : [])].sort(
    (a, b) => (a?.requestor?.email || '').localeCompare(b?.requestor?.email || '')
  )
}

function fmtStorage(bytes) {
  if (bytes <= 0)       return '0 B'
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
  if (bytes >= 1024)    return `${Math.round(bytes / 1024)} KB`
  return `${bytes} B`
}

function createPendingEntry(file, shareLink) {
  return {
    fileId:     `pending-${Date.now()}`,
    filename:   file.name,
    shareLink,
    expiresAt:  new Date(Date.now() + 60_000).toISOString(),
    uploadDate: new Date().toISOString(),
  }
}

function findFileMatch(files, browserFile, receiverId) {
  return files.find(
    (f) =>
      f.filename === browserFile.name &&
      Number(f.size) === Number(browserFile.size) &&
      (!receiverId || f.receiver === receiverId)
  )
}

/* ── Stat Card ───────────────────────────── */
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="icon-wrap" style={accent
        ? { background: accent.bg, borderColor: accent.border, color: accent.text }
        : {}}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-[var(--text-muted)] font-medium">{label}</p>
        <p className="text-xl font-bold text-[var(--text-primary)] mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ── Page Section Header ─────────────────── */
function PageHeader({ tag, tagIcon: TagIcon, title, subtitle }) {
  return (
    <div className="mb-7">
      <div className="tag w-fit mb-3">
        {TagIcon && <TagIcon size={11} />}
        {tag}
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--text-primary)] leading-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[var(--text-muted)] mt-2 text-sm leading-relaxed max-w-lg">{subtitle}</p>
      )}
    </div>
  )
}

/* ── Main Dashboard ──────────────────────── */
export function DashboardPage() {
  const { logout, token }    = useAuth()
  const { showToast }        = useToast()
  const userId               = getUserIdFromToken(token)
  const friendLookupRef      = useRef({})

  const [activePage,         setActivePage]         = useState('upload')
  const [files,              setFiles]              = useState([])
  const [selectedFile,       setSelectedFile]       = useState(null)
  const [selectedFriendId,   setSelectedFriendId]   = useState('')
  const [friends,            setFriends]            = useState([])
  const [pendingRequests,    setPendingRequests]    = useState([])
  const [activeFriendIds,    setActiveFriendIds]    = useState([])
  const [incomingTransfers,  setIncomingTransfers]  = useState([])
  const [friendEmail,        setFriendEmail]        = useState('')
  const [latestShareEntry,   setLatestShareEntry]   = useState(null)
  const [recentLinks,        setRecentLinks]        = useState(() => getStoredRecentLinks())
  const [loadingFiles,       setLoadingFiles]       = useState(true)
  const [refreshingFiles,    setRefreshingFiles]    = useState(false)
  const [loadingFriends,     setLoadingFriends]     = useState(true)
  const [refreshingFriends,  setRefreshingFriends]  = useState(false)
  const [uploading,          setUploading]          = useState(false)
  const [sendingRequest,     setSendingRequest]     = useState(false)
  const [acceptingReqIds,    setAcceptingReqIds]    = useState([])
  const [now,                setNow]                = useState(Date.now())

  /* Tick timer for expiry countdown */
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  /* Keep friend lookup map in sync */
  useEffect(() => {
    friendLookupRef.current = Object.fromEntries(friends.map((f) => [f._id, f]))
  }, [friends])

  /* Notifications */
  const notifySessionEnd = useCallback((msg) => {
    logout()
    showToast({ title: 'Session ended', message: msg, tone: 'error' })
  }, [logout, showToast])

  const notifyError = useCallback((title, msg) => {
    showToast({ title, message: msg, tone: 'error' })
  }, [showToast])

  /* Load files */
  const loadFiles = useCallback(async ({ background = false } = {}) => {
    background ? setRefreshingFiles(true) : setLoadingFiles(true)
    try {
      const res  = await fetchMyFiles(token)
      const next = sortFilesByUploadDate(Array.isArray(res?.files) ? res.files : [])
      setFiles(next)
      setRecentLinks((cur) => {
        const filtered = filterLinksForFiles(cur, next)
        persistRecentLinks(filtered)
        return filtered
      })
      return next
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Unable to load files', err.message || 'Please try again.')
      return []
    } finally {
      setLoadingFiles(false)
      setRefreshingFiles(false)
    }
  }, [notifyError, notifySessionEnd, token])

  /* Load friends */
  const loadFriends = useCallback(async ({ background = false } = {}) => {
    background ? setRefreshingFriends(true) : setLoadingFriends(true)
    try {
      const [fr, rq, ac] = await Promise.all([
        fetchFriends(token),
        fetchFriendRequests(token),
        fetchActiveFriends(token),
      ])
      const nextFriends  = sortByEmail(fr?.friends)
      const nextRequests = sortRequestsByEmail(rq?.requests)
      const nextActive   = Array.isArray(ac?.activeFriends) ? ac.activeFriends : []
      setFriends(nextFriends)
      setPendingRequests(nextRequests)
      setActiveFriendIds(nextActive)
      return { friends: nextFriends, requests: nextRequests, activeFriendIds: nextActive }
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Unable to load friends', err.message || 'Please try again.')
      return null
    } finally {
      setLoadingFriends(false)
      setRefreshingFriends(false)
    }
  }, [notifyError, notifySessionEnd, token])

  useEffect(() => { loadFiles() },   [loadFiles])
  useEffect(() => { loadFriends() }, [loadFriends])

  /* Auto-select first friend */
  useEffect(() => {
    if (!selectedFriendId && friends.length > 0) setSelectedFriendId(friends[0]._id)
    if (selectedFriendId && !friends.some((f) => f._id === selectedFriendId))
      setSelectedFriendId(friends[0]?._id || '')
  }, [friends, selectedFriendId])

  /* Socket */
  useEffect(() => {
    if (!token || !userId) return
    const socket = createAppSocket()
    socket.on('connect', ()         => socket.emit('register', userId))
    socket.on('user-online',  (id) => {
      if (!friendLookupRef.current[id]) return
      setActiveFriendIds((c) => c.includes(id) ? c : [...c, id])
    })
    socket.on('user-offline', (id) =>
      setActiveFriendIds((c) => c.filter((x) => x !== id))
    )
    socket.on('file-incoming', (payload) => {
      const sender   = friendLookupRef.current[payload?.from]
      const transfer = {
        id:        `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        from:      payload?.from || '',
        fromEmail: sender?.email || 'A friend',
        filename:  payload?.filename || 'Shared file',
        link:      payload?.link || '',
        createdAt: new Date().toISOString(),
      }
      setIncomingTransfers((c) => [transfer, ...c].slice(0, 8))
      showToast({
        title:   'Incoming file',
        message: `${transfer.fromEmail} sent ${transfer.filename}.`,
        tone:    'success',
      })
    })
    return () => socket.disconnect()
  }, [showToast, token, userId])

  /* Handlers */
  async function handleUpload(file) {
    if (!selectedFriendId) {
      notifyError('Select a friend first', 'Choose an approved friend before uploading.')
      setActivePage('friends')
      return
    }
    setUploading(true)
    try {
      const res     = await uploadOwnedFile(token, file, selectedFriendId)
      const pending = createPendingEntry(file, res?.shareLink)
      setLatestShareEntry(pending)
      setSelectedFile(null)

      const friend = friends.find((f) => f._id === selectedFriendId)
      showToast({
        title:   'Upload complete',
        message: friend ? `${file.name} sent to ${friend.email}.` : 'File sent.',
        tone:    'success',
      })

      const nextFiles = await loadFiles({ background: true })
      const match     = findFileMatch(nextFiles, file, selectedFriendId)
      if (match && res?.shareLink) {
        const linked = {
          fileId:    match._id,
          filename:  match.filename,
          shareLink: res.shareLink,
          expiresAt: match.expiresAt || pending.expiresAt,
          uploadDate:match.uploadDate || pending.uploadDate,
          createdAt: Date.now(),
        }
        setRecentLinks((c) => {
          const next = { ...c, [match._id]: linked }
          persistRecentLinks(next)
          return next
        })
        setLatestShareEntry(linked)
      }
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Upload failed', err.message || 'Please try another file.')
    } finally {
      setUploading(false)
    }
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
      else notifyError('Delete failed', err.message || 'Try again.')
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

  async function handleDownloadIncoming(transfer) {
    try {
      await downloadSharedFile(token, transfer.link, transfer.filename)
      showToast({ title: 'Download started', message: `${transfer.filename} downloading.`, tone: 'success' })
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Download failed', err.message || 'Try again.')
    }
  }

  async function handleSendFriendRequest(e) {
    e.preventDefault()
    const email = friendEmail.trim().toLowerCase()
    if (!email) { notifyError('Email required', "Enter a friend's email."); return }
    setSendingRequest(true)
    try {
      const res = await sendFriendRequest(token, email)
      setFriendEmail('')
      showToast({ title: 'Request sent', message: res?.message || `Sent to ${email}.`, tone: 'success' })
      await loadFriends({ background: true })
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Could not send request', err.message || 'Try again.')
    } finally {
      setSendingRequest(false)
    }
  }

  async function handleAcceptRequest(requestId) {
    setAcceptingReqIds((c) => [...c, requestId])
    try {
      const res = await acceptFriendRequest(token, requestId)
      showToast({ title: 'Friend accepted', message: res?.message || 'You can now exchange files.', tone: 'success' })
      await loadFriends({ background: true })
    } catch (err) {
      if (err.status === 401 || err.status === 404) notifySessionEnd('Please log in again.')
      else notifyError('Could not accept', err.message || 'Try again.')
    } finally {
      setAcceptingReqIds((c) => c.filter((id) => id !== requestId))
    }
  }

  function handleOpenLink(link) { window.open(link, '_blank', 'noopener,noreferrer') }
  function handleLogout() { logout(); showToast({ title: 'Signed out', message: 'See you next time.', tone: 'success' }) }

  /* Derived */
  const recentLinkEntries = Object.values(recentLinks).sort((a, b) => b.createdAt - a.createdAt)
  const displayEntry      = latestShareEntry || recentLinkEntries[0] || null
  const totalStorage      = getTotalStorage(files)
  const selectedFriend    = friends.find((f) => f._id === selectedFriendId) || null
  const activeFriendSet   = new Set(activeFriendIds)

  /* ── Render ─────────────────────────────── */
  return (
    <div className="bg-page min-h-screen">
      <Navbar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-5 py-8">

        {/* ─ Upload page ─ */}
        {activePage === 'upload' && (
          <div className="page-enter">
            <PageHeader
              tag="File Sharing"
              tagIcon={UploadCloud}
              title={<>Share files <span className="gradient-text">instantly.</span></>}
              subtitle="Upload any file and route a secure one-time link to one of your approved friends."
            />

            {/* Main 2-col grid */}
            <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">

              {/* Upload card */}
              <div className="card p-6 flex flex-col gap-5">
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">Upload a file</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Drop any file below, choose a recipient, then send.
                  </p>
                </div>

                {/* Recipient selector */}
                <div className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border)]">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">Recipient</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">Who receives this file</p>
                    </div>
                    {selectedFriend && (
                      <span className={activeFriendSet.has(selectedFriend._id) ? 'badge badge-live' : 'badge badge-neutral'}>
                        {activeFriendSet.has(selectedFriend._id) ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedFriendId}
                    onChange={(e) => setSelectedFriendId(e.target.value)}
                    className="premium-input"
                  >
                    <option value="">
                      {friends.length > 0 ? 'Select a friend…' : 'No approved friends yet'}
                    </option>
                    {friends.map((f) => (
                      <option key={f._id} value={f._id}>{f.email}</option>
                    ))}
                  </select>

                  {friends.length === 0 && (
                    <button
                      type="button"
                      onClick={() => setActivePage('friends')}
                      className="btn btn-secondary mt-3 text-sm self-start"
                    >
                      Add a friend first →
                    </button>
                  )}

                  {selectedFriend && (
                    <p className="text-xs text-[var(--text-muted)] mt-2">
                      File will be routed to <strong className="text-[var(--text-secondary)]">{selectedFriend.email}</strong>
                    </p>
                  )}
                </div>

                <UploadDropzone
                  file={selectedFile}
                  uploading={uploading}
                  onFileSelect={setSelectedFile}
                  onUpload={handleUpload}
                />
              </div>

              {/* Right sidebar */}
              <div className="flex flex-col gap-5">
                <div className="card p-6">
                  <ShareLinkPanel
                    entry={displayEntry}
                    now={now}
                    onCopyLink={handleCopyLink}
                    onOpenLink={handleOpenLink}
                  />
                </div>
                <div className="card p-6">
                  <IncomingFilesPanel
                    transfers={incomingTransfers}
                    onCopyLink={handleCopyLink}
                    onDownload={handleDownloadIncoming}
                  />
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <StatCard
                icon={Files}
                label="Files uploaded"
                value={files.length}
              />
              <StatCard
                icon={HardDrive}
                label="Storage used"
                value={fmtStorage(totalStorage)}
                accent={{ bg: 'var(--accent-light)', border: 'var(--accent-mid)', text: 'var(--accent)' }}
              />
              <StatCard
                icon={Activity}
                label="Friends online"
                value={activeFriendIds.length}
                accent={{ bg: 'var(--green-bg)', border: 'var(--green-border)', text: 'var(--green)' }}
              />
            </div>
          </div>
        )}

        {/* ─ Files page ─ */}
        {activePage === 'files' && (
          <div className="page-enter">
            <PageHeader
              tag="My Files"
              tagIcon={Files}
              title={<>Your <span className="gradient-text">uploads.</span></>}
              subtitle="Manage and review every file you have sent. Delete files to free up space."
            />
            <div className="card p-6">
              <FilesTable
                files={files}
                now={now}
                recentLinks={recentLinks}
                loading={loadingFiles}
                refreshing={refreshingFiles}
                onRefresh={() => loadFiles({ background: true })}
                onCopyLink={handleCopyLink}
                onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {/* ─ Friends page ─ */}
        {activePage === 'friends' && (
          <div className="page-enter">
            <PageHeader
              tag="Friends"
              tagIcon={Users}
              title={<>Your <span className="gradient-text">network.</span></>}
              subtitle="Add friends by email, accept requests, and select who should receive your next upload."
            />
            <FriendsPanel
              friendEmail={friendEmail}
              loading={loadingFriends}
              refreshing={refreshingFriends}
              sendingRequest={sendingRequest}
              pendingRequests={pendingRequests}
              friends={friends}
              activeFriendIds={activeFriendIds}
              selectedFriendId={selectedFriendId}
              acceptingRequestIds={acceptingReqIds}
              onFriendEmailChange={setFriendEmail}
              onSendRequest={handleSendFriendRequest}
              onAcceptRequest={handleAcceptRequest}
              onSelectFriend={setSelectedFriendId}
              onRefresh={() => loadFriends({ background: true })}
            />
          </div>
        )}
      </div>
    </div>
  )
}
