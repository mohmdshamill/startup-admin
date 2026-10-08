import { useState, useEffect } from 'react'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'

export function App() {
  const [adminToken, setAdminToken] = useState<string | null>(null)
  const [adminUser, setAdminUser] = useState<any | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token')
    const savedUser = localStorage.getItem('admin_user')

    if (savedToken && savedUser) {
      try {
        setAdminToken(savedToken)
        setAdminUser(JSON.parse(savedUser))
      } catch (err) {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
      }
    }
  }, [])

  const handleLoginSuccess = (token: string, user: any) => {
    setAdminToken(token)
    setAdminUser(user)
    localStorage.setItem('admin_token', token)
    localStorage.setItem('admin_user', JSON.stringify(user))
  }

  const handleLogout = () => {
    setAdminToken(null)
    setAdminUser(null)
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
  }

  return (
    <div className="min-h-screen bg-mesh-admin text-gray-100 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-gray-950/80 backdrop-blur-xl px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-600 flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-purple-500/30">
              🛡️
            </div>
            <div>
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                Startup Connect Kerala — Admin Portal
              </h1>
              <p className="text-[11px] text-gray-400 font-medium hidden sm:block">
                Role-Based Access Control & User Administration Center
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        {adminToken && adminUser ? (
          <AdminDashboard token={adminToken} adminUser={adminUser} onLogout={handleLogout} />
        ) : (
          <AdminLogin onLoginSuccess={handleLoginSuccess} />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-4 px-4 text-center text-xs text-gray-500">
        Startup Connect Kerala Administration Panel &copy; 2026 • System Security & Role Management
      </footer>
    </div>
  )
}

export default App
