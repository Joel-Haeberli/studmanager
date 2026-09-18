import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token } = await api.login(password)
      localStorage.setItem('token', token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message === 'Invalid password' ? 'Wrong password.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl mb-2">📚</div>
          <h1 className="text-xl font-semibold text-slate-800">StudManager</h1>
          <p className="text-sm text-slate-500 mt-1">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-slate-800 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            {loading ? 'Checking…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
