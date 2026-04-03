import { useCallback, useEffect, useRef, useState } from 'react'
import { UploadCloud, Files, Users, HardDrive, Activity } from 'lucide-react'
import { FriendsPanel }       from '../components/dashboard/FriendsPanel.jsx'
import { IncomingFilesPanel } from '../components/dashboard/IncomingFilesPanel.jsx'
import { UploadDropzone }     from '../components/dashboard/UploadDropzone.jsx'
import { ShareLinkPanel }     from '../components/dashboard/ShareLinkPanel.jsx'
import { FilesTable }         from '../components/dashboard/FilesTable.jsx'
import { Navbar }             from '../components/ui/Navbar.jsx'
import { useAuth }            from '../hooks/useAuth.js'
import { useToast }           from '../hooks/useToast.js'
import { deleteOwnedFile, downloadSharedFile, fetchMyFiles, uploadOwnedFile } from '../services/api/files.js'
import { acceptFriendRequest, fetchActiveFriends, fetchFriendRequests, fetchFriends, sendFriendRequest } from '../services/api/friends.js'
import { createAppSocket }    from '../services/socket.js'
import { getUserIdFromToken } from '../utils/auth.js'
import { getTotalStorage, sortFilesByUploadDate } from '../utils/formatters.js'
import { getStoredRecentLinks, persistRecentLinks, removeStoredRecentLink } from '../utils/storage.js'

/* ── helpers ── */
const filterLinks  = (links, files) => { const ids = new Set(files.map((f) => f._id)); return Object.fromEntries(Object.entries(links).filter(([id]) => ids.has(id))) }
const sortByEmail  = (arr) => [...(Array.isArray(arr) ? arr : [])].sort((a, b) => (a?.email || '').localeCompare(b?.email || ''))
const sortReqEmail = (arr) => [...(Array.isArray(arr) ? arr : [])].sort((a, b) => (a?.requestor?.email || '').localeCompare(b?.requestor?.email || ''))
const fmtStorage   = (b) => b >= 1048576 ? `${(b/1048576).toFixed(1)} MB` : b >= 1024 ? `${Math.round(b/1024)} KB` : `${b} B`

/* ── StatCard ── */
function StatCard({ icon: Icon, label, value, accentBg, accentBorder, accentText }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-indigo-200 hover:shadow-md transition-all duration-200">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: accentBg || '#eef2ff', border: `1px solid ${accentBorder || '#c7d2fe'}`, color: accentText || '#6366f1' }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

/* ── PageHeader ── */
function PageHeader({ tag, tagIcon: TagIcon, title, subtitle }) {
  return (
    <div className="mb-7">
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-3">
        {TagIcon && <TagIcon size={11} className="text-indigo-500" />}
        <span className="text-xs font-semibold text-indigo-600">{tag}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
        {title}
      </h1>
      {subtitle && <p className="text-gray-500 text-sm mt-2 max-w-lg leading-relaxed">{subtitle}</p>}
    </div>
  )
}

/* ── DashboardPage ── */
export function DashboardPage() {
  const { logout, token } = useAuth()
  const { showToast }     = useToast()
  const userId            = getUserIdFromToken(token)
  const friendLookup      = useRef({})

  const [activePage,        setActivePage]        = useState('upload')
  const [files,             setFiles]             = useState([])
  const [selectedFile,      setSelectedFile]      = useState(null)
  const [selectedFriendId,  setSelectedFriendId]  = useState('')
  const [friends,           setFriends]           = useState([])
  const [pendingRequests,   setPendingRequests]   = useState([])
  const [activeFriendIds,   setActiveFriendIds]   = useState([])
  const [incoming,          setIncoming]          = useState([])
  const [friendEmail,       setFriendEmail]       = useState('')
  const [latestEntry,       setLatestEntry]       = useState(null)
  const [recentLinks,       setRecentLinks]       = useState(() => getStoredRecentLinks())
  const [loadingFiles,      setLoadingFiles]      = useState(true)
  const [refreshingFiles,   setRefreshingFiles]   = useState(false)
  const [loadingFriends,    setLoadingFriends]    = useState(true)
  const [refreshingFriends, setRefreshingFriends] = useState(false)
  const [uploading,         setUploading]         = useState(false)
  const [sendingReq,        setSendingReq]        = useState(false)
  const [acceptingIds,      setAcceptingIds]      = useState([])
  const [now,               setNow]               = useState(Date.now())

  useEffect(() => { const t = window.setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { friendLookup.current = Object.fromEntries(friends.map((f) => [f._id, f])) }, [friends])

  const sessionEnd = useCallback((msg) => { logout(); showToast({ title: 'Session ended', message: msg, tone: 'error' }) }, [logout, showToast])
  const notifyError = useCallback((title, msg) => showToast({ title, message: msg, tone: 'error' }), [showToast])

  const loadFiles = useCallback(async ({ background = false } = {}) => {
    background ? setRefreshingFiles(true) : setLoadingFiles(true)
    try {
      const res  = await fetchMyFiles(token)
      const next = sortFilesByUploadDate(Array.isArray(res?.files) ? res.files : [])
      setFiles(next)
      setRecentLinks((cur) => { const f = filterLinks(cur, next); persistRecentLinks(f); return f })
      return next
    } catch (e) {
      if (e.status === 401 || e.status === 404) sessionEnd('Please log in again.')
      else notifyError('Unable to load files', e.message || 'Try again.')
      return []
    } finally { setLoadingFiles(false); setRefreshingFiles(false) }
  }, [sessionEnd, notifyError, token])

  const loadFriends = useCallback(async ({ background = false } = {}) => {
    background ? setRefreshingFriends(true) : setLoadingFriends(true)
    try {
      const [fr, rq, ac] = await Promise.all([fetchFriends(token), fetchFriendRequests(token), fetchActiveFriends(token)])
      const nf = sortByEmail(fr?.friends), nr = sortReqEmail(rq?.requests), na = Array.isArray(ac?.activeFriends) ? ac.activeFriends : []
      setFriends(nf); setPendingRequests(nr); setActiveFriendIds(na)
      return { friends: nf }
    } catch (e) {
      if (e.status === 401 || e.status === 404) sessionEnd('Please log in again.')
      else notifyError('Unable to load friends', e.message || 'Try again.')
      return null
    } finally { setLoadingFriends(false); setRefreshingFriends(false) }
  }, [sessionEnd, notifyError, token])

  useEffect(() => { loadFiles() },   [loadFiles])
  useEffect(() => { loadFriends() }, [loadFriends])

  useEffect(() => {
    if (!selectedFriendId && friends.length > 0) setSelectedFriendId(friends[0]._id)
    if (selectedFriendId && !friends.some((f) => f._id === selectedFriendId)) setSelectedFriendId(friends[0]?._id || '')
  }, [friends, selectedFriendId])

  useEffect(() => {
    if (!token || !userId) return
    const sock = createAppSocket()
    sock.on('connect', () => sock.emit('register', userId))
    sock.on('user-online',   (id) => { if (!friendLookup.current[id]) return; setActiveFriendIds((c) => c.includes(id) ? c : [...c, id]) })
    sock.on('user-offline',  (id) => setActiveFriendIds((c) => c.filter((x) => x !== id)))
    sock.on('file-incoming', (p) => {
      const sender = friendLookup.current[p?.from]
      const t = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, from: p?.from || '', fromEmail: sender?.email || 'A friend', filename: p?.filename || 'Shared file', link: p?.link || '', createdAt: new Date().toISOString() }
      setIncoming((c) => [t, ...c].slice(0, 8))
      showToast({ title: 'Incoming file', message: `${t.fromEmail} sent ${t.filename}.`, tone: 'success' })
    })
    return () => sock.disconnect()
  }, [showToast, token, userId])

  async function handleUpload(file) {
    if (!selectedFriendId) { notifyError('Select a friend first', 'Choose an approved friend before uploading.'); setActivePage('friends'); return }
    setUploading(true)
    try {
      const res = await uploadOwnedFile(token, file, selectedFriendId)
      const pending = { fileId: `p-${Date.now()}`, filename: file.name, shareLink: res?.shareLink, expiresAt: new Date(Date.now() + 60_000).toISOString(), uploadDate: new Date().toISOString() }
      setLatestEntry(pending); setSelectedFile(null)
      const friend = friends.find((f) => f._id === selectedFriendId)
      showToast({ title: 'Upload complete', message: friend ? `${file.name} sent to ${friend.email}.` : 'File sent.', tone: 'success' })
      const next = await loadFiles({ background: true })
      const match = next.find((f) => f.filename === file.name && Number(f.size) === Number(file.size) && (!selectedFriendId || f.receiver === selectedFriendId))
      if (match && res?.shareLink) {
        const linked = { fileId: match._id, filename: match.filename, shareLink: res.shareLink, expiresAt: match.expiresAt || pending.expiresAt, uploadDate: match.uploadDate || pending.uploadDate, createdAt: Date.now() }
        setRecentLinks((c) => { const n = { ...c, [match._id]: linked }; persistRecentLinks(n); return n })
        setLatestEntry(linked)
      }
    } catch (e) {
      if (e.status === 401 || e.status === 404) sessionEnd('Please log in again.')
      else notifyError('Upload failed', e.message || 'Try another file.')
    } finally { setUploading(false) }
  }

  async function handleDelete(fileId) {
    if (!window.confirm('Delete this file?')) return
    try {
      const res = await deleteOwnedFile(token, fileId)
      setFiles((c) => c.filter((f) => f._id !== fileId))
      setRecentLinks(() => removeStoredRecentLink(fileId))
      showToast({ title: 'Deleted', message: res?.message || 'File removed.', tone: 'success' })
    } catch (e) {
      if (e.status === 401 || e.status === 404) sessionEnd('Please log in again.')
      else notifyError('Delete failed', e.message || 'Try again.')
    }
  }

  async function handleCopyLink(link) {
    try { await navigator.clipboard.writeText(link); showToast({ title: 'Copied!', message: 'Link is on your clipboard.', tone: 'success' }) }
    catch { showToast({ title: 'Copy failed', message: link, tone: 'error' }) }
  }

  async function handleDownload(transfer) {
    try { await downloadSharedFile(token, transfer.link, transfer.filename); showToast({ title: 'Download started', message: `${transfer.filename} downloading.`, tone: 'success' }) }
    catch (e) {
      if (e.status === 401 || e.status === 404) sessionEnd('Please log in again.')
      else notifyError('Download failed', e.message || 'Try again.')
    }
  }

  async function handleSendFriendRequest(e) {
    e.preventDefault()
    const email = friendEmail.trim().toLowerCase()
    if (!email) { notifyError('Email required', "Enter a friend's email."); return }
    setSendingReq(true)
    try {
      const res = await sendFriendRequest(token, email)
      setFriendEmail('')
      showToast({ title: 'Request sent', message: res?.message || `Sent to ${email}.`, tone: 'success' })
      await loadFriends({ background: true })
    } catch (e) {
      if (e.status === 401 || e.status === 404) sessionEnd('Please log in again.')
      else notifyError('Could not send request', e.message || 'Try again.')
    } finally { setSendingReq(false) }
  }

  async function handleAcceptRequest(requestId) {
    setAcceptingIds((c) => [...c, requestId])
    try {
      const res = await acceptFriendRequest(token, requestId)
      showToast({ title: 'Friend accepted', message: res?.message || 'You can now exchange files.', tone: 'success' })
      await loadFriends({ background: true })
    } catch (e) {
      if (e.status === 401 || e.status === 404) sessionEnd('Please log in again.')
      else notifyError('Could not accept', e.message || 'Try again.')
    } finally { setAcceptingIds((c) => c.filter((id) => id !== requestId)) }
  }

  const handleLogout = () => { logout(); showToast({ title: 'Signed out', message: 'See you next time.', tone: 'success' }) }

  const recentEntries  = Object.values(recentLinks).sort((a, b) => b.createdAt - a.createdAt)
  const displayEntry   = latestEntry || recentEntries[0] || null
  const totalStorage   = getTotalStorage(files)
  const selectedFriend = friends.find((f) => f._id === selectedFriendId) || null
  const activeFriendSet = new Set(activeFriendIds)

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ backgroundImage: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(99,102,241,.06) 0%, transparent 60%)' }}
    >
      <Navbar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-5 py-8">

        {/* ── Upload ── */}
        {activePage === 'upload' && (
          <div className="page-enter">
            <PageHeader tag="File Sharing" tagIcon={UploadCloud}
              title={<>Share files <span className="gradient-text">instantly.</span></>}
              subtitle="Upload any file and route a secure one-time link to one of your approved friends."
            />

            <div className="grid lg:grid-cols-[1fr_320px] gap-5 items-start">
              {/* Upload card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
                <div>
                  <p className="text-sm font-bold text-gray-900">Upload a file</p>
                  <p className="text-xs text-gray-400 mt-0.5">Drop any file below, choose a recipient, then send.</p>
                </div>

                {/* Recipient selector */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">Recipient</p>
                      <p className="text-xs text-gray-400 mt-0.5">Who receives this file</p>
                    </div>
                    {selectedFriend && (
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        activeFriendSet.has(selectedFriend._id)
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                      }`}>
                        {activeFriendSet.has(selectedFriend._id) ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </div>

                  <select
                    value={selectedFriendId}
                    onChange={(e) => setSelectedFriendId(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white text-gray-800 outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all"
                  >
                    <option value="">{friends.length > 0 ? 'Select a friend…' : 'No approved friends yet'}</option>
                    {friends.map((f) => <option key={f._id} value={f._id}>{f.email}</option>)}
                  </select>

                  {friends.length === 0 && (
                    <button
                      type="button" onClick={() => setActivePage('friends')}
                      className="mt-3 px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      Add a friend first →
                    </button>
                  )}
                  {selectedFriend && (
                    <p className="text-xs text-gray-400 mt-2">
                      File will be routed to <strong className="text-gray-600">{selectedFriend.email}</strong>
                    </p>
                  )}
                </div>

                <UploadDropzone file={selectedFile} uploading={uploading} onFileSelect={setSelectedFile} onUpload={handleUpload} />
              </div>

              {/* Sidebar */}
              <div className="flex flex-col gap-5">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <ShareLinkPanel entry={displayEntry} now={now} onCopyLink={handleCopyLink} onOpenLink={(l) => window.open(l, '_blank', 'noopener,noreferrer')} />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <IncomingFilesPanel transfers={incoming} onCopyLink={handleCopyLink} onDownload={handleDownload} />
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4 mt-5">
              <StatCard icon={Files}     label="Files uploaded" value={files.length} />
              <StatCard icon={HardDrive} label="Storage used"   value={fmtStorage(totalStorage)}      accentBg="#eef2ff" accentBorder="#c7d2fe" accentText="#6366f1" />
              <StatCard icon={Activity}  label="Friends online" value={activeFriendIds.length}         accentBg="#dcfce7" accentBorder="#86efac" accentText="#16a34a" />
            </div>
          </div>
        )}

        {/* ── Files ── */}
        {activePage === 'files' && (
          <div className="page-enter">
            <PageHeader tag="My Files" tagIcon={Files}
              title={<>Your <span className="gradient-text">uploads.</span></>}
              subtitle="Manage and review every file you have sent. Delete files to free up space."
            />
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <FilesTable files={files} now={now} recentLinks={recentLinks}
                loading={loadingFiles} refreshing={refreshingFiles}
                onRefresh={() => loadFiles({ background: true })}
                onCopyLink={handleCopyLink} onDelete={handleDelete}
              />
            </div>
          </div>
        )}

        {/* ── Friends ── */}
        {activePage === 'friends' && (
          <div className="page-enter">
            <PageHeader tag="Friends" tagIcon={Users}
              title={<>Your <span className="gradient-text">network.</span></>}
              subtitle="Add friends by email, accept requests, and select who should receive your next upload."
            />
            <FriendsPanel
              friendEmail={friendEmail} loading={loadingFriends} refreshing={refreshingFriends}
              sendingRequest={sendingReq} pendingRequests={pendingRequests}
              friends={friends} activeFriendIds={activeFriendIds}
              selectedFriendId={selectedFriendId} acceptingRequestIds={acceptingIds}
              onFriendEmailChange={setFriendEmail} onSendRequest={handleSendFriendRequest}
              onAcceptRequest={handleAcceptRequest} onSelectFriend={setSelectedFriendId}
              onRefresh={() => loadFriends({ background: true })}
            />
          </div>
        )}

      </div>
    </div>
  )
}
