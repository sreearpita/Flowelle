import React, { useEffect, useMemo, useRef, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteSymptom, getCurrentCycle, getCycleHistory, logSymptom } from '../../store/slices/cycleSlice';
import { CycleData, Symptom } from '../../types/cycle';
import {
  ExtractedVoiceSymptom,
  startVoiceCheckIn,
  VoiceCheckInConnection,
  VoiceCheckInStatus,
  VoiceSymptomReview,
} from '../../services/realtime.service';

type SymptomEntry = {
  date: string;
  symptoms: Symptom[];
  notes: string[];
  averageSeverity: number;
};

const physicalTypes = new Set([
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'breast tenderness',
  'breast_tenderness',
  'nausea',
  'back pain',
  'back_pain',
]);

const emotionalTypes = new Set([
  'mood',
  'mood changes',
  'mood_changes',
  'anxiety',
  'stress',
  'irritability',
  'brain fog',
  'brain_fog',
  'low motivation',
  'low_motivation',
]);

const symptomTypeOptions = [
  'Cramps',
  'Headache',
  'Fatigue',
  'Bloating',
  'Breast tenderness',
  'Mood changes',
  'Anxiety',
  'Stress',
  'Irritability',
  'Brain fog',
  'Low motivation',
];

const PlusIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className}>
    <path d="M12 5v14M5 12h14" />
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

const normalizeSymptomLabel = (value: string): string =>
  value
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const normalizeSymptomTypeValue = (value: string): string => value.toLowerCase().replace(/\s+/g, '_');

const voiceStatusCopy: Record<VoiceCheckInStatus, string> = {
  idle: 'Ready for a quick spoken check-in.',
  'requesting-mic': 'Requesting microphone access...',
  listening: 'Listening. Speak your symptoms, date, severity, and notes.',
  processing: 'Preparing your review card...',
  review: 'Review the extracted symptoms before saving.',
  error: 'Voice check-in needs attention.',
};

const getSeverityMeta = (severity: number): { label: string; className: string } => {
  if (severity <= 2) {
    return {
      label: 'Mild',
      className: 'bg-[#d0f1df] text-[#0a8d5b]',
    };
  }

  if (severity === 3) {
    return {
      label: 'Moderate',
      className: 'bg-[#fbe8be] text-[#b25a00]',
    };
  }

  return {
    label: 'Severe',
    className: 'bg-[#ffdce7] text-[#ca1f4f]',
  };
};

const categorizeSymptom = (symptom: Symptom) => {
  const normalized = symptom.type.toLowerCase().replace(/[_-]/g, ' ').trim();
  if (physicalTypes.has(normalized)) {
    return 'physical';
  }
  if (emotionalTypes.has(normalized)) {
    return 'emotional';
  }
  return 'other';
};

const Symptoms: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentCycle, cycleHistory, isLoading, error } = useAppSelector((state) => state.cycle);

  const [showModal, setShowModal] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceCheckInStatus>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceReview, setVoiceReview] = useState<VoiceSymptomReview | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const voiceConnectionRef = useRef<VoiceCheckInConnection | null>(null);
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    type: 'headache',
    severity: 2,
    notes: '',
  });

  useEffect(() => {
    if (user?.id) {
      dispatch(getCurrentCycle());
      dispatch(getCycleHistory());
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    return () => {
      voiceConnectionRef.current?.stop();
    };
  }, []);

  const uniqueCycles = useMemo(() => {
    const map = new Map<string, CycleData>();
    if (currentCycle?.id) {
      map.set(currentCycle.id, currentCycle);
    }

    cycleHistory.forEach((cycle) => {
      if (!map.has(cycle.id)) {
        map.set(cycle.id, cycle);
      }
    });

    return Array.from(map.values());
  }, [currentCycle, cycleHistory]);

  const entries = useMemo(() => {
    const grouped = new Map<string, { symptoms: Symptom[]; notes: string[] }>();

    uniqueCycles.forEach((cycle) => {
      cycle.days?.forEach((day) => {
        const daySymptoms = day.symptoms || [];
        const dayNotes = day.notes ? [day.notes] : [];

        if (daySymptoms.length === 0 && dayNotes.length === 0) {
          return;
        }

        if (!grouped.has(day.date)) {
          grouped.set(day.date, { symptoms: [], notes: [] });
        }

        const bucket = grouped.get(day.date)!;
        daySymptoms.forEach((symptom) => {
          bucket.symptoms.push({
            ...symptom,
            cycleId: symptom.cycleId || cycle.id,
            date: symptom.date || day.date,
          });
        });
        bucket.notes.push(...dayNotes);
      });
    });

    return Array.from(grouped.entries())
      .map(([date, value]) => {
        const severityValues = value.symptoms.map((symptom) => symptom.severity || 1);
        const averageSeverity =
          severityValues.length > 0
            ? Math.round(severityValues.reduce((acc, cur) => acc + cur, 0) / severityValues.length)
            : 1;
        const notes = Array.from(new Set(value.notes.map((note) => note.trim()).filter(Boolean)));

        return {
          date,
          symptoms: value.symptoms,
          notes,
          averageSeverity,
        } as SymptomEntry;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [uniqueCycles]);

  const handleAddSymptom = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(null);

    if (!currentCycle?.id) {
      setActionError('Create a cycle entry first in Log Period before adding symptoms.');
      return;
    }

    try {
      await dispatch(
        logSymptom({
          cycleId: currentCycle.id,
          date: formData.date,
          type: formData.type,
          severity: Number(formData.severity),
          notes: formData.notes || undefined,
        })
      ).unwrap();

      setShowModal(false);
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        type: 'headache',
        severity: 2,
        notes: '',
      });
    } catch {
      setActionError('Unable to save symptom right now. Please try again.');
    }
  };

  const handleStartVoiceCheckIn = async () => {
    setActionError(null);
    setVoiceError(null);
    setVoiceReview(null);
    setVoiceTranscript('');

    if (!currentCycle?.id) {
      setActionError('Create a cycle entry first in Log Period before adding symptoms.');
      return;
    }

    try {
      voiceConnectionRef.current?.stop();
      voiceConnectionRef.current = await startVoiceCheckIn({
        onStatusChange: setVoiceStatus,
        onReview: setVoiceReview,
        onTranscriptChange: setVoiceTranscript,
        onError: setVoiceError,
      });
    } catch (error) {
      setVoiceStatus('error');
      setVoiceError(
        error instanceof Error
          ? error.message
          : 'Unable to start voice check-in. Check microphone access and try again.'
      );
    }
  };

  const handleFinishVoiceCheckIn = () => {
    voiceConnectionRef.current?.finish();
  };

  const handleCancelVoiceCheckIn = () => {
    voiceConnectionRef.current?.stop();
    voiceConnectionRef.current = null;
    setVoiceReview(null);
    setVoiceError(null);
    setVoiceTranscript('');
    setVoiceStatus('idle');
  };

  const handleVoiceReviewDateChange = (date: string) => {
    setVoiceReview((review) => (review ? { ...review, date } : review));
  };

  const handleVoiceReviewSymptomChange = (
    index: number,
    patch: Partial<ExtractedVoiceSymptom>
  ) => {
    setVoiceReview((review) => {
      if (!review) {
        return review;
      }

      return {
        ...review,
        symptoms: review.symptoms.map((symptom, symptomIndex) =>
          symptomIndex === index ? { ...symptom, ...patch } : symptom
        ),
      };
    });
  };

  const handleSaveVoiceReview = async () => {
    setActionError(null);

    if (!currentCycle?.id || !voiceReview) {
      setActionError('Create a cycle entry first in Log Period before adding symptoms.');
      return;
    }

    try {
      for (const symptom of voiceReview.symptoms) {
        await dispatch(
          logSymptom({
            cycleId: currentCycle.id,
            date: voiceReview.date,
            type: symptom.type,
            severity: Number(symptom.severity),
            notes: symptom.notes || undefined,
          })
        ).unwrap();
      }

      handleCancelVoiceCheckIn();
    } catch {
      setActionError('Unable to save the voice check-in right now. Please review and try again.');
    }
  };

  const handleDeleteEntry = async (entry: SymptomEntry) => {
    setActionError(null);
    const deletableIds = Array.from(
      new Set(
        entry.symptoms
          .map((symptom) => symptom.id)
          .filter((value): value is string => Boolean(value))
      )
    );

    if (deletableIds.length === 0) {
      setActionError('This entry cannot be deleted because symptom IDs were not returned by the API.');
      return;
    }

    try {
      await Promise.all(deletableIds.map((symptomId) => dispatch(deleteSymptom(symptomId)).unwrap()));
    } catch {
      setActionError('Failed to delete one or more symptoms in this entry.');
    }
  };

  const groupedSymptomChips = (symptoms: Symptom[]) => {
    const groups = {
      physical: [] as string[],
      emotional: [] as string[],
      other: [] as string[],
    };

    symptoms.forEach((symptom) => {
      const category = categorizeSymptom(symptom);
      const label = normalizeSymptomLabel(symptom.type);
      if (!groups[category].includes(label)) {
        groups[category].push(label);
      }
    });

    return groups;
  };

  return (
    <div className="space-y-6 animate-fadeInUp">
      <section className="bloom-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title">Symptom Tracker</h1>
            <p className="page-subtitle">Log how you're feeling</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleStartVoiceCheckIn}
              disabled={voiceStatus === 'requesting-mic' || voiceStatus === 'listening' || voiceStatus === 'processing'}
              className="inline-flex items-center gap-2 rounded-2xl border border-line bg-white px-6 py-2.5 text-[1rem] font-bold tracking-tight text-deep-indigo shadow-soft transition hover:bg-[#f4f7fb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <MicIcon className="h-5 w-5" />
              Voice Check-In
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4f74] to-[#8f52ff] px-6 py-2.5 text-[1rem] font-bold tracking-tight text-white shadow-soft transition hover:brightness-105"
            >
              <PlusIcon className="h-5 w-5" />
              Log Symptoms
            </button>
          </div>
        </div>
      </section>

      <section className="bloom-card p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="card-label">Voice Check-In</p>
            <h2 className="section-title mt-1">Speak a symptom entry</h2>
            <p className="card-meta">{voiceStatusCopy[voiceStatus]}</p>
            <p className="mt-2 text-[0.86rem] font-medium text-muted">
              Flowelle extracts logs for review only. It is not a medical diagnostic tool.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {voiceStatus === 'listening' && (
              <button type="button" onClick={handleFinishVoiceCheckIn} className="flow-btn-primary">
                Create review
              </button>
            )}
            {(voiceStatus === 'listening' || voiceStatus === 'processing' || voiceReview) && (
              <button type="button" onClick={handleCancelVoiceCheckIn} className="flow-btn-secondary">
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
                <label htmlFor="voiceReviewDate" className="text-sm font-semibold text-muted">
                  Date
                </label>
                <input
                  id="voiceReviewDate"
                  type="date"
                  value={voiceReview.date}
                  onChange={(event) => handleVoiceReviewDateChange(event.target.value)}
                  className="flow-input"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {voiceReview.symptoms.map((symptom, index) => (
                <div key={`${symptom.type}-${index}`} className="rounded-2xl border border-line bg-white p-4">
                  <div className="grid gap-3 md:grid-cols-[1.2fr_0.65fr_1.6fr]">
                    <div>
                      <label className="text-sm font-semibold text-muted">Symptom</label>
                      <select
                        value={symptom.type}
                        onChange={(event) =>
                          handleVoiceReviewSymptomChange(index, { type: event.target.value })
                        }
                        className="flow-input"
                      >
                        {symptomTypeOptions.map((option) => {
                          const value = normalizeSymptomTypeValue(option);
                          return (
                            <option key={value} value={value}>
                              {option}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-muted">Severity</label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={symptom.severity}
                        onChange={(event) =>
                          handleVoiceReviewSymptomChange(index, {
                            severity: Number(event.target.value),
                          })
                        }
                        className="flow-input"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-muted">Notes</label>
                      <input
                        type="text"
                        value={symptom.notes || ''}
                        onChange={(event) =>
                          handleVoiceReviewSymptomChange(index, {
                            notes: event.target.value,
                          })
                        }
                        className="flow-input"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button type="button" onClick={handleCancelVoiceCheckIn} className="flow-btn-secondary">
                Cancel
              </button>
              <button type="button" onClick={handleSaveVoiceReview} className="flow-btn-primary">
                Save Check-In
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

      <section className="space-y-4">
        {isLoading && entries.length === 0 ? (
          <div className="bloom-card p-8 text-center text-lg text-muted">Loading symptom history...</div>
        ) : entries.length === 0 ? (
          <div className="bloom-card p-10 text-center">
            <h2 className="section-title">No symptoms logged yet</h2>
            <p className="card-meta mt-2">Start tracking symptoms to see patterns across your cycle.</p>
          </div>
        ) : (
          entries.map((entry) => {
            const severity = getSeverityMeta(entry.averageSeverity);
            const groupedChips = groupedSymptomChips(entry.symptoms);

            return (
              <article key={entry.date} className="bloom-card p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="section-title text-[1.35rem] sm:text-[1.45rem]">
                      {format(parseISO(entry.date), 'MMMM d, yyyy')}
                    </h3>
                    <span
                      className={`mt-3 inline-flex rounded-xl px-3 py-1 text-sm font-bold uppercase tracking-[0.1em] ${severity.className}`}
                    >
                      {severity.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    title="Delete symptom entry"
                    onClick={() => handleDeleteEntry(entry)}
                    className="rounded-xl border border-line p-2 text-muted transition hover:bg-[#f4f7fb] hover:text-ink"
                  >
                    <TrashIcon />
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {groupedChips.physical.length > 0 && (
                    <div>
                      <p className="card-label">Physical</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {groupedChips.physical.map((chip) => (
                          <span
                            key={`${entry.date}-physical-${chip}`}
                            className="rounded-xl bg-[#ffe7ec] px-3 py-1 text-[0.9rem] font-semibold text-[#d93a63]"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedChips.emotional.length > 0 && (
                    <div>
                      <p className="card-label">Emotional</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {groupedChips.emotional.map((chip) => (
                          <span
                            key={`${entry.date}-emotional-${chip}`}
                            className="rounded-xl bg-[#f0e9ff] px-3 py-1 text-[0.9rem] font-semibold text-[#7a3dde]"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {groupedChips.other.length > 0 && (
                    <div>
                      <p className="card-label">Other</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {groupedChips.other.map((chip) => (
                          <span
                            key={`${entry.date}-other-${chip}`}
                            className="rounded-xl bg-[#eaf2ff] px-3 py-1 text-[0.9rem] font-semibold text-[#2f62c6]"
                          >
                            {chip}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.notes.length > 0 && (
                    <p className="pt-1 text-[1rem] italic text-muted">{entry.notes[0]}</p>
                  )}
                </div>
              </article>
            );
          })
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2f46]/35 px-4">
          <div className="bloom-card w-full max-w-lg p-6">
            <h3 className="section-title">Log Symptoms</h3>
            <p className="card-meta">Record symptoms for a specific date</p>

            <form onSubmit={handleAddSymptom} className="mt-5 space-y-4">
              <div>
                <label htmlFor="symptomDate" className="text-sm font-semibold text-muted">
                  Date
                </label>
                <input
                  id="symptomDate"
                  type="date"
                  required
                  value={formData.date}
                  onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                  className="flow-input"
                />
              </div>

              <div>
                <label htmlFor="symptomType" className="text-sm font-semibold text-muted">
                  Symptom type
                </label>
                <select
                  id="symptomType"
                  value={formData.type}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, type: normalizeSymptomTypeValue(event.target.value) }))
                  }
                  className="flow-input"
                >
                  {symptomTypeOptions.map((option) => (
                    <option key={option} value={normalizeSymptomTypeValue(option)}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="symptomSeverity" className="text-sm font-semibold text-muted">
                  Severity (1-5)
                </label>
                <input
                  id="symptomSeverity"
                  type="number"
                  min={1}
                  max={5}
                  required
                  value={formData.severity}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, severity: Number(event.target.value) }))
                  }
                  className="flow-input"
                />
              </div>

              <div>
                <label htmlFor="symptomNotes" className="text-sm font-semibold text-muted">
                  Notes (optional)
                </label>
                <textarea
                  id="symptomNotes"
                  rows={3}
                  value={formData.notes}
                  onChange={(event) => setFormData((prev) => ({ ...prev, notes: event.target.value }))}
                  className="flow-input"
                  placeholder="Anything notable today?"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flow-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flow-btn-primary">
                  Save Symptom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Symptoms;
