import PriorityBadge from './PriorityBadge'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const due = new Date(dateStr)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

function dueDateLabel(dateStr) {
  if (!dateStr) return null
  const days = daysUntil(dateStr)
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, cls: 'text-red-600 font-semibold' }
  if (days === 0) return { text: 'Due today', cls: 'text-orange-600 font-semibold' }
  if (days === 1) return { text: 'Due tomorrow', cls: 'text-orange-500' }
  return { text: `Due in ${days}d`, cls: 'text-slate-500' }
}

export default function TaskCard({ task, onToggle, onDelete }) {
  const label = dueDateLabel(task.dueDate)
  const isDone = task.status === 'done'

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${isDone ? 'bg-slate-50 border-slate-100 opacity-60' : 'bg-white border-slate-200 hover:border-slate-300'}`}>
      <button
        onClick={() => onToggle(task)}
        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isDone ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 hover:border-green-400'}`}
        title={isDone ? 'Mark pending' : 'Mark done'}
      >
        {isDone && (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-medium text-sm truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {task.title}
          </span>
          <PriorityBadge priority={task.priority} />
          <span className={`text-xs px-1.5 py-0.5 rounded ${task.category === 'work' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
            {task.category}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          {label && <span className={`text-xs ${label.cls}`}>{label.text}</span>}
          {task.notes && <span className="text-xs text-slate-400 truncate">{task.notes}</span>}
        </div>
      </div>

      <button
        onClick={() => onDelete(task.id)}
        className="text-slate-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
        title="Delete"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
