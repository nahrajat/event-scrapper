import StatusTag from './StatusTag'

const EventCard = ({ event, onTickets }) => {
  return (
    <article className="event-card">
      <div className="event-card__image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} loading="lazy" />
        ) : (
          <div className="event-card__image-placeholder">No image</div>
        )}
      </div>
      <div className="event-card__header">
        <div>
          <h3>{event.title}</h3>
          <p className="muted">{event.dateText || 'Date TBA'}</p>
        </div>
        <StatusTag status={event.status} />
      </div>
      <p className="event-card__venue">
        {event.venueName || 'Venue TBA'}
        {event.address ? ` • ${event.address}` : ''}
      </p>
      <p className="event-card__desc">{event.description || 'Details coming soon.'}</p>
      <div className="event-card__footer">
        <span className="source">Source: {event.sourceName}</span>
        <button type="button" className="primary" onClick={() => onTickets(event)}>
          Get tickets
        </button>
      </div>
    </article>
  )
}

export default EventCard
