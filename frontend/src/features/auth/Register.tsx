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
      await dispatch(register({
        ...formData,
        lastPeriodDate: formData.lastPeriodDate.toISOString().split('T')[0],
      })).unwrap();
      navigate('/calendar');
    } catch (err) {
      // Error is handled by the auth slice
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, lastPeriodDate: date }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-display font-bold text-deep-indigo">
            Create your Flowelle account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-rose-quartz hover:text-opacity-90">
              Sign in
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-quartz focus:border-rose-quartz sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-quartz focus:border-rose-quartz sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-quartz focus:border-rose-quartz sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-quartz focus:border-rose-quartz sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="cycleLength" className="block text-sm font-medium text-gray-700">
                Average Cycle Length (days)
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-quartz focus:border-rose-quartz sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="periodLength" className="block text-sm font-medium text-gray-700">
                Average Period Length (days)
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
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-quartz focus:border-rose-quartz sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="lastPeriodDate" className="block text-sm font-medium text-gray-700">
                First Day of Last Period
              </label>
              <DatePicker
                selected={formData.lastPeriodDate}
                onChange={handleDateChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-rose-quartz focus:border-rose-quartz sm:text-sm"
                maxDate={new Date()}
              />
            </div>

            <div className="flex items-center">
              <input
                id="birthControlUse"
                name="birthControlUse"
                type="checkbox"
                checked={formData.birthControlUse}
                onChange={handleChange}
                className="h-4 w-4 text-rose-quartz focus:ring-rose-quartz border-gray-300 rounded"
              />
              <label htmlFor="birthControlUse" className="ml-2 block text-sm text-gray-700">
                I use birth control
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rose-quartz hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-quartz disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 