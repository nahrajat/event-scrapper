const STATUS_LABELS = {
  new: 'New',
  updated: 'Updated',
  inactive: 'Inactive',
  imported: 'Imported',
}

const StatusTag = ({ status = 'new' }) => {
  return <span className={`status-tag status-tag--${status}`}>{STATUS_LABELS[status] || status}</span>
}

export default StatusTag
