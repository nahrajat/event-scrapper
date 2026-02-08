import { useState } from 'react'

const TicketModal = ({ event, onClose, onSubmit }) => {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (eventData) => {
    eventData.preventDefault()
    setError('')
    setLoading(true)
    try {
      await onSubmit({ email, consent })
    } catch (err) {
      setError('Unable to save your details. Please try again.')
      setLoading(false)
      return
    }
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>Get tickets</h2>
            <p className="muted">{event.title}</p>
          </div>
          <button type="button" className="ghost" onClick={onClose}>
            Close
          </button>
        </div>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label>
            Email address
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              required
            />
            I agree to receive updates about this event.
          </label>
          {error ? <p className="error-text">{error}</p> : null}
          <button type="submit" className="primary" disabled={loading}>
            {loading ? 'Saving...' : 'Continue to tickets'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default TicketModal
