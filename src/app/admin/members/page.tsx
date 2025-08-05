'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Member {
  id: number
  name: string
  email: string
  phone: string
  status: string
  plan: string
  trainer_id: number
  branch_id: number
  join_date: string
  plan_expiry: string
  trainer?: {
    id: number
    name: string
  }
}

interface MembersData {
  members: Member[]
  total: number
  filters: {
    statuses: string[]
    trainers: Array<{ id: number; name: string }>
  }
}

export default function MembersPage() {
  const [data, setData] = useState<MembersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    trainer_id: '',
    search: ''
  })
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      router.push('/admin/login')
      return
    }

    fetchMembers(token)
  }, [router, filters])

  const fetchMembers = async (token: string) => {
    try {
      const params = new URLSearchParams()
      if (filters.status) params.append('status', filters.status)
      if (filters.trainer_id) params.append('trainer_id', filters.trainer_id)
      if (filters.search) params.append('search', filters.search)

      const response = await fetch(`http://localhost:3001/api/admin/members?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      const result = await response.json()

      if (result.success) {
        setData(result.data)
      } else {
        setError(result.error || 'Failed to fetch members')
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTrainer = async (memberId: number, trainerId: number) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:3001/api/admin/members/${memberId}/assign-trainer`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trainer_id: trainerId }),
      })

      const result = await response.json()

      if (result.success) {
        alert('Trainer assigned successfully!')
        fetchMembers(token)
      } else {
        alert(result.error || 'Failed to assign trainer')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  const handleExtendPlan = async (memberId: number, months: number) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:3001/api/admin/members/${memberId}/extend-plan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ months }),
      })

      const result = await response.json()

      if (result.success) {
        alert(`Plan extended by ${months} months successfully!`)
        fetchMembers(token)
      } else {
        alert(result.error || 'Failed to extend plan')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  const sendWhatsAppReminder = async (member: Member) => {
    const token = localStorage.getItem('admin_token')
    if (!token) return

    try {
      const response = await fetch('http://localhost:3001/api/integrations/whatsapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: member.phone,
          template: 'reminder',
          variables: {
            name: member.name,
            class: 'your scheduled workout',
            time: 'soon'
          }
        }),
      })

      const result = await response.json()

      if (result.success) {
        alert('WhatsApp reminder sent successfully!')
      } else {
        alert(result.error || 'Failed to send reminder')
      }
    } catch (err) {
      alert('Network error occurred')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading members...</p>
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
              <h1 className="text-2xl font-bold text-slate-900">Member Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-6">
                <a href="/admin/dashboard" className="text-slate-600 hover:text-slate-900">Dashboard</a>
                <a href="/admin/members" className="text-slate-900 font-medium">Members</a>
                <a href="/admin/trainers" className="text-slate-600 hover:text-slate-900">Trainers</a>
                <a href="/admin/classes" className="text-slate-600 hover:text-slate-900">Classes</a>
                <a href="/admin/leads" className="text-slate-600 hover:text-slate-900">Leads</a>
                <a href="/admin/store" className="text-slate-600 hover:text-slate-900">Store</a>
                <a href="/admin/reports" className="text-slate-600 hover:text-slate-900">Reports</a>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">All Statuses</option>
                {data.filters.statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Trainer</label>
              <select
                value={filters.trainer_id}
                onChange={(e) => setFilters({ ...filters, trainer_id: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <option value="">All Trainers</option>
                {data.filters.trainers.map(trainer => (
                  <option key={trainer.id} value={trainer.id.toString()}>{trainer.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by name or email"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Members Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">
              Members ({data.total})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Trainer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {data.members.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">{member.name}</div>
                        <div className="text-sm text-slate-500">{member.email}</div>
                        <div className="text-sm text-slate-500">{member.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {member.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {member.trainer?.name || 'Not assigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        member.status === 'active' ? 'bg-green-100 text-green-800' :
                        member.status === 'expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {member.plan_expiry}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => {
                          const trainerId = prompt('Enter trainer ID:')
                          if (trainerId) handleAssignTrainer(member.id, parseInt(trainerId))
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Assign Trainer
                      </button>
                      <button
                        onClick={() => {
                          const months = prompt('Extend plan by how many months?')
                          if (months) handleExtendPlan(member.id, parseInt(months))
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        Extend Plan
                      </button>
                      <button
                        onClick={() => sendWhatsAppReminder(member)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Send Reminder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
