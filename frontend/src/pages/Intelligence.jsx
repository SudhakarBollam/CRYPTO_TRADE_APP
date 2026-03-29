import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../api/client'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Spinner'

export function Intelligence() {
  const toast = useToast()
  const [summary, setSummary] = useState(null)
  const [byAsset, setByAsset] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const [s, a] = await Promise.all([api.get('/analytics/summary'), api.get('/analytics/by-asset')])
        if (!cancelled) {
          setSummary(s.data.data)
          setByAsset(a.data.data)
        }
      } catch (e) {
        if (!cancelled) toast.error(getApiErrorMessage(e))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [toast])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Trade intelligence</h1>
        <p className="muted">Read-only analytics for analysts and administrators.</p>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <section className="grid grid--cards">
            <div className="stat-card">
              <h3>Total trades</h3>
              <p className="stat-card__value">{summary?.totalTrades ?? 0}</p>
            </div>
            <div className="stat-card">
              <h3>Buy volume</h3>
              <p className="stat-card__value">{Number(summary?.totalBuyVolume ?? 0).toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Sell volume</h3>
              <p className="stat-card__value">{Number(summary?.totalSellVolume ?? 0).toLocaleString()}</p>
            </div>
            <div className="stat-card">
              <h3>Unique assets</h3>
              <p className="stat-card__value">{summary?.uniqueAssetCount ?? 0}</p>
            </div>
          </section>

          <div className="card">
            <h2>By asset</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Trades</th>
                    <th>Net qty</th>
                    <th>Avg buy</th>
                    <th>Avg sell</th>
                  </tr>
                </thead>
                <tbody>
                  {byAsset.map((row) => (
                    <tr key={row.asset}>
                      <td>
                        <strong>{row.asset}</strong>
                      </td>
                      <td>{row.trades}</td>
                      <td>{Number(row.netQty).toLocaleString()}</td>
                      <td>{row.avgBuyPrice != null ? Number(row.avgBuyPrice).toFixed(4) : '—'}</td>
                      <td>{row.avgSellPrice != null ? Number(row.avgSellPrice).toFixed(4) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
