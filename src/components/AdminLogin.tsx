import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: any) => void
}

export const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to authenticate admin')
      }

      if (data.user.role !== 'ADMIN') {
        throw new Error('Access Denied: Your account does not have Admin privileges.')
      }

      onLoginSuccess(data.token, data.user)
    } catch (err: any) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 rounded-3xl glass-panel border border-purple-500/30 shadow-2xl relative">
      <div className="text-center mb-6">
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/30">
          🛡️
        </div>
        <h2 className="text-2xl font-extrabold text-white">Startup Connect Kerala</h2>
        <p className="text-xs text-purple-300 font-semibold tracking-wider uppercase mt-1">
          System Administration Control Panel
        </p>
      </div>

      {error && (
        <div className="p-3.5 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Admin Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. admin@startupkerala.in"
            className="w-full px-4 py-3 rounded-xl glass-input text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
            Admin Security Key / Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 pr-10 rounded-xl glass-input text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer p-1 transition-colors"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/25 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Verifying Admin Credentials...</span>
            </>
          ) : (
            <span>Access Admin Control Panel</span>
          )}
        </button>
      </form>
    </div>
  )
}
