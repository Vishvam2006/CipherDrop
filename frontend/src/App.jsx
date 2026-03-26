import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const TOKEN_STORAGE_KEY = 'CipherDrop_token'
const EMAIL_STORAGE_KEY = 'CipherDrop_email'

function buildApiUrl(path) {
  return `${API_BASE_URL}${path}`
}

function getErrorMessage(payload, fallback) {
  if (typeof payload === 'string' && payload.trim()) {
    return payload
  }

  if (payload && typeof payload === 'object') {
    return payload.message || payload.error || fallback
  }

  return fallback
}

async function request(path, options = {}) {
  const response = await fetch(buildApiUrl(path), options)
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null)

  if (!response.ok) {
    const error = new Error(getErrorMessage(payload, `Request failed with status ${response.status}`))
    error.status = response.status
    error.payload = payload
    throw error
  }

  return payload
}

function formatBytes(size) {
  if (!Number.isFinite(size) || size <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB']
  let value = size
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const digits = value >= 10 || unitIndex === 0 ? 0 : 1
  return `${value.toFixed(digits)} ${units[unitIndex]}`
}

function formatTimestamp(value) {
  if (!value) {
    return 'Unknown'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return 'Unknown'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function getExpiryMeta(expiresAt, now) {
  if (!expiresAt) {
    return { label: 'No expiry data', tone: 'neutral' }
  }

  const expiresAtTime = new Date(expiresAt).getTime()

  if (Number.isNaN(expiresAtTime)) {
    return { label: 'Unknown expiry', tone: 'neutral' }
  }

  const diff = expiresAtTime - now

  if (diff <= 0) {
    return { label: 'Expired', tone: 'expired' }
  }

  const seconds = Math.ceil(diff / 1000)

  if (seconds < 60) {
    return {
      label: `Expires in ${seconds}s`,
      tone: seconds <= 10 ? 'warning' : 'live',
    }
  }

  const minutes = Math.ceil(seconds / 60)
  return { label: `Expires in ${minutes}m`, tone: 'live' }
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({
    email: localStorage.getItem(EMAIL_STORAGE_KEY) || '',
    password: '',
  })
  const [token, setToken] = useState(localStorage.getItem(TOKEN_STORAGE_KEY) || '')
  const [sessionEmail, setSessionEmail] = useState(localStorage.getItem(EMAIL_STORAGE_KEY) || '')
  const [notice, setNotice] = useState(null)
  const [authLoading, setAuthLoading] = useState(false)
  const [filesLoading, setFilesLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileInputKey, setFileInputKey] = useState(0)
  const [files, setFiles] = useState([])
  const [recentLinks, setRecentLinks] = useState({})
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!token) {
      setFiles([])
      return
    }

    loadFiles()
  }, [token])

  async function loadFiles() {
    setFilesLoading(true)

    try {
      const data = await request('/api/my-files', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const nextFiles = Array.isArray(data?.files) ? data.files : []

      nextFiles.sort((left, right) => {
        return new Date(right.uploadDate).getTime() - new Date(left.uploadDate).getTime()
      })

      setFiles(nextFiles)
    } catch (error) {
      if (error.status === 401 || error.status === 404) {
        handleLogout('Session expired. Please log in again.')
      } else {
        setNotice({ type: 'error', message: error.message || 'Unable to fetch files.' })
      }
    } finally {
      setFilesLoading(false)
    }
  }

  function handleInputChange(event) {
    const { name, value } = event.target
    setAuthForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setAuthLoading(true)
    setNotice(null)

    try {
      if (authMode === 'register') {
        const response = await request('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(authForm),
        })

        localStorage.setItem(EMAIL_STORAGE_KEY, authForm.email)
        setSessionEmail(authForm.email)
        setAuthForm((current) => ({ ...current, password: '' }))
        setAuthMode('login')
        setNotice({
          type: 'success',
          message: response?.message || 'Registration complete. You can log in now.',
        })
        return
      }

      const response = await request('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authForm),
      })

      localStorage.setItem(TOKEN_STORAGE_KEY, response.token)
      localStorage.setItem(EMAIL_STORAGE_KEY, authForm.email)
      setToken(response.token)
      setSessionEmail(authForm.email)
      setAuthForm((current) => ({ ...current, password: '' }))
      setNotice({
        type: 'success',
        message: response?.message || 'Login successful.',
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Authentication failed.',
      })
    } finally {
      setAuthLoading(false)
    }
  }

  function handleLogout(message = 'Signed out.') {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setToken('')
    setFiles([])
    setRecentLinks({})
    setSelectedFile(null)
    setFileInputKey((value) => value + 1)
    setNotice({ type: 'success', message })
  }

  async function handleUploadSubmit(event) {
    event.preventDefault()

    if (!selectedFile) {
      setNotice({ type: 'error', message: 'Choose a file before uploading.' })
      return
    }

    setUploading(true)
    setNotice(null)

    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await request('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response?.file?._id && response?.shareLink) {
        setRecentLinks((current) => ({
          ...current,
          [response.file._id]: response.shareLink,
        }))
      }

      setSelectedFile(null)
      setFileInputKey((value) => value + 1)
      setNotice({
        type: 'success',
        message: response?.message || 'File uploaded successfully.',
      })

      await loadFiles()
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Upload failed.',
      })
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(fileId) {
    const confirmed = window.confirm('Delete this file from the backend storage?')

    if (!confirmed) {
      return
    }

    try {
      const response = await request(`/api/file/${fileId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setFiles((current) => current.filter((file) => file._id !== fileId))
      setRecentLinks((current) => {
        const nextLinks = { ...current }
        delete nextLinks[fileId]
        return nextLinks
      })
      setNotice({
        type: 'success',
        message: response?.message || 'File deleted.',
      })
    } catch (error) {
      setNotice({
        type: 'error',
        message: error.message || 'Delete failed.',
      })
    }
  }

  async function copyShareLink(link) {
    try {
      await navigator.clipboard.writeText(link)
      setNotice({ type: 'success', message: 'Share link copied to clipboard.' })
    } catch {
      setNotice({
        type: 'error',
        message: `Copy failed. Use this link manually: ${link}`,
      })
    }
  }

  const activeFile = files.find((file) => recentLinks[file._id])
  const connectionLabel = API_BASE_URL ? API_BASE_URL : 'same-origin /api (Vite proxy in dev)'

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">CipherDrop file delivery</p>
          <h1>Ship files fast with short-lived links backed by your existing API.</h1>
          <p className="hero-text">
            This frontend follows the current backend exactly: auth under
            <code>/api/auth</code>, uploads under <code>/api/upload</code>, your file list under
            <code>/api/my-files</code>, and direct downloads from shared tokens.
          </p>
        </div>

        <div className="hero-meta">
          <div className="stat-card">
            <span className="stat-label">Link lifetime</span>
            <strong>30 seconds</strong>
            <p>Matches the backend expiry window configured during upload.</p>
          </div>
          <div className="stat-card">
            <span className="stat-label">Connection</span>
            <strong>{connectionLabel}</strong>
            <p>Set <code>VITE_API_BASE_URL</code> only if this app is served from another origin.</p>
          </div>
          <div className="stat-card">
            <span className="stat-label">Session</span>
            <strong>{token ? sessionEmail || 'Authenticated' : 'Guest mode'}</strong>
            <p>{token ? 'Upload, copy your latest link, and manage files.' : 'Register or log in to continue.'}</p>
          </div>
        </div>
      </section>

      {notice ? (
        <div className={`notice notice-${notice.type}`} role="status">
          {notice.message}
        </div>
      ) : null}

      {!token ? (
        <section className="auth-layout">
          <article className="glass-card feature-card">
            <h2>What the backend supports right now</h2>
            <ul className="feature-list">
              <li>Register and login with email/password.</li>
              <li>Upload one file at a time using a bearer token.</li>
              <li>Receive a raw share link only once, immediately after upload.</li>
              <li>List your files and delete them later.</li>
            </ul>
            <p className="muted-copy">
              Stored share tokens are hashed in MongoDB, so old links cannot be recreated from the
              current <code>/api/my-files</code> response. This UI keeps newly generated links
              visible during the active session.
            </p>
          </article>

          <article className="glass-card auth-card">
            <div className="mode-switch" role="tablist" aria-label="Authentication mode">
              <button
                type="button"
                className={authMode === 'login' ? 'is-active' : ''}
                onClick={() => setAuthMode('login')}
              >
                Login
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'is-active' : ''}
                onClick={() => setAuthMode('register')}
              >
                Register
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <label>
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={authForm.email}
                  onChange={handleInputChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={authForm.password}
                  onChange={handleInputChange}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  required
                />
              </label>

              <button className="primary-button" type="submit" disabled={authLoading}>
                {authLoading ? 'Please wait...' : authMode === 'login' ? 'Enter dashboard' : 'Create account'}
              </button>
            </form>
          </article>
        </section>
      ) : (
        <section className="dashboard-layout">
          <article className="glass-card upload-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Upload center</p>
                <h2>Create a share link</h2>
              </div>
              <button type="button" className="ghost-button" onClick={() => handleLogout()}>
                Log out
              </button>
            </div>

            <form className="upload-form" onSubmit={handleUploadSubmit}>
              <label className="file-picker">
                <span>Select a file</span>
                <input
                  key={fileInputKey}
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                />
              </label>

              <div className="upload-summary">
                <div>
                  <span className="summary-label">Chosen file</span>
                  <strong>{selectedFile ? selectedFile.name : 'Nothing selected yet'}</strong>
                </div>
                <div>
                  <span className="summary-label">Size</span>
                  <strong>{selectedFile ? formatBytes(selectedFile.size) : '0 B'}</strong>
                </div>
              </div>

              <button className="primary-button" type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload and generate link'}
              </button>
            </form>

            <div className="callout">
              <strong>Backend limitation preserved:</strong>
              <span>the raw share URL is only returned on upload, so copy it before it expires.</span>
            </div>
          </article>

          <article className="glass-card recent-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Latest share</p>
                <h2>{activeFile ? activeFile.filename : 'No fresh link yet'}</h2>
              </div>
            </div>

            {activeFile ? (
              <div className="link-card">
                <p className="link-label">Share URL</p>
                <a href={recentLinks[activeFile._id]} target="_blank" rel="noreferrer">
                  {recentLinks[activeFile._id]}
                </a>
                <div className="row-actions">
                  <button type="button" className="primary-button" onClick={() => copyShareLink(recentLinks[activeFile._id])}>
                    Copy link
                  </button>
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => window.open(recentLinks[activeFile._id], '_blank', 'noopener,noreferrer')}
                  >
                    Open download
                  </button>
                </div>
                <p className="muted-copy">
                  {getExpiryMeta(activeFile.expiresAt, now).label}. Uploaded {formatTimestamp(activeFile.uploadDate)}.
                </p>
              </div>
            ) : (
              <p className="muted-copy">
                Upload a file to receive the raw share URL from the backend and keep it available in
                this session.
              </p>
            )}
          </article>

          <article className="glass-card files-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Stored files</p>
                <h2>My uploads</h2>
              </div>
              <button type="button" className="secondary-button" onClick={loadFiles} disabled={filesLoading}>
                {filesLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>

            {filesLoading && files.length === 0 ? (
              <p className="muted-copy">Loading files from the backend...</p>
            ) : files.length === 0 ? (
              <p className="muted-copy">No uploads found for this account yet.</p>
            ) : (
              <div className="file-list">
                {files.map((file) => {
                  const expiry = getExpiryMeta(file.expiresAt, now)
                  const shareLink = recentLinks[file._id]

                  return (
                    <article className="file-row" key={file._id}>
                      <div className="file-main">
                        <div className="file-title-row">
                          <h3>{file.filename}</h3>
                          <span className={`status-pill tone-${expiry.tone}`}>{expiry.label}</span>
                        </div>
                        <p>
                          {formatBytes(file.size)} | Uploaded {formatTimestamp(file.uploadDate)}
                        </p>
                        <p className="muted-copy">
                          {shareLink
                            ? 'This link was generated in the current session and can still be copied below.'
                            : 'Link unavailable after refresh because the backend stores only the hashed token.'}
                        </p>
                      </div>

                      <div className="row-actions">
                        {shareLink ? (
                          <button type="button" className="secondary-button" onClick={() => copyShareLink(shareLink)}>
                            Copy link
                          </button>
                        ) : null}
                        <button type="button" className="danger-button" onClick={() => handleDelete(file._id)}>
                          Delete
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </article>
        </section>
      )}
    </main>
  )
}

export default App
