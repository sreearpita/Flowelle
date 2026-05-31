import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { login } from '../../store/slices/authSlice';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(login({ email, password })).unwrap();
      navigate('/today');
    } catch {
      // Error handled in slice
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10 sm:px-8">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flow-card hidden p-8 lg:block">
          <p className="card-label">Flowelle</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight text-ink">Private cycle tracking with clear uncertainty.</h1>
          <p className="mt-4 text-base font-medium leading-7 text-muted">
            Log facts, understand predictions, and control AI, voice, export, and deletion from one privacy-first workspace.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-soft-cyan p-4">
              <p className="text-2xl font-extrabold text-clinical-blue">Facts</p>
              <p className="text-sm font-semibold text-muted">Logged entries</p>
            </div>
            <div className="rounded-lg bg-soft-lemon p-4">
              <p className="text-2xl font-extrabold text-sunrise">Est.</p>
              <p className="text-sm font-semibold text-muted">Predictions</p>
            </div>
            <div className="rounded-lg bg-mist p-4">
              <p className="text-2xl font-extrabold text-sage-green">You</p>
              <p className="text-sm font-semibold text-muted">Data control</p>
            </div>
          </div>
        </section>

        <section className="flow-card p-7 sm:p-9">
          <p className="card-label">Welcome back</p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink">Sign in to Flowelle</h2>
          <p className="mt-2 text-sm text-muted">
            New here?{' '}
            <Link to="/register" className="font-bold text-rose-quartz hover:brightness-110">
              Create your account
            </Link>
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email-address" className="text-sm font-semibold text-muted">
                Email
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flow-input"
                placeholder="Email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-semibold text-muted">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flow-input"
                placeholder="Password"
              />
            </div>

            <button type="submit" disabled={isLoading} className="flow-btn-primary w-full">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Login;
