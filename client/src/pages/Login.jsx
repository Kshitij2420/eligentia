import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Target className="text-signal" size={26} />
          <span className="font-display text-2xl tracking-tight">ELIGENTIA</span>
        </div>

        <div className="border border-line bg-surface p-8">
          <h1 className="font-display text-xl text-paper mb-1">Welcome back</h1>
          <p className="text-fog text-sm mb-6">Sign in to check your fit and find your gaps.</p>

          {error && (
            <div className="mb-4 border border-blocked/40 text-blocked text-sm px-3 py-2">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-fog mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-ink border border-line px-3 py-2.5 text-paper text-sm focus:outline-none focus:border-signal"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-fog mb-1.5">Password</label>
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-ink border border-line px-3 py-2.5 text-paper text-sm focus:outline-none focus:border-signal"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-signal text-ink font-medium py-2.5 text-sm hover:bg-signal-deep transition-colors disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-fog mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-signal hover:underline">
              Register
            </Link>
          </p>
        </div>

        <p className="text-xs text-fog mt-6 text-center">
          Demo admin: admin@eligentia.com / Admin@123
        </p>
      </div>
    </div>
  );
}
