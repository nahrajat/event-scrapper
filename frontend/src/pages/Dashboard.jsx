import { useCallback, useEffect, useMemo, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import api from '../api/client'
import StatusTag from '../components/StatusTag'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, loading, loginWithGoogle } = useAuth()
  const [events, setEvents] = useState([])
  const [selected, setSelected] = useState(null)
  const [filters, setFilters] = useState({
    city: 'Sydney',
    q: '',
    start: '',
    end: '',
  })
  const [busy, setBusy] = useState(false)

  const queryParams = useMemo(() => {
    const params = {}
    if (filters.city) params.city = filters.city
    if (filters.q) params.q = filters.q
    if (filters.start) params.start = filters.start
    if (filters.end) params.end = filters.end
    return params
  }, [filters])

  const fetchEvents = useCallback(async () => {
    setBusy(true)
    try {
      const response = await api.get('/admin/events', { params: queryParams })
      setEvents(response.data)
      if (response.data.length) {
        setSelected((prev) => prev || response.data[0])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setBusy(false)
    }
  }, [queryParams])

  useEffect(() => {
    if (!user) return
    fetchEvents()
  }, [user, queryParams, fetchEvents])

  const handleImport = async (event) => {
    const importNotes = window.prompt('Add optional import notes') || ''
    const response = await api.patch(`/admin/events/${event._id}/import`, {
      importNotes,
    })
    setEvents((prev) =>
      prev.map((item) => (item._id === event._id ? response.data : item))
    )
    setSelected(response.data)
  }

  if (loading) {
    return <p className="muted">Checking session...</p>
  }

  if (!user) {
    return (
      <section className="page">
        <div className="card-panel">
          <h2>Admin login</h2>
          <p className="muted">Sign in with Google to access the event dashboard.</p>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse?.credential) {
                loginWithGoogle(credentialResponse.credential)
              }
            }}
          />
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>Event review dashboard</h2>
          <p className="muted">Review fresh scrapes, preview details, and import to the platform.</p>
        </div>
      </div>

      <div className="filters">
        <label>
          City
          <input
            value={filters.city}
            onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
            placeholder="Sydney"
          />
        </label>
        <label>
          Keyword
          <input
            value={filters.q}
            onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
            placeholder="Search title, venue, description"
          />
        </label>
        <label>
          Start date
          <input
            type="date"
            value={filters.start}
            onChange={(e) => setFilters((prev) => ({ ...prev, start: e.target.value }))}
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={filters.end}
            onChange={(e) => setFilters((prev) => ({ ...prev, end: e.target.value }))}
          />
        </label>
        <button type="button" className="ghost" onClick={fetchEvents}>
          Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="table-panel">
          {busy ? <p className="muted">Loading events...</p> : null}
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event._id}
                  className={selected?._id === event._id ? 'selected' : ''}
                  onClick={() => setSelected(event)}
                >
                  <td>{event.title}</td>
                  <td>{event.dateText || 'TBA'}</td>
                  <td>{event.venueName || 'TBA'}</td>
                  <td>
                    <StatusTag status={event.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="primary small"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleImport(event)
                      }}
                      disabled={event.status === 'imported'}
                    >
                      {event.status === 'imported' ? 'Imported' : 'Import'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="preview-panel">
          {selected ? (
            <>
              <div className="preview-header">
                <h3>{selected.title}</h3>
                <StatusTag status={selected.status} />
              </div>
              <p className="muted">{selected.dateText || 'Date TBA'}</p>
              <p>{selected.venueName || 'Venue TBA'}</p>
              <p className="muted">{selected.address}</p>
              <p className="preview-desc">{selected.description}</p>
              <div className="preview-meta">
                <span>Source: {selected.sourceName}</span>
                <a href={selected.sourceUrl} target="_blank" rel="noreferrer">
                  View source
                </a>
              </div>
            </>
          ) : (
            <p className="muted">Select an event to preview details.</p>
          )}
        </aside>
      </div>
    </section>
  )
}

export default Dashboard
