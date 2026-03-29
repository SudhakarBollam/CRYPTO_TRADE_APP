import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Spinner'

const ROLES = ['user', 'analyst', 'admin']

export function Admin() {
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function loadUsers() {
    setLoading(true)
    try {
      const res = await api.get('/admin/users')
      setUsers(res.data.data)
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function changeRole(userId, role) {
    setBusyId(userId)
    try {
      await api.patch(`/admin/users/${userId}/role`, { role })
      toast.success('Role updated')
      await loadUsers()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Administration</h1>
        <p className="muted">View accounts and assign roles.</p>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Promote</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.email}</td>
                    <td>{u.name || '—'}</td>
                    <td>
                      <span className="badge">{u.role}</span>
                    </td>
                    <td>
                      <select
                        className="select"
                        value={u.role}
                        disabled={busyId === u._id}
                        onChange={(e) => changeRole(u._id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
