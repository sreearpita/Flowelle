import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  cycleLength: number;
  periodLength: number;
  birthControlUse: boolean;
}

const Profile: React.FC = () => {
  const { user, isLoading, error } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    cycleLength: 28,
    periodLength: 5,
    birthControlUse: false,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        cycleLength: user.cycleLength || 28,
        periodLength: user.periodLength || 5,
        birthControlUse: user.birthControlUse || false,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(updateProfile(formData)).unwrap();
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-quartz"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-display font-bold text-deep-indigo mb-8">Your Profile</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                disabled={!isEditing}
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz disabled:bg-gray-100"
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
                disabled={!isEditing}
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz disabled:bg-gray-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz disabled:bg-gray-100"
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
                disabled={!isEditing}
                value={formData.cycleLength}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz disabled:bg-gray-100"
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
                disabled={!isEditing}
                value={formData.periodLength}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-quartz focus:ring-rose-quartz disabled:bg-gray-100"
              />
            </div>

            <div className="flex items-center">
              <input
                id="birthControlUse"
                name="birthControlUse"
                type="checkbox"
                disabled={!isEditing}
                checked={formData.birthControlUse}
                onChange={handleChange}
                className="h-4 w-4 text-rose-quartz focus:ring-rose-quartz border-gray-300 rounded disabled:bg-gray-100"
              />
              <label htmlFor="birthControlUse" className="ml-2 block text-sm text-gray-700">
                I use birth control
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-quartz rounded-md hover:bg-opacity-90"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-quartz rounded-md hover:bg-opacity-90"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile; 