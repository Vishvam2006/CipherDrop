import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { ToastProvider } from './components/ui/ToastViewport.jsx'
import { useAuth } from './hooks/useAuth.js'
import { AuthPage } from './pages/AuthPage.jsx'
import { DashboardPage } from './pages/DashboardPage.jsx'

function AppContent() {
  const { token } = useAuth()
  return token ? <DashboardPage /> : <AuthPage />
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
