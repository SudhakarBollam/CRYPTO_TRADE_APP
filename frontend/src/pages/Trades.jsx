import { useEffect, useMemo, useState } from 'react'
import { api, getApiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Spinner'

const emptyForm = {
  asset: '',
  type: 'BUY',
  price: '',
  quantity: '',
  timestamp: '',
  note: '',
}

export function Trades() {
  const { user } = useAuth()
  const toast = useToast()
  const [rows, setRows] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({ asset: '', type: '', userId: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [panelOpen, setPanelOpen] = useState(false)

  const canWrite = user.role === 'user' || user.role === 'admin'
  const showOwnerFilter = user.role === 'admin' || user.role === 'analyst'

  const queryParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      ...(filters.asset ? { asset: filters.asset } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(showOwnerFilter && filters.userId ? { userId: filters.userId } : {}),
    }),
    [pagination.page, pagination.limit, filters, showOwnerFilter]
  )

  async function fetchTrades() {
    setLoading(true)
    try {
      const res = await api.get('/trades', { params: queryParams })
      setRows(res.data.data)
      setPagination((p) => ({ ...p, ...res.data.pagination }))
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrades()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams.page, queryParams.limit, queryParams.asset, queryParams.type, queryParams.userId])

  function openCreate() {
    setEditingId(null)
    setForm({ ...emptyForm, timestamp: new Date().toISOString().slice(0, 16) })
  }

  function openEdit(t) {
    setEditingId(t._id)
    setPanelOpen(true)
    setForm({
      asset: t.asset,
      type: t.type,
      price: String(t.price),
      quantity: String(t.quantity),
      timestamp: t.timestamp ? t.timestamp.slice(0, 16) : '',
      note: t.note || '',
    })
  }

  async function submitForm(e) {
    e.preventDefault()
    if (!canWrite) return
    setSaving(true)
    try {
      const payload = {
        asset: form.asset.trim().toUpperCase(),
        type: form.type,
        price: Number(form.price),
        quantity: Number(form.quantity),
        note: form.note.trim() || undefined,
        ...(form.timestamp ? { timestamp: new Date(form.timestamp).toISOString() } : {}),
      }
      if (editingId) {
        await api.put(`/trades/${editingId}`, payload)
        toast.success('Trade updated')
      } else {
        await api.post('/trades', payload)
        toast.success('Trade created')
      }
      setEditingId(null)
      setForm(emptyForm)
      setPanelOpen(false)
      await fetchTrades()
    } catch (err) {
      toast.error(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function removeTrade(id) {
    if (!window.confirm('Delete this trade?')) return
    try {
      await api.delete(`/trades/${id}`)
      toast.success('Trade deleted')
      await fetchTrades()
    } catch (e) {
      toast.error(getApiErrorMessage(e))
    }
  }

  return (
    <div className="page">
      <div className="page-header row-between">
        <div>
          <h1>Trades</h1>
          <p className="muted">Journal, filter, and manage activity.</p>
        </div>
        {canWrite && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              openCreate()
              setPanelOpen(true)
            }}
          >
            New trade
          </button>
        )}
      </div>

      <div className="card filters">
        <div className="filters__row">
          <label className="field field--inline">
            <span>Asset</span>
            <input
              placeholder="BTC"
              value={filters.asset}
              onChange={(e) => {
                setFilters((f) => ({ ...f, asset: e.target.value }))
                setPagination((p) => ({ ...p, page: 1 }))
              }}
            />
          </label>
          <label className="field field--inline">
            <span>Type</span>
            <select
              value={filters.type}
              onChange={(e) => {
                setFilters((f) => ({ ...f, type: e.target.value }))
                setPagination((p) => ({ ...p, page: 1 }))
              }}
            >
              <option value="">All</option>
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </label>
          {showOwnerFilter && (
            <label className="field field--inline">
              <span>User id</span>
              <input
                placeholder="Mongo ObjectId"
                value={filters.userId}
                onChange={(e) => {
                  setFilters((f) => ({ ...f, userId: e.target.value.trim() }))
                  setPagination((p) => ({ ...p, page: 1 }))
                }}
              />
            </label>
          )}
          <label className="field field--inline">
            <span>Per page</span>
            <select
              value={pagination.limit}
              onChange={(e) =>
                setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))
              }
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {canWrite && panelOpen && (
        <div className="card">
          <h2>{editingId ? 'Edit trade' : 'New trade'}</h2>
          <form className="form form--grid" onSubmit={submitForm}>
            <label className="field">
              <span>Asset</span>
              <input required value={form.asset} onChange={(e) => setForm({ ...form, asset: e.target.value })} />
            </label>
            <label className="field">
              <span>Type</span>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </label>
            <label className="field">
              <span>Price</span>
              <input
                required
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Quantity</span>
              <input
                required
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Time</span>
              <input
                type="datetime-local"
                value={form.timestamp}
                onChange={(e) => setForm({ ...form, timestamp: e.target.value })}
              />
            </label>
            <label className="field field--full">
              <span>Note</span>
              <textarea
                rows={2}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <div className="form__actions field--full">
              <button type="submit" className="btn btn--primary" disabled={saving}>
                {saving ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                  setPanelOpen(false)
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>When</th>
                  <th>Owner</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <strong>{t.asset}</strong>
                    </td>
                    <td>
                      <span className={`pill pill--${t.type === 'BUY' ? 'buy' : 'sell'}`}>{t.type}</span>
                    </td>
                    <td>{Number(t.price).toLocaleString()}</td>
                    <td>{Number(t.quantity).toLocaleString()}</td>
                    <td>{new Date(t.timestamp).toLocaleString()}</td>
                    <td className="muted small">{t.user?.email || '—'}</td>
                    <td className="table-actions">
                      {canWrite && (
                        <button type="button" className="btn btn--ghost btn--sm" onClick={() => openEdit(t)}>
                          Edit
                        </button>
                      )}
                      {canWrite && (
                        <button type="button" className="btn btn--danger btn--sm" onClick={() => removeTrade(t._id)}>
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={pagination.page <= 1}
              onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
            >
              Previous
            </button>
            <span className="muted">
              Page {pagination.page} of {Math.max(pagination.totalPages, 1)} ({pagination.total} total)
            </span>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
