import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <Target className="text-signal" size={26} />
          <span className="font-display text-2xl tracking-tight">ELIGENTIA</span>
        </div>

        <div className="border border-line bg-surface p-8">
          <h1 className="font-display text-xl text-paper mb-1">Create your account</h1>
          <p className="text-fog text-sm mb-6">Know your fit. Find your gaps. Build your future.</p>

          {error && (
            <div className="mb-4 border border-blocked/40 text-blocked text-sm px-3 py-2">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-fog mb-1.5">Full name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-ink border border-line px-3 py-2.5 text-paper text-sm focus:outline-none focus:border-signal"
                placeholder="Your name"
              />
            </div>
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
                placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label className="block text-sm text-fog mb-1.5">Confirm password</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full bg-ink border border-line px-3 py-2.5 text-paper text-sm focus:outline-none focus:border-signal"
                placeholder="Re-enter password"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-signal text-ink font-medium py-2.5 text-sm hover:bg-signal-deep transition-colors disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-fog mt-6 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-signal hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
