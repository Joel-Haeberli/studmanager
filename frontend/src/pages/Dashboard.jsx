import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav'
import TaskCard from '../components/TaskCard'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

function daysUntil(dateStr) {
  if (!dateStr) return Infinity
  const due = new Date(dateStr)
  due.setHours(0, 0, 0, 0)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((due - today) / 86400000)
}

const EMPTY_FORM = { title: '', category: 'study', dueDate: '', priority: 'medium', notes: '' }

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState(EMPTY_FORM)
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    const data = await api.getTasks()
    setTasks(data)
  }

  async function toggle(task) {
    const updated = await api.updateTask(task.id, { status: task.status === 'done' ? 'pending' : 'done' })
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  async function remove(id) {
    await api.deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function quickAdd(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const task = await api.createTask(form)
      setTasks(prev => [task, ...prev])
      setForm(EMPTY_FORM)
      setAdding(false)
    } finally {
      setSaving(false)
    }
  }

  const visible = filter === 'all' ? tasks : tasks.filter(t => t.category === filter)
  const pending = visible.filter(t => t.status === 'pending')

  const upcoming = [...pending]
    .filter(t => t.dueDate && daysUntil(t.dueDate) <= 14)
    .sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate))

  const byPriority = [...pending].sort((a, b) => {
    const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    return pd !== 0 ? pd : daysUntil(a.dueDate) - daysUntil(b.dueDate)
  })

  const doneToday = tasks.filter(t => t.status === 'done').length
  const overdueCount = pending.filter(t => t.dueDate && daysUntil(t.dueDate) < 0).length

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Stat label="Pending" value={pending.length} color="text-slate-700" />
          <Stat label="Overdue" value={overdueCount} color={overdueCount > 0 ? 'text-red-600' : 'text-slate-700'} />
          <Stat label="Completed" value={doneToday} color="text-green-600" />
        </div>

        {/* Filter + Add */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1">
            {['all', 'work', 'study'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-sm px-3 py-1 rounded-lg capitalize font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={() => setAdding(v => !v)}
            className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
          >
            <span className="text-base leading-none">+</span> Add task
          </button>
        </div>

        {/* Quick-add form */}
        {adding && (
          <form onSubmit={quickAdd} className="bg-white border border-indigo-200 rounded-xl p-4 mb-4 space-y-3">
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task title"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <select
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="text-sm px-2 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400"
              >
                <option value="study">Study</option>
                <option value="work">Work</option>
              </select>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="text-sm px-2 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="text-sm px-2 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 col-span-2"
              />
            </div>
            <input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => setAdding(false)} className="text-sm px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700">Cancel</button>
              <button type="submit" disabled={saving || !form.title.trim()} className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium transition">
                {saving ? 'Saving…' : 'Add'}
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming */}
          <Panel title="Upcoming (14 days)" count={upcoming.length}>
            {upcoming.length === 0
              ? <Empty text="No upcoming deadlines" />
              : upcoming.map(t => <TaskCard key={t.id} task={t} onToggle={toggle} onDelete={remove} />)
            }
          </Panel>

          {/* By Priority */}
          <Panel title="By Priority" count={byPriority.length}>
            {byPriority.length === 0
              ? <Empty text="No pending tasks" />
              : byPriority.map(t => <TaskCard key={t.id} task={t} onToggle={toggle} onDelete={remove} />)
            }
          </Panel>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
    </div>
  )
}

function Panel({ title, count, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-sm text-slate-700">{title}</h2>
        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="p-3 space-y-2 max-h-96 overflow-y-auto">{children}</div>
    </div>
  )
}

function Empty({ text }) {
  return <p className="text-sm text-slate-400 text-center py-6">{text}</p>
}
