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
      navigate('/calendar');
    } catch {
      // Error handled in slice
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div className="grid w-full max-w-5xl gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="bloom-card hidden p-8 lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Flowelle concept</p>
          <h1 className="bloom-title mt-3 text-4xl">Understand your cycle with calm, clear visuals.</h1>
          <p className="mt-4 text-base text-muted">
            Track daily changes, preview upcoming events, and log symptoms in a dashboard designed for clarity.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="rounded-2xl bg-soft-peach p-4 text-center">
              <p className="font-display text-2xl text-rose-quartz">Day</p>
              <p className="text-sm font-semibold text-muted">Cycle timeline</p>
            </div>
            <div className="rounded-2xl bg-soft-lilac p-4 text-center">
              <p className="font-display text-2xl text-[#9b5cf5]">LH</p>
              <p className="text-sm font-semibold text-muted">Hormone clues</p>
            </div>
            <div className="rounded-2xl bg-soft-lemon p-4 text-center">
              <p className="font-display text-2xl text-sunrise">Plan</p>
              <p className="text-sm font-semibold text-muted">Phase insights</p>
            </div>
          </div>
        </section>

        <section className="bloom-card p-7 sm:p-9 animate-fadeInUp">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Welcome back</p>
          <h2 className="bloom-title mt-2 text-[2rem]">Sign in to Flowelle</h2>
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
