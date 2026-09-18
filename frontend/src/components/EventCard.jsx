const catStyle = {
  work: 'bg-blue-50 border-blue-200 text-blue-800',
  study: 'bg-purple-50 border-purple-200 text-purple-800',
}

const catBadge = {
  work: 'bg-blue-100 text-blue-600',
  study: 'bg-purple-100 text-purple-600',
}

export default function EventCard({ event, onEdit, onDelete }) {
  const timeLabel =
    event.startTime
      ? event.endTime
        ? `${event.startTime} – ${event.endTime}`
        : event.startTime
      : null

  return (
    <div className={`group relative rounded-lg border px-2.5 py-2 text-xs ${catStyle[event.category] ?? catStyle.study}`}>
      <div className="font-medium leading-snug pr-8">{event.title}</div>
      {timeLabel && <div className="mt-0.5 opacity-70">{timeLabel}</div>}
      <div className="mt-1 flex items-center gap-1.5">
        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${catBadge[event.category] ?? catBadge.study}`}>
          {event.category}
        </span>
        {event.type === 'periodic' && (
          <span className="opacity-50 text-xs">↻</span>
        )}
      </div>

      <div className="absolute top-1.5 right-1.5 hidden group-hover:flex gap-0.5">
        <button
          onClick={() => onEdit(event)}
          className="p-0.5 rounded hover:bg-black/10 transition"
          title="Edit"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(event.id)}
          className="p-0.5 rounded hover:bg-black/10 transition"
          title="Delete"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
