import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store';
import { register } from '../../store/slices/authSlice';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    cycleLength: 28,
    periodLength: 5,
    lastPeriodDate: new Date(),
    birthControlUse: false,
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(
        register({
          ...formData,
          lastPeriodDate: formData.lastPeriodDate.toISOString().split('T')[0],
        })
      ).unwrap();
      navigate('/today');
    } catch {
      // Error is handled by slice
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData((prev) => ({ ...prev, lastPeriodDate: date }));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-10 sm:px-8">
      <div className="flow-card w-full max-w-4xl p-7 sm:p-9">
        <p className="card-label">Create account</p>
        <h2 className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl">Set up private tracking</h2>
        <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-muted">
          Start with your usual cycle settings. AI, voice, analytics, export, and deletion controls live in Privacy Center.
        </p>
        <p className="mt-2 text-sm text-muted">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-rose-quartz hover:brightness-110">
            Sign in
          </Link>
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-semibold text-muted">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="flow-input"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="text-sm font-semibold text-muted">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="flow-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-semibold text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="flow-input"
              placeholder="name@example.com"
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
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className="flow-input"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="cycleLength" className="text-sm font-semibold text-muted">
                Cycle length (days)
              </label>
              <input
                id="cycleLength"
                name="cycleLength"
                type="number"
                min="21"
                max="35"
                required
                value={formData.cycleLength}
                onChange={handleChange}
                className="flow-input"
              />
            </div>

            <div>
              <label htmlFor="periodLength" className="text-sm font-semibold text-muted">
                Period length (days)
              </label>
              <input
                id="periodLength"
                name="periodLength"
                type="number"
                min="2"
                max="10"
                required
                value={formData.periodLength}
                onChange={handleChange}
                className="flow-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="lastPeriodDate" className="text-sm font-semibold text-muted">
              First day of last period
            </label>
            <DatePicker
              selected={formData.lastPeriodDate}
              onChange={handleDateChange}
              className="flow-input"
              maxDate={new Date()}
            />
          </div>

          <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line bg-white px-4 py-3 text-sm font-semibold text-ink">
            <input
              id="birthControlUse"
              name="birthControlUse"
              type="checkbox"
              checked={formData.birthControlUse}
              onChange={handleChange}
              className="h-4 w-4 rounded border-line text-rose-quartz focus:ring-rose-quartz"
            />
            I use birth control
          </label>

          <button type="submit" disabled={isLoading} className="flow-btn-primary w-full">
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
