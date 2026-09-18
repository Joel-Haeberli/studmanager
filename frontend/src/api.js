const BASE = '/api'

function headers() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function handle(res) {
  if (res.status === 401) {
    localStorage.removeItem('token')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  login: (password) =>
    fetch(`${BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }).then(handle),

  getTasks: () =>
    fetch(`${BASE}/tasks`, { headers: headers() }).then(handle),

  createTask: (task) =>
    fetch(`${BASE}/tasks`, { method: 'POST', headers: headers(), body: JSON.stringify(task) }).then(handle),

  updateTask: (id, changes) =>
    fetch(`${BASE}/tasks/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(changes) }).then(handle),

  deleteTask: (id) =>
    fetch(`${BASE}/tasks/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

  getEvents: () =>
    fetch(`${BASE}/events`, { headers: headers() }).then(handle),

  createEvent: (event) =>
    fetch(`${BASE}/events`, { method: 'POST', headers: headers(), body: JSON.stringify(event) }).then(handle),

  updateEvent: (id, changes) =>
    fetch(`${BASE}/events/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(changes) }).then(handle),

  deleteEvent: (id) =>
    fetch(`${BASE}/events/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
}
