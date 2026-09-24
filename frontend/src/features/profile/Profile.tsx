import React, { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../store';
import { updateProfile } from '../../store/slices/authSlice';
import authService from '../../services/auth.service';
import { WellnessProfile } from '../../types/auth';

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
  const [wellness, setWellness] = useState<WellnessProfile>({
    dietaryPattern: null, activityLevel: null, allergens: [], intolerances: [], nutritionGoals: [],
    preferredActivities: [], exerciseGoals: [], exerciseLimitations: [],
  });
  const [wellnessNotice, setWellnessNotice] = useState('');
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

  useEffect(() => {
    authService.getWellnessProfile().then(setWellness).catch(() => setWellnessNotice('Wellness preferences are unavailable.'));
  }, []);

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
    } catch {
      // Error handled by slice
    }
  };

  const toggleWellness = (field: keyof WellnessProfile, value: string) => {
    const current = wellness[field];
    if (!Array.isArray(current)) return;
    setWellness({ ...wellness, [field]: current.includes(value) ? current.filter(item => item !== value) : [...current, value] });
  };

  const saveWellness = async () => {
    try { setWellness(await authService.updateWellnessProfile(wellness)); setWellnessNotice('Wellness preferences saved.'); }
    catch { setWellnessNotice('Unable to save wellness preferences.'); }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bloom-card flex items-center gap-3 px-6 py-4 text-ink">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-quartz border-t-transparent"></div>
          <span className="text-sm font-semibold uppercase tracking-wider">Loading profile</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <div className="bloom-card p-10 text-center text-lg text-muted">Please log in to view your profile.</div>;
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      <section className="bloom-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Your profile</p>
        <h1 className="bloom-title mt-2">Manage preferences</h1>
      </section>

      <section className="bloom-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">AI personalization</p>
        <h2 className="bloom-title mt-2 text-2xl">Nutrition and movement preferences</h2>
        <p className="mt-2 text-sm text-muted">These structured preferences are shared only when AI coaching is enabled.</p>
        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          <label className="text-sm font-semibold text-muted">Dietary pattern
            <select className="flow-input mt-2" value={wellness.dietaryPattern || ''} onChange={e => setWellness({ ...wellness, dietaryPattern: e.target.value || null })}>
              <option value="">Not declared</option><option>OMNIVORE</option><option>PESCATARIAN</option><option>VEGETARIAN</option><option>VEGAN</option><option>OTHER</option><option>PREFER_NOT_TO_SAY</option>
            </select>
          </label>
          <label className="text-sm font-semibold text-muted">Activity level
            <select className="flow-input mt-2" value={wellness.activityLevel || ''} onChange={e => setWellness({ ...wellness, activityLevel: e.target.value || null })}>
              <option value="">Not declared</option><option>LOW</option><option>MODERATE</option><option>HIGH</option><option>PREFER_NOT_TO_SAY</option>
            </select>
          </label>
          <div><p className="text-sm font-semibold text-muted">Nutrition goals</p><div className="mt-2 flex flex-wrap gap-2">{['HYDRATION','PMS_SUPPORT','ENERGY_SUPPORT','IRON_RICH_FOODS','DIGESTIVE_COMFORT'].map(v => <button type="button" key={v} onClick={() => toggleWellness('nutritionGoals', v)} className={wellness.nutritionGoals.includes(v) ? 'flow-btn-primary' : 'flow-btn-secondary'}>{v.replaceAll('_', ' ')}</button>)}</div></div>
          <div><p className="text-sm font-semibold text-muted">Preferred activities</p><div className="mt-2 flex flex-wrap gap-2">{['WALKING','YOGA','MOBILITY','STRENGTH','CYCLING','SWIMMING','RUNNING'].map(v => <button type="button" key={v} onClick={() => toggleWellness('preferredActivities', v)} className={wellness.preferredActivities.includes(v) ? 'flow-btn-primary' : 'flow-btn-secondary'}>{v}</button>)}</div></div>
        </div>
        <div className="mt-5 flex items-center justify-between gap-3"><span className="text-sm text-muted" role="status">{wellnessNotice}</span><button type="button" onClick={saveWellness} className="flow-btn-primary">Save wellness preferences</button></div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      <section className="bloom-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="firstName" className="text-sm font-semibold text-muted">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                disabled={!isEditing}
                value={formData.firstName}
                onChange={handleChange}
                className="flow-input disabled:cursor-not-allowed disabled:bg-[#f3f5f9]"
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
                disabled={!isEditing}
                value={formData.lastName}
                onChange={handleChange}
                className="flow-input disabled:cursor-not-allowed disabled:bg-[#f3f5f9]"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold text-muted">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                disabled={!isEditing}
                value={formData.email}
                onChange={handleChange}
                className="flow-input disabled:cursor-not-allowed disabled:bg-[#f3f5f9]"
              />
            </div>

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
                disabled={!isEditing}
                value={formData.cycleLength}
                onChange={handleChange}
                className="flow-input disabled:cursor-not-allowed disabled:bg-[#f3f5f9]"
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
                disabled={!isEditing}
                value={formData.periodLength}
                onChange={handleChange}
                className="flow-input disabled:cursor-not-allowed disabled:bg-[#f3f5f9]"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink">
              <input
                id="birthControlUse"
                name="birthControlUse"
                type="checkbox"
                disabled={!isEditing}
                checked={formData.birthControlUse}
                onChange={handleChange}
                className="h-4 w-4 rounded border-line text-rose-quartz focus:ring-rose-quartz disabled:cursor-not-allowed"
              />
              I use birth control
            </label>
          </div>

          <div className="flex flex-wrap justify-end gap-3 pt-2">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className="flow-btn-primary">
                Edit profile
              </button>
            ) : (
              <>
                <button type="button" onClick={() => setIsEditing(false)} className="flow-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flow-btn-primary">
                  Save changes
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </div>
  );
};

export default Profile;
