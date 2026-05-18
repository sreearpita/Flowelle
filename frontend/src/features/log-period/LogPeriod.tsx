import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store';
import { createCycle, getCycleHistory } from '../../store/slices/cycleSlice';
import {
  startPeriodVoiceLog,
  VoiceCheckInConnection,
  VoiceCheckInStatus,
  VoicePeriodFlow,
  VoicePeriodReview,
} from '../../services/realtime.service';

const CalendarHeartIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
    <rect x="3" y="5" width="18" height="16" rx="3" />
    <path d="M8 3v4M16 3v4M3 10h18" />
    <path d="M12 18s-2.8-1.8-2.8-3.9a1.9 1.9 0 0 1 3.5-1 1.9 1.9 0 0 1 3.5 1C16.2 16.2 12 18 12 18Z" />
  </svg>
);

const MicIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
    <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
    <path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8" />
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
    <path d="M3 6h18M8 6V4h8v2M7 6l1 14h8l1-14M10 11v6M14 11v6" />
  </svg>
);

type PeriodVoiceReviewForm = VoicePeriodReview & {
  cycleLength: number;
  periodLength: number;
};

const voiceStatusCopy: Record<VoiceCheckInStatus, string> = {
  idle: 'Ready for a quick spoken period entry.',
  'requesting-mic': 'Requesting microphone access...',
  listening: 'Listening. Speak the start date, flow, and notes.',
  processing: 'Preparing your review card...',
  review: 'Review the period entry before saving.',
  error: 'Voice period log needs attention.',
};

const flowOptions: Array<{ value: VoicePeriodFlow; label: string }> = [
  { value: 'spotting', label: 'Spotting' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
  { value: 'heavy', label: 'Heavy' },
];

const formatVoiceNotes = (review: PeriodVoiceReviewForm): string | undefined => {
  const parts = [];
  if (review.flow) {
    parts.push(`Flow: ${review.flow}.`);
  }
  if (review.notes?.trim()) {
    parts.push(review.notes.trim());
  }
  return parts.length ? parts.join(' ') : undefined;
};

const LogPeriod: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cycleHistory, isLoading, error } = useAppSelector((state) => state.cycle);

  const [showNewEntryModal, setShowNewEntryModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceCheckInStatus>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceReview, setVoiceReview] = useState<PeriodVoiceReviewForm | null>(null);
  const voiceConnectionRef = useRef<VoiceCheckInConnection | null>(null);
  const [formData, setFormData] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    cycleLength: 28,
    periodLength: 5,
    notes: '',
  });

  useEffect(() => {
    dispatch(getCycleHistory());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      voiceConnectionRef.current?.stop();
    };
  }, []);

  const sortedHistory = useMemo(
    () =>
      [...cycleHistory].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ),
    [cycleHistory]
  );

  const summary = useMemo(() => {
    const total = sortedHistory.length;
    const averageCycleLength = total
      ? Math.round(
          sortedHistory.reduce((acc, cycle) => acc + Number(cycle.cycleLength || 0), 0) / total
        )
      : 28;
    const averagePeriodLength = total
      ? Math.round(
          sortedHistory.reduce((acc, cycle) => acc + Number(cycle.periodLength || 0), 0) / total
        )
      : 5;
    const latestEntry = sortedHistory[0];

    return {
      total,
      averageCycleLength,
      averagePeriodLength,
      latestEntry,
    };
  }, [sortedHistory]);

  const handleStartVoiceLog = async () => {
    setActionError(null);
    setVoiceError(null);
    setVoiceReview(null);
    setVoiceTranscript('');

    try {
      voiceConnectionRef.current?.stop();
      voiceConnectionRef.current = await startPeriodVoiceLog(
        {
          onStatusChange: setVoiceStatus,
          onReview: (review) => {
            setVoiceReview({
              ...review,
              cycleLength: summary.averageCycleLength || 28,
              periodLength: summary.averagePeriodLength || 5,
            });
          },
          onTranscriptChange: setVoiceTranscript,
          onError: setVoiceError,
        },
        format(new Date(), 'yyyy-MM-dd')
      );
    } catch (error) {
      setVoiceStatus('error');
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Unable to start voice period log. Check microphone access and try again.'
      );
    }
  };

  const handleFinishVoiceLog = () => {
    voiceConnectionRef.current?.finish();
  };

  const handleCancelVoiceLog = () => {
    voiceConnectionRef.current?.stop();
    voiceConnectionRef.current = null;
    setVoiceStatus('idle');
    setVoiceError(null);
    setVoiceTranscript('');
    setVoiceReview(null);
  };

  const handleVoiceReviewChange = (patch: Partial<PeriodVoiceReviewForm>) => {
    setVoiceReview((review) => (review ? { ...review, ...patch } : review));
  };

  const handleSaveVoiceReview = async () => {
    setActionError(null);

    if (!voiceReview) {
      return;
    }

    try {
      await dispatch(
        createCycle({
          startDate: voiceReview.startDate,
          cycleLength: Number(voiceReview.cycleLength),
          periodLength: Number(voiceReview.periodLength),
          notes: formatVoiceNotes(voiceReview),
        })
      ).unwrap();

      handleCancelVoiceLog();
    } catch {
      setActionError('Unable to save the voice period entry right now. Please review and try again.');
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await dispatch(
        createCycle({
          startDate: formData.startDate,
          cycleLength: Number(formData.cycleLength),
          periodLength: Number(formData.periodLength),
          notes: formData.notes || undefined,
        })
      ).unwrap();

      setShowNewEntryModal(false);
      setFormData({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        cycleLength: 28,
        periodLength: 5,
        notes: '',
      });
    } catch {
      setActionError('Unable to save period entry right now. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <section className="relative overflow-hidden rounded-[2rem] border border-line bg-gradient-to-br from-[#fff4fa] via-[#fcfbff] to-[#f2eeff] p-6 shadow-soft sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#f3d9ef] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-[#dceeff] blur-3xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <p className="card-label text-rose-quartz">Cycle Journal</p>
            <h1 className="page-title">Log Period</h1>
            <p className="page-subtitle">
              Record cycle starts consistently to keep your predictions accurate and useful.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartVoiceLog}
              disabled={voiceStatus === 'requesting-mic' || voiceStatus === 'listening' || voiceStatus === 'processing'}
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-6 py-2.5 text-base font-bold tracking-tight text-deep-indigo shadow-soft transition hover:bg-[#f4f7fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MicIcon className="h-5 w-5" />
              Voice Log
            </button>
            <button
              onClick={() => setShowNewEntryModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4f74] to-[#8f52ff] px-6 py-2.5 text-base font-bold tracking-tight text-white shadow-soft transition hover:-translate-y-0.5 hover:brightness-105"
            >
              <span className="text-2xl leading-none">+</span>
              New Entry
            </button>
          </div>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <p className="card-label">Total Entries</p>
            <p className="card-value">{summary.total}</p>
            <p className="card-meta">Cycle logs on record</p>
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <p className="card-label">Avg Cycle Length</p>
            <p className="card-value">{summary.averageCycleLength} days</p>
            <p className="card-meta">Based on your history</p>
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <p className="card-label">Avg Period Length</p>
            <p className="card-value">{summary.averagePeriodLength} days</p>
            <p className="card-meta">Typical bleeding span</p>
          </article>
          <article className="rounded-2xl border border-white/70 bg-white/75 p-4 backdrop-blur">
            <p className="card-label">Latest Logged</p>
            <p className="card-value">
              {summary.latestEntry ? format(parseISO(summary.latestEntry.startDate), 'MMM d') : '--'}
            </p>
            <p className="card-meta">
              {summary.latestEntry
                ? formatDistanceToNow(parseISO(summary.latestEntry.startDate), { addSuffix: true })
                : 'No entries yet'}
            </p>
          </article>
        </div>
      </section>

      <section className="bloom-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="card-label">Hands-Free Period Logging</p>
            <h2 className="section-title mt-1">Speak a period entry</h2>
            <p className="card-meta">{voiceStatusCopy[voiceStatus]}</p>
            <p className="mt-2 text-[0.86rem] font-medium text-muted">
              Flowelle extracts period logs for review only. It is not a medical diagnostic tool.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {voiceStatus === 'listening' && (
              <button type="button" onClick={handleFinishVoiceLog} className="flow-btn-primary">
                Create review
              </button>
            )}
            {(voiceStatus === 'listening' || voiceStatus === 'processing' || voiceReview) && (
              <button type="button" onClick={handleCancelVoiceLog} className="flow-btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </div>

        {voiceError && (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {voiceError}
          </div>
        )}

        {(voiceStatus === 'listening' || voiceStatus === 'processing' || voiceTranscript) && (
          <div className="mt-4 rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="card-label">Live Transcript</p>
              {voiceStatus === 'listening' && (
                <span className="rounded-full bg-[#d0f1df] px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-[#0a8d5b]">
                  Listening
                </span>
              )}
            </div>
            <p className="mt-2 min-h-12 whitespace-pre-line text-[0.98rem] leading-relaxed text-ink">
              {voiceTranscript || 'Your spoken words will appear here as Flowelle hears them.'}
            </p>
          </div>
        )}

        {voiceReview && (
          <div className="mt-5 rounded-2xl border border-line bg-[#fbfcff] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="section-title text-[1.1rem] sm:text-[1.2rem]">Review before saving</h3>
                <p className="card-meta">Edit anything that was misunderstood.</p>
              </div>
              <div className="w-full sm:w-52">
                <label htmlFor="voicePeriodStartDate" className="text-sm font-semibold text-muted">
                  Start date
                </label>
                <input
                  id="voicePeriodStartDate"
                  type="date"
                  value={voiceReview.startDate}
                  onChange={(event) => handleVoiceReviewChange({ startDate: event.target.value })}
                  className="flow-input"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-[0.8fr_0.8fr_0.8fr_1.6fr]">
              <div>
                <label className="text-sm font-semibold text-muted">Flow</label>
                <select
                  value={voiceReview.flow || ''}
                  onChange={(event) =>
                    handleVoiceReviewChange({
                      flow: event.target.value ? (event.target.value as VoicePeriodFlow) : undefined,
                    })
                  }
                  className="flow-input"
                >
                  <option value="">Not specified</option>
                  {flowOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted">Cycle length</label>
                <input
                  type="number"
                  min={21}
                  max={35}
                  value={voiceReview.cycleLength}
                  onChange={(event) => handleVoiceReviewChange({ cycleLength: Number(event.target.value) })}
                  className="flow-input"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted">Period length</label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={voiceReview.periodLength}
                  onChange={(event) => handleVoiceReviewChange({ periodLength: Number(event.target.value) })}
                  className="flow-input"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted">Notes</label>
                <input
                  type="text"
                  value={voiceReview.notes || ''}
                  onChange={(event) => handleVoiceReviewChange({ notes: event.target.value })}
                  className="flow-input"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={handleCancelVoiceLog} className="flow-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSaveVoiceReview} className="flow-btn-primary">
                Save Entry
              </button>
            </div>
          </div>
        )}
      </section>

      {(actionError || error) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {actionError || error}
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-[1.75fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="section-title">Recent Entries</h2>
              <p className="card-meta">A clean history of your logged starts</p>
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {format(new Date(), 'MMMM yyyy')}
            </p>
          </div>

          {isLoading ? (
            <div className="bloom-card p-8 text-center text-lg text-muted">Loading entries...</div>
          ) : sortedHistory.length === 0 ? (
            <div className="bloom-card p-10 text-center">
              <h3 className="section-title">No entries yet</h3>
              <p className="card-meta mt-2">
                Start by adding your most recent period to build reliable predictions.
              </p>
              <button
                onClick={() => setShowNewEntryModal(true)}
                className="flow-btn-primary mt-5"
              >
                Add first entry
              </button>
            </div>
          ) : (
            sortedHistory.map((entry, index) => (
              <article
                key={entry.id}
                className="relative overflow-hidden rounded-3xl border border-line bg-white px-5 py-5 shadow-soft transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(31,47,70,0.12)] sm:px-6 sm:py-6"
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#ff5d8d] to-[#9159ff]" />
                <div className="flex items-center justify-between gap-4 pl-1">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-soft-peach text-rose-quartz">
                      <CalendarHeartIcon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="section-title text-[1.3rem] sm:text-[1.4rem]">
                        {format(parseISO(entry.startDate), 'MMMM d, yyyy')}
                      </h3>
                      <p className="card-meta">
                        {entry.cycleLength} day cycle · {entry.periodLength} day period
                      </p>
                      <p className="mt-1 text-sm font-medium text-muted">
                        Logged {formatDistanceToNow(parseISO(entry.startDate), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {index === 0 && (
                      <span className="phase-pill bg-soft-peach text-rose-quartz">Latest</span>
                    )}
                    <button
                      type="button"
                      title="Delete is not available yet"
                      className="rounded-xl border border-line p-2.5 text-muted transition hover:bg-[#f4f7fb] hover:text-ink"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <aside className="bloom-card h-fit p-5 sm:p-6">
          <h3 className="section-title text-[1.2rem] sm:text-[1.3rem]">Consistency Tips</h3>
          <p className="card-meta">Small habits make your cycle insights much more accurate.</p>

          <ul className="mt-5 space-y-3 text-[0.9rem] leading-6 text-muted">
            <li className="rounded-xl bg-[#f7f9fd] px-3 py-2">Log on the first day of bleeding, not spotting.</li>
            <li className="rounded-xl bg-[#f7f9fd] px-3 py-2">Keep cycle length realistic (21-35 days is common).</li>
            <li className="rounded-xl bg-[#f7f9fd] px-3 py-2">Add short notes only when something unusual happens.</li>
            <li className="rounded-xl bg-[#f7f9fd] px-3 py-2">Review entries monthly to catch pattern shifts early.</li>
          </ul>

          <div className="mt-5 rounded-2xl bg-gradient-to-r from-[#ffe4ef] to-[#ece3ff] px-4 py-4">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#8c3c73]">Flowelle Note</p>
            <p className="mt-1 text-[0.92rem] font-semibold text-[#3f3a59]">
              Regular entries help improve fertile-window and next-period timing.
            </p>
          </div>
        </aside>
      </section>

      {showNewEntryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2f46]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-white shadow-[0_24px_65px_rgba(31,47,70,0.22)]">
            <div className="border-b border-line bg-gradient-to-r from-[#fff2f8] to-[#f4efff] px-6 py-5">
              <h2 className="section-title">New Period Entry</h2>
              <p className="card-meta">Add your latest cycle details</p>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="startDate" className="text-sm font-semibold text-muted">
                  Start date
                </label>
                <input
                  id="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
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
                    type="number"
                    min={21}
                    max={35}
                    required
                    value={formData.cycleLength}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, cycleLength: Number(e.target.value) }))
                    }
                    className="flow-input"
                  />
                </div>

                <div>
                  <label htmlFor="periodLength" className="text-sm font-semibold text-muted">
                    Period length (days)
                  </label>
                  <input
                    id="periodLength"
                    type="number"
                    min={2}
                    max={10}
                    required
                    value={formData.periodLength}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, periodLength: Number(e.target.value) }))
                    }
                    className="flow-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="text-sm font-semibold text-muted">
                  Notes (optional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  className="flow-input"
                  placeholder="Any details you'd like to keep"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewEntryModal(false)}
                  className="flow-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flow-btn-primary">
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogPeriod;
