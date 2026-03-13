import React, { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store';
import { deleteSymptom, getCurrentCycle, getCycleHistory, logSymptom } from '../../store/slices/cycleSlice';
import { CycleData, Symptom } from '../../types/cycle';

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
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#ff4f74] to-[#8f52ff] px-6 py-2.5 text-[1rem] font-bold tracking-tight text-white shadow-soft transition hover:brightness-105"
          >
            <PlusIcon className="h-5 w-5" />
            Log Symptoms
          </button>
        </div>
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
