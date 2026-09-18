const styles = {
  high: 'bg-red-100 text-red-700 border border-red-200',
  medium: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  low: 'bg-green-100 text-green-700 border border-green-200',
}

export default function PriorityBadge({ priority }) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[priority] ?? styles.medium}`}>
      {priority}
    </span>
  )
}
