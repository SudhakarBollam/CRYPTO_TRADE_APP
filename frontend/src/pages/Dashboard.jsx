import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Spinner } from '../components/Spinner'

export function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const [portfolio, setPortfolio] = useState(null)
  const [prices, setPrices] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      try {
        const ids = 'bitcoin,ethereum,solana,binancecoin,cardano'
        const [pRes, mRes] = await Promise.all([
          user.role === 'analyst'
            ? Promise.resolve({ data: { data: [] } })
            : api.get('/portfolio'),
          api.get('/market/prices', { params: { ids } }),
        ])
        if (!cancelled) {
          if (user.role !== 'analyst') setPortfolio(pRes.data.data)
          setPrices(mRes.data.data)
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
  }, [user.role, toast])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="muted">Overview tailored to your role.</p>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <>
          {user.role === 'analyst' && (
            <div className="card">
              <h2>Analyst workspace</h2>
              <p className="muted">
                Portfolio totals are reserved for traders. Use <strong>Intelligence</strong> for read-only analytics
                across all trades.
              </p>
            </div>
          )}

          {user.role !== 'analyst' && (
            <section className="grid grid--cards">
              <div className="stat-card">
                <h3>Positions</h3>
                <p className="stat-card__value">{portfolio?.length ?? 0}</p>
                <p className="muted small">Distinct assets in your book</p>
              </div>
              <div className="stat-card">
                <h3>Live markets</h3>
                <p className="stat-card__value">{prices ? Object.keys(prices).length : 0}</p>
                <p className="muted small">CoinGecko spot (USD)</p>
              </div>
            </section>
          )}

          {user.role !== 'analyst' && portfolio && portfolio.length > 0 && (
            <div className="card">
              <h2>Portfolio by asset</h2>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Net qty</th>
                      <th>Trades</th>
                      <th>Buy notional</th>
                      <th>Sell notional</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((row) => (
                      <tr key={row.asset}>
                        <td>
                          <strong>{row.asset}</strong>
                        </td>
                        <td>{Number(row.netQuantity).toLocaleString()}</td>
                        <td>{row.tradeCount}</td>
                        <td>{Number(row.buyNotional).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                        <td>{Number(row.sellNotional).toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {prices && (
            <div className="card">
              <h2>Spot prices</h2>
              <div className="price-grid">
                {Object.entries(prices).map(([id, v]) => (
                  <div key={id} className="price-pill">
                    <span className="price-pill__id">{id}</span>
                    <span className="price-pill__usd">${v.usd?.toLocaleString()}</span>
                    {v.usd_24h_change != null && (
                      <span className={v.usd_24h_change >= 0 ? 'pos' : 'neg'}>
                        {v.usd_24h_change.toFixed(2)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
