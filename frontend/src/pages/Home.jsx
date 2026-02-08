import { useEffect, useState } from 'react'
import api from '../api/client'
import EventCard from '../components/EventCard'
import TicketModal from '../components/TicketModal'

const Home = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEvent, setActiveEvent] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('/events', { params: { city: 'Sydney' } })
        setEvents(response.data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const handleSubmitLead = async ({ email, consent }) => {
    if (!activeEvent) return
    await api.post('/leads', {
      email,
      consent,
      eventId: activeEvent._id,
    })
    window.location.href = activeEvent.sourceUrl
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h2>What’s on in Sydney</h2>
          <p className="muted">Auto-scraped events with fresh updates every few hours.</p>
        </div>
      </div>

      {loading ? (
        <p className="muted">Loading events...</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard key={event._id} event={event} onTickets={setActiveEvent} />
          ))}
        </div>
      )}

      {activeEvent ? (
        <TicketModal
          event={activeEvent}
          onClose={() => setActiveEvent(null)}
          onSubmit={handleSubmitLead}
        />
      ) : null}
    </section>
  )
}

export default Home
