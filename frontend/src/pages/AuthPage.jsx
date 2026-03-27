import { AuthForm } from '../components/auth/AuthForm.jsx'
import { AuthHighlights } from '../components/auth/AuthHighlights.jsx'

export function AuthPage() {
  return (
    <div className="bg-page min-h-screen">
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-16 items-center">
          <AuthHighlights />
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
