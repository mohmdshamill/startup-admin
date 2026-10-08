import { useState, useEffect } from 'react'

interface AdminDashboardProps {
  token: string
  adminUser: any
  onLogout: () => void
}

const ROLES = ['FOUNDER', 'DEVELOPER', 'DESIGNER', 'INVESTOR', 'MENTOR', 'ADMIN']

export const AdminDashboard = ({ token, adminUser, onLogout }: AdminDashboardProps) => {
  const [stats, setStats] = useState<any | null>(null)
  
  // Data States
  const [users, setUsers] = useState<any[]>([])
  const [startups, setStartups] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  
  // UI States
  const [activeTab, setActiveTab] = useState<'USERS' | 'STARTUPS' | 'REPORTS'>('USERS')
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setStats(data.stats)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const url =
        selectedFilter !== 'ALL'
          ? `http://localhost:5000/api/admin/users?role=${selectedFilter}`
          : 'http://localhost:5000/api/admin/users'
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok) setUsers(data.users)
      else setError(data.error || 'Failed to fetch user list')
    } catch (err: any) {
      setError(err.message || 'Error communicating with server')
    } finally {
      setLoading(false)
    }
  }

  const fetchStartups = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/admin/startups', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setStartups(data.startups)
    } catch (err: any) {
      setError(err.message || 'Error fetching startups')
    } finally {
      setLoading(false)
    }
  }

  const fetchReports = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5000/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setReports(data.reports)
    } catch (err: any) {
      setError(err.message || 'Error fetching reports')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
    if (activeTab === 'USERS') fetchUsers()
    else if (activeTab === 'STARTUPS') fetchStartups()
    else if (activeTab === 'REPORTS') fetchReports()
  }, [activeTab, selectedFilter])

  // --- Actions ---

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionMessage(null)
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (res.ok) {
        setActionMessage(`User role updated to ${newRole}`)
        fetchUsers()
        fetchStats()
      } else {
        alert(data.error || 'Failed to update role')
      }
    } catch (err: any) {
      alert(err.message || 'Role change failed')
    }
  }

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    setActionMessage(null)
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        setActionMessage(`User status changed to ${!currentStatus ? 'Active' : 'Deactivated'}`)
        fetchUsers()
      } else {
        alert(data.error || 'Failed to update status')
      }
    } catch (err: any) {
      alert(err.message || 'Status update failed')
    }
  }

  const handleVerifyStartup = async (startupId: string, currentVerified: boolean) => {
    setActionMessage(null)
    try {
      const res = await fetch(`http://localhost:5000/api/admin/startups/${startupId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isVerified: !currentVerified }),
      })
      const data = await res.json()
      if (res.ok) {
        setActionMessage(`Startup verification updated.`)
        fetchStartups()
        fetchStats()
      } else {
        alert(data.error || 'Failed to update verification')
      }
    } catch (err: any) {
      alert(err.message || 'Verification update failed')
    }
  }

  const handleReportStatus = async (reportId: string, newStatus: string) => {
    setActionMessage(null)
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reports/${reportId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      })
      const data = await res.json()
      if (res.ok) {
        setActionMessage(`Report marked as ${newStatus}.`)
        fetchReports()
        fetchStats()
      } else {
        alert(data.error || 'Failed to update report status')
      }
    } catch (err: any) {
      alert(err.message || 'Report update failed')
    }
  }

  // --- Filtering ---

  const filteredUsers = users
    .filter((u) => u.role !== 'ADMIN') // Admin accounts cannot be managed/deactivated here
    .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  const filteredStartups = startups.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'FOUNDER': return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
      case 'DEVELOPER': return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
      case 'DESIGNER': return 'bg-pink-500/20 text-pink-400 border-pink-500/40'
      case 'INVESTOR': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
      case 'MENTOR': return 'bg-amber-500/20 text-amber-400 border-amber-500/40'
      case 'ADMIN': return 'bg-purple-500/20 text-purple-400 border-purple-500/40'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/40'
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 rounded-3xl glass-panel border border-purple-500/30">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white">System Administration Panel</h1>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Logged in as <strong className="text-purple-300">{adminUser.name}</strong> ({adminUser.email})
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 hover:bg-red-500/20 text-xs font-semibold cursor-pointer transition-all"
        >
          Sign Out Admin
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <span>✅</span>
          <span>{actionMessage}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Overview Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl glass-panel border border-purple-500/30 text-center flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">Total Users</span>
            <span className="text-3xl font-black text-white mt-1 block">{stats.totalUsers}</span>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-emerald-500/30 text-center flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider block">Startups</span>
            <span className="text-3xl font-black text-white mt-1 block">{stats.totalStartups} <span className="text-sm font-medium text-emerald-500">({stats.verifiedStartups} verified)</span></span>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-rose-500/30 text-center flex flex-col justify-center">
            <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider block">Reports</span>
            <span className="text-3xl font-black text-white mt-1 block">{stats.totalReports} <span className="text-sm font-medium text-rose-500">({stats.pendingReports} pending)</span></span>
          </div>
          <div className="p-4 rounded-2xl glass-panel border border-indigo-500/30 flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center"><span className="text-[10px] text-indigo-300 uppercase block">Founders</span><span className="font-bold text-white">{stats.founders}</span></div>
            <div className="text-center"><span className="text-[10px] text-indigo-300 uppercase block">Investors</span><span className="font-bold text-white">{stats.investors}</span></div>
            <div className="text-center"><span className="text-[10px] text-indigo-300 uppercase block">Talent</span><span className="font-bold text-white">{stats.developers + stats.designers}</span></div>
            <div className="text-center"><span className="text-[10px] text-indigo-300 uppercase block">Mentors</span><span className="font-bold text-white">{stats.mentors}</span></div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-2xl border border-gray-800 w-fit">
        <button 
          onClick={() => { setActiveTab('USERS'); setSearchQuery('') }} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Manage Users
        </button>
        <button 
          onClick={() => { setActiveTab('STARTUPS'); setSearchQuery('') }} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'STARTUPS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Verify Startups
        </button>
        <button 
          onClick={() => { setActiveTab('REPORTS'); setSearchQuery('') }} 
          className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'REPORTS' ? 'bg-rose-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
        >
          Handle Reports {stats?.pendingReports > 0 && <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">{stats.pendingReports}</span>}
        </button>
      </div>

      {/* Content Section */}
      <div className="p-6 rounded-3xl glass-panel border border-gray-800 space-y-4 min-h-[500px]">
        {/* Users Tab */}
        {activeTab === 'USERS' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><span>👥</span> User Directory & Role Control</h2>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users..." className="px-4 py-2.5 rounded-xl glass-input text-xs w-full sm:w-64" />
            </div>
            <div className="flex flex-wrap gap-2 pt-1 border-b border-gray-800 pb-3">
              {['ALL', ...ROLES].map((role) => (
                <button key={role} onClick={() => setSelectedFilter(role)} className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${selectedFilter === role ? 'bg-purple-600 text-white shadow-md' : 'bg-gray-900/60 border border-gray-800 text-gray-400 hover:text-white'}`}>
                  {role}
                </button>
              ))}
            </div>
            {loading ? <div className="py-12 text-center text-sm text-gray-400">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Current Role</th>
                      <th className="py-3 px-4">Change Role</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-900/40">
                        <td className="py-3.5 px-4"><div className="font-semibold text-gray-100">{user.name}</div><div className="text-gray-400 text-[11px]">{user.email}</div></td>
                        <td className="py-3.5 px-4"><span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${getRoleBadgeStyle(user.role)}`}>{user.role}</span></td>
                        <td className="py-3.5 px-4">
                          <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value)} className="bg-gray-900 border border-gray-700 text-gray-200 text-xs rounded-lg px-2 py-1">
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-1 text-[11px] rounded-full ${user.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                            {user.isActive ? 'Active' : 'Deactivated'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => handleToggleStatus(user.id, user.isActive)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${user.isActive ? 'bg-amber-500/10 text-amber-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                            {user.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Startups Tab */}
        {activeTab === 'STARTUPS' && (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><span>🏢</span> Verify Startup Listings</h2>
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search startups..." className="px-4 py-2.5 rounded-xl glass-input text-xs w-full sm:w-64" />
            </div>
            {loading ? <div className="py-12 text-center text-sm text-gray-400">Loading...</div> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Startup</th>
                      <th className="py-3 px-4">Founder</th>
                      <th className="py-3 px-4">Category / Stage</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60 text-xs">
                    {filteredStartups.map((startup) => (
                      <tr key={startup.id} className="hover:bg-gray-900/40">
                        <td className="py-3.5 px-4"><div className="font-semibold text-gray-100">{startup.title}</div><div className="text-gray-400 text-[11px] truncate max-w-[200px]">{startup.tagline}</div></td>
                        <td className="py-3.5 px-4 text-gray-300">{startup.founder?.name}</td>
                        <td className="py-3.5 px-4 text-gray-400">{startup.category} • {startup.stage}</td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${startup.isVerified ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-gray-500/20 text-gray-400 border-gray-500/40'}`}>
                            {startup.isVerified ? 'Verified ✓' : 'Unverified'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button onClick={() => handleVerifyStartup(startup.id, startup.isVerified)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${startup.isVerified ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'}`}>
                            {startup.isVerified ? 'Revoke Verification' : 'Verify Startup'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Reports Tab */}
        {activeTab === 'REPORTS' && (
          <>
            <div className="flex justify-between items-center border-b border-gray-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2"><span>⚠️</span> User Reports & Moderation</h2>
            </div>
            {loading ? <div className="py-12 text-center text-sm text-gray-400">Loading...</div> : reports.length === 0 ? (
              <div className="py-12 text-center text-sm text-gray-500">No reports found.</div>
            ) : (
              <div className="space-y-3 pt-4">
                {reports.map((report) => (
                  <div key={report.id} className="p-4 rounded-xl bg-gray-900/50 border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${report.status === 'PENDING' ? 'bg-rose-500/20 text-rose-400' : report.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                          {report.status}
                        </span>
                        <span className="text-xs text-gray-400">Reported {report.targetType} ({report.targetId})</span>
                      </div>
                      <p className="text-sm text-gray-200 mt-2 font-medium">"{report.reason}"</p>
                      <p className="text-xs text-gray-500 mt-2">Reported by: {report.reporter?.name} • {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      {report.status === 'PENDING' && (
                        <>
                          <button onClick={() => handleReportStatus(report.id, 'RESOLVED')} className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30">Mark Resolved</button>
                          <button onClick={() => handleReportStatus(report.id, 'DISMISSED')} className="px-3 py-1.5 rounded-lg bg-gray-800 text-gray-400 text-xs font-bold hover:bg-gray-700">Dismiss</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
