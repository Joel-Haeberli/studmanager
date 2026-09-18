import { Link, useLocation, useNavigate } from 'react-router-dom'

export default function Nav() {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  function logout() {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const link = (to, label) => (
    <Link
      to={to}
      className={`text-sm px-3 py-1.5 rounded-lg font-medium transition ${pathname === to ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
    >
      {label}
    </Link>
  )

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
      <div className="flex items-center gap-1">
        <span className="text-lg mr-3">📚</span>
        {link('/dashboard', 'Dashboard')}
        {link('/tasks', 'All Tasks')}
        {link('/schedule', 'Schedule')}
      </div>
      <button onClick={logout} className="text-xs text-slate-400 hover:text-slate-600 transition">
        Sign out
      </button>
    </nav>
  )
}
