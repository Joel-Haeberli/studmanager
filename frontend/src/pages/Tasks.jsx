import { useEffect, useState } from 'react'
import { api } from '../api'
import Nav from '../components/Nav'
import PriorityBadge from '../components/PriorityBadge'
import TaskCard from '../components/TaskCard'

const EMPTY_FORM = { title: '', category: 'study', dueDate: '', priority: 'medium', notes: '', status: 'pending' }

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState({ category: 'all', status: 'pending', search: '' })
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)

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

  async function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      if (editing) {
        const updated = await api.updateTask(editing, form)
        setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
      } else {
        const task = await api.createTask(form)
        setTasks(prev => [task, ...prev])
      }
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  function startEdit(task) {
    setForm({ title: task.title, category: task.category, dueDate: task.dueDate || '', priority: task.priority, notes: task.notes || '', status: task.status })
    setEditing(task.id)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(false)
  }

  const filtered = tasks.filter(t => {
    if (filter.category !== 'all' && t.category !== filter.category) return false
    if (filter.status !== 'all' && t.status !== filter.status) return false
    if (filter.search && !t.title.toLowerCase().includes(filter.search.toLowerCase())) return false
    return true
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold text-slate-800">All Tasks</h1>
          <button
            onClick={() => { resetForm(); setShowForm(v => !v) }}
            className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
          >
            <span className="text-base leading-none">+</span> New task
          </button>
        </div>

        {showForm && (
          <form onSubmit={save} className="bg-white border border-indigo-200 rounded-xl p-4 mb-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">{editing ? 'Edit task' : 'New task'}</h2>
            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Task title *"
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
            {editing && (
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="text-sm px-2 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 w-full"
              >
                <option value="pending">Pending</option>
                <option value="done">Done</option>
              </select>
            )}
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="text-sm px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700">Cancel</button>
              <button type="submit" disabled={saving || !form.title.trim()} className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium transition">
                {saving ? 'Saving…' : editing ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <input
            value={filter.search}
            onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
            placeholder="Search…"
            className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 flex-1 min-w-32 bg-white"
          />
          <div className="flex gap-1">
            {['all', 'work', 'study'].map(c => (
              <button key={c} onClick={() => setFilter(f => ({ ...f, category: c }))}
                className={`text-sm px-3 py-1 rounded-lg capitalize font-medium transition ${filter.category === c ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {['all', 'pending', 'done'].map(s => (
              <button key={s} onClick={() => setFilter(f => ({ ...f, status: s }))}
                className={`text-sm px-3 py-1 rounded-lg capitalize font-medium transition ${filter.status === s ? 'bg-slate-700 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.length === 0
            ? <p className="text-sm text-slate-400 text-center py-12">No tasks found</p>
            : filtered.map(t => (
              <div key={t.id} className="group relative">
                <TaskCard task={t} onToggle={toggle} onDelete={remove} />
                <button
                  onClick={() => startEdit(t)}
                  className="absolute right-8 top-3 text-xs text-slate-300 group-hover:text-slate-500 transition"
                  title="Edit"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            ))
          }
        </div>

        {filtered.length > 0 && (
          <p className="text-xs text-slate-400 text-center mt-4">{filtered.length} task{filtered.length !== 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  )
}
