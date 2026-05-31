import React, { useEffect, useState } from 'react';
import { Download, LockKeyhole, ShieldCheck, Trash2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  deleteUserData,
  exportUserData,
  getPrivacySettings,
  updatePrivacySettings,
} from '../../store/slices/authSlice';
import { PrivacySettings } from '../../types/auth';

const controls: Array<{
  key: keyof Pick<PrivacySettings, 'aiCoachEnabled' | 'voiceProcessingEnabled' | 'analyticsOptIn' | 'notificationsEnabled'>;
  title: string;
  description: string;
}> = [
  {
    key: 'aiCoachEnabled',
    title: 'AI coach',
    description: 'Allow private coach sessions for educational guidance and draft language.',
  },
  {
    key: 'voiceProcessingEnabled',
    title: 'Voice processing',
    description: 'Allow microphone check-ins to be processed into reviewable draft logs.',
  },
  {
    key: 'analyticsOptIn',
    title: 'Analytics',
    description: 'Share product analytics. Keep this off for the most private experience.',
  },
  {
    key: 'notificationsEnabled',
    title: 'Notifications',
    description: 'Allow reminders and cycle-related notifications.',
  },
];

const Privacy: React.FC = () => {
  const dispatch = useAppDispatch();
  const { privacy, exportData, isLoading, error } = useAppSelector((state) => state.auth);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getPrivacySettings());
  }, [dispatch]);

  const updateToggle = async (key: (typeof controls)[number]['key']) => {
    if (!privacy) {
      return;
    }
    setNotice(null);
    await dispatch(updatePrivacySettings({ [key]: !privacy[key] })).unwrap();
  };

  const handleExport = async () => {
    setNotice(null);
    await dispatch(exportUserData()).unwrap();
    setNotice('Export prepared below. It reflects data available at request time.');
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Delete cycle-service health data for this account? This action cannot be undone from Flowelle.'
    );
    if (!confirmed) {
      return;
    }

    setNotice(null);
    await dispatch(deleteUserData()).unwrap();
    setNotice('Health data deletion was requested. The timestamp is recorded in your privacy settings.');
  };

  return (
    <div className="flow-page">
      <header>
        <p className="card-label">Consent and control</p>
        <h1 className="page-title">Privacy Center</h1>
        <p className="page-subtitle">
          See what is enabled, control AI and voice processing, export your data, or request deletion of health data.
        </p>
      </header>

      {error && <div className="flow-panel border-[#f2b8c2] bg-[#fff4f5] p-4 text-sm font-semibold text-danger">{error}</div>}
      {notice && <div className="flow-panel border-[#b7e1cf] bg-[#f0fbf6] p-4 text-sm font-semibold text-[#17704f]">{notice}</div>}

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <article className="flow-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
            <h2 className="section-title">Privacy controls</h2>
          </div>
          <div className="mt-5 divide-y divide-line">
            {controls.map((control) => (
              <div key={control.key} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold text-ink">{control.title}</p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-muted">{control.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateToggle(control.key)}
                  disabled={!privacy || isLoading}
                  className={`min-h-11 min-w-24 rounded-full px-4 text-sm font-extrabold transition ${
                    privacy?.[control.key] ? 'bg-clinical-blue text-white' : 'border border-line bg-white text-muted'
                  }`}
                  aria-pressed={Boolean(privacy?.[control.key])}
                >
                  {privacy?.[control.key] ? 'On' : 'Off'}
                </button>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="flow-card p-5">
            <div className="flex items-center gap-3">
              <Download className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
              <h2 className="section-title">Export</h2>
            </div>
            <p className="card-meta">Prepare an account, privacy, cycle, log, symptom, and prediction export.</p>
            <button type="button" onClick={handleExport} disabled={isLoading} className="flow-btn-primary mt-4">
              Prepare export
            </button>
            {privacy?.exportRequestedAt && (
              <p className="card-meta">Last requested: {privacy.exportRequestedAt}</p>
            )}
          </article>

          <article className="flow-card p-5">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-danger" aria-hidden="true" />
              <h2 className="section-title">Delete health data</h2>
            </div>
            <p className="card-meta">Deletes cycle-service health data and records a deletion request timestamp.</p>
            <button type="button" onClick={handleDelete} disabled={isLoading} className="flow-btn-danger mt-4">
              Delete health data
            </button>
            {privacy?.deleteRequestedAt && (
              <p className="card-meta">Last requested: {privacy.deleteRequestedAt}</p>
            )}
          </article>
        </aside>
      </section>

      <section className="flow-card p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <LockKeyhole className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
          <h2 className="section-title">Export preview</h2>
        </div>
        {exportData ? (
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-[#111827] p-4 text-xs leading-5 text-white">
            {JSON.stringify(exportData, null, 2)}
          </pre>
        ) : (
          <p className="card-meta">No export prepared in this session.</p>
        )}
      </section>
    </div>
  );
};

export default Privacy;
