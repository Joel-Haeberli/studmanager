import { useEffect, useState } from 'react'
import { api } from '../api'
import EventCard from '../components/EventCard'
import Nav from '../components/Nav'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getMondayOfWeek(offset = 0) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dow = today.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  const mon = new Date(today)
  mon.setDate(today.getDate() + diff + offset * 7)
  return mon
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function toYMD(date) {
  return date.toISOString().slice(0, 10)
}

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const EMPTY_FORM = {
  title: '',
  type: 'one-time',
  category: 'study',
  date: '',
  weekdays: [],
  startTime: '',
  endTime: '',
  endDate: '',
  notes: '',
}

export default function Schedule() {
  const [events, setEvents] = useState([])
  const [weekOffset, setWeekOffset] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const monday = getMondayOfWeek(weekOffset)
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const todayYMD = toYMD(new Date())

  useEffect(() => { load() }, [])

  async function load() {
    const data = await api.getEvents()
    setEvents(data)
  }

  async function save(e) {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        category: form.category,
        startTime: form.startTime || null,
        endTime: form.endTime || null,
        notes: form.notes,
        ...(form.type === 'one-time'
          ? { date: form.date }
          : { weekdays: form.weekdays, endDate: form.endDate || null }),
      }
      if (editing) {
        const updated = await api.updateEvent(editing, payload)
        setEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev))
      } else {
        const created = await api.createEvent(payload)
        setEvents(prev => [...prev, created])
      }
      resetForm()
    } finally {
      setSaving(false)
    }
  }

  async function remove(id) {
    await api.deleteEvent(id)
    setEvents(prev => prev.filter(ev => ev.id !== id))
  }

  function startEdit(event) {
    setForm({
      title: event.title,
      type: event.type,
      category: event.category,
      date: event.date || '',
      weekdays: event.weekdays || [],
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      endDate: event.endDate || '',
      notes: event.notes || '',
    })
    setEditing(event.id)
    setShowForm(true)
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditing(null)
    setShowForm(false)
  }

  function toggleWeekday(day) {
    setForm(f => ({
      ...f,
      weekdays: f.weekdays.includes(day)
        ? f.weekdays.filter(d => d !== day)
        : [...f.weekdays, day],
    }))
  }

  function eventsForDay(date) {
    const ymd = toYMD(date)
    const jsDay = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat — same encoding stored in weekdays[]

    return events
      .filter(ev => {
        if (ev.type === 'one-time') return ev.date === ymd
        if (!ev.weekdays || !ev.weekdays.includes(jsDay)) return false
        if (ev.endDate && ymd > ev.endDate) return false
        return true
      })
      .sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''))
  }

  const weekLabel = `${formatDate(weekDates[0])} – ${formatDate(weekDates[6])}, ${weekDates[0].getFullYear()}`

  return (
    <div className="min-h-screen bg-slate-50">
      <Nav />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setWeekOffset(o => o - 1)}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition text-slate-600"
              title="Previous week"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-slate-700 min-w-52 text-center">{weekLabel}</span>
            <button
              onClick={() => setWeekOffset(o => o + 1)}
              className="p-1.5 rounded-lg hover:bg-slate-200 transition text-slate-600"
              title="Next week"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-xs text-indigo-600 hover:text-indigo-800 transition"
              >
                Today
              </button>
            )}
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(v => !v) }}
            className="flex items-center gap-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium transition"
          >
            <span className="text-base leading-none">+</span> Add event
          </button>
        </div>

        {/* Event form */}
        {showForm && (
          <form onSubmit={save} className="bg-white border border-indigo-200 rounded-xl p-4 mb-4 space-y-3">
            <h2 className="text-sm font-semibold text-slate-700">{editing ? 'Edit event' : 'New event'}</h2>

            <input
              autoFocus
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Event title *"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />

            {/* Type toggle */}
            <div className="flex gap-1">
              {['one-time', 'periodic'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`text-sm px-3 py-1 rounded-lg font-medium transition capitalize ${form.type === t ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {t === 'one-time' ? 'One-time' : 'Recurring'}
                </button>
              ))}
            </div>

            {form.type === 'one-time' ? (
              <div>
                <label className="text-xs text-slate-500 block mb-1">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  className="text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 w-full sm:w-auto"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-slate-500 block">Repeats on *</label>
                <div className="flex gap-1.5 flex-wrap">
                  {DAYS.map((day, i) => {
                    // store weekdays as JS numbers: Mon=1,Tue=2,...Sat=6,Sun=0
                    const jsDay = i === 6 ? 0 : i + 1
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleWeekday(jsDay)}
                        className={`w-10 h-8 text-xs rounded-lg font-medium transition ${form.weekdays.includes(jsDay) ? 'bg-indigo-600 text-white' : 'border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
                <div>
                  <label className="text-xs text-slate-500 block mb-1">End date (optional)</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 w-full sm:w-auto"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Start</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="text-sm px-2 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">End</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="text-sm px-2 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 w-full"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 block mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="text-sm px-2 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 w-full"
                >
                  <option value="study">Study</option>
                  <option value="work">Work</option>
                </select>
              </div>
            </div>

            <input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="w-full text-sm px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />

            <div className="flex gap-2 justify-end">
              <button type="button" onClick={resetForm} className="text-sm px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-700">Cancel</button>
              <button
                type="submit"
                disabled={saving || !form.title.trim() || (form.type === 'one-time' ? !form.date : !form.weekdays.length)}
                className="text-sm px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 font-medium transition"
              >
                {saving ? 'Saving…' : editing ? 'Update' : 'Add'}
              </button>
            </div>
          </form>
        )}

        {/* Week grid */}
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date, i) => {
            const ymd = toYMD(date)
            const isToday = ymd === todayYMD
            const dayEvents = eventsForDay(date)

            return (
              <div key={ymd} className={`rounded-xl border overflow-hidden ${isToday ? 'border-indigo-300 shadow-sm' : 'border-slate-200'}`}>
                <div className={`px-2 py-2 text-center border-b ${isToday ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white border-slate-100 text-slate-600'}`}>
                  <div className="text-xs font-semibold">{DAYS[i]}</div>
                  <div className={`text-xs mt-0.5 ${isToday ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {formatDate(date)}
                  </div>
                </div>
                <div className="bg-white p-1.5 space-y-1.5 min-h-20">
                  {dayEvents.length === 0
                    ? null
                    : dayEvents.map(ev => (
                      <EventCard key={ev.id + ymd} event={ev} onEdit={startEdit} onDelete={remove} />
                    ))
                  }
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
