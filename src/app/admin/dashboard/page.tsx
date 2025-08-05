'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface DashboardData {
  kpis: {
    activeMembers: number
    totalMembers: number
    totalTrainers: number
    totalBranches: number
    monthlyRevenue: number
    dailyRevenue: number
    averageRating: number
  }
  charts: {
    attendanceTrends: Array<{ date: string; attendance: number }>
    trainerEarnings: Array<{ id: number; name: string; earnings: number; sessions: number; rating: number }>
  }
  recentActivity: Array<{ type: string; message: string; time: string }>
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchDashboardData(token)
  }, [router])

  const fetchDashboardData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-semibold">Error</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.push('/admin/login')}
            className="mt-4 text-slate-600 hover:text-slate-900"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Koredio Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-6">
                <a href="/admin/dashboard" className="text-slate-900 font-medium">Dashboard</a>
                <a href="/admin/members" className="text-slate-600 hover:text-slate-900">Members</a>
                <a href="/admin/trainers" className="text-slate-600 hover:text-slate-900">Trainers</a>
                <a href="/admin/classes" className="text-slate-600 hover:text-slate-900">Classes</a>
                <a href="/admin/leads" className="text-slate-600 hover:text-slate-900">Leads</a>
                <a href="/admin/store" className="text-slate-600 hover:text-slate-900">Store</a>
                <a href="/admin/reports" className="text-slate-600 hover:text-slate-900">Reports</a>
              </nav>
              <button
                onClick={handleLogout}
                className="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Active Members</p>
                <p className="text-3xl font-bold text-slate-900">{data.kpis.activeMembers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Monthly Revenue</p>
                <p className="text-3xl font-bold text-slate-900">₹{data.kpis.monthlyRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Total Trainers</p>
                <p className="text-3xl font-bold text-slate-900">{data.kpis.totalTrainers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-purple-500 rounded"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-600">Average Rating</p>
                <p className="text-3xl font-bold text-slate-900">{data.kpis.averageRating}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Attendance Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Attendance Trends (Last 7 Days)</h3>
            <div className="space-y-3">
              {data.charts.attendanceTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{trend.date}</span>
                  <div className="flex items-center">
                    <div className="w-32 bg-slate-200 rounded-full h-2 mr-3">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${trend.attendance}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-slate-900">{trend.attendance}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trainer Earnings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Trainer Performance</h3>
            <div className="space-y-4">
              {data.charts.trainerEarnings.map((trainer) => (
                <div key={trainer.id} className="border-b border-slate-200 pb-3 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-slate-900">{trainer.name}</p>
                      <p className="text-sm text-slate-600">{trainer.sessions} sessions</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₹{trainer.earnings.toLocaleString()}</p>
                      <p className="text-sm text-slate-600">Rating: {trainer.rating}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {data.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'member_joined' ? 'bg-green-500' :
                  activity.type === 'payment_received' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-slate-900">{activity.message}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
