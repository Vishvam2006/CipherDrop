import { getApiBaseUrl } from '../../services/api/client.js'
import { formatBytes } from '../../utils/formatters.js'
import { Button } from '../ui/Button.jsx'
import { Card } from '../ui/Card.jsx'
import { StatCard } from '../ui/StatCard.jsx'

export function DashboardHeader({ email, files, totalStorage, activeShareCount, onLogout }) {
  const apiBaseUrl = getApiBaseUrl()
  const connectionLabel = apiBaseUrl || 'same-origin /api via Vite proxy'

  return (
    <div className="dashboard-hero">
      <Card className="dashboard-hero__lead">
        <span className="eyebrow">Control center</span>
        <div className="dashboard-hero__title-row">
          <div>
            <h1>File operations, sharing, and history in one calm workspace.</h1>
            <p className="dashboard-hero__copy">
              Upload a file, capture the raw share URL the moment the backend returns it, and keep
              track of every saved upload tied to your account.
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onLogout}>
            Log out
          </Button>
        </div>

        <div className="dashboard-hero__meta">
          <div>
            <span className="meta-label">Signed in as</span>
            <strong>{email || 'Authenticated user'}</strong>
          </div>
          <div>
            <span className="meta-label">API connection</span>
            <strong>{connectionLabel}</strong>
          </div>
          <div>
            <span className="meta-label">Total storage</span>
            <strong>{formatBytes(totalStorage)}</strong>
          </div>
        </div>
      </Card>

      <div className="dashboard-hero__stats">
        <StatCard
          eyebrow="My uploads"
          title={`${files.length}`}
          description="Files currently returned by the protected `/api/my-files` route."
        />
        <StatCard
          eyebrow="Active session links"
          title={`${activeShareCount}`}
          description="Recent raw share links still available in this browser session."
        />
        <StatCard
          eyebrow="Workflow"
          title="Upload, copy, manage"
          description="Designed around the backend's short-lived sharing flow and file ownership rules."
        />
      </div>
    </div>
  )
}
