import React, { useEffect, useMemo, useState } from 'react';
import {
  addDays,
  differenceInDays,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
} from 'date-fns';
import { useAppDispatch, useAppSelector } from '../../store';
import { getCurrentCycle, getPredictions, logSymptom } from '../../store/slices/cycleSlice';

interface SymptomFormData {
  type: string;
  severity: number;
  notes: string;
}

type HormoneLevel = {
  name: string;
  value: number;
  color: string;
};

const Calendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [symptomForm, setSymptomForm] = useState<SymptomFormData>({
    type: 'cramps',
    severity: 1,
    notes: '',
  });

  const dispatch = useAppDispatch();
  const { currentCycle, predictions, isLoading, error } = useAppSelector((state) => state.cycle);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(getCurrentCycle());
      dispatch(getPredictions());
    }
  }, [dispatch, user?.id]);

  const cycleLength = currentCycle?.cycleLength ?? 28;
  const periodLength = currentCycle?.periodLength ?? 5;
  const cycleStart = currentCycle ? new Date(currentCycle.startDate) : new Date();
  const cycleDay = currentCycle
    ? Math.min(cycleLength, Math.max(1, differenceInDays(new Date(), cycleStart) + 1))
    : 14;
  const ringProgress = Math.round((cycleDay / cycleLength) * 100);

  const periodEnd = currentCycle ? addDays(cycleStart, periodLength - 1) : null;
  const daysLeft = predictions?.nextPeriod
    ? Math.max(0, differenceInDays(new Date(predictions.nextPeriod), new Date()))
    : null;

  const hormones: HormoneLevel[] = useMemo(() => {
    const estrogen = Math.max(25, Math.min(100, Math.round(100 - Math.abs(cycleDay - 14) * 4)));
    const progesterone = cycleDay >= 15 ? Math.min(85, 15 + (cycleDay - 14) * 5) : 12;
    const lh = cycleDay >= 13 && cycleDay <= 15 ? 95 : 10;

    return [
      { name: 'Estrogen', value: estrogen, color: 'bg-rose-quartz' },
      { name: 'Progesterone', value: progesterone, color: 'bg-sunrise' },
      { name: 'LH Surge', value: lh, color: 'bg-[#9b5cf5]' },
    ];
  }, [cycleDay]);

  const monthDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  const leadingEmptyDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    return Array.from({ length: start.getDay() }, (_, i) => i);
  }, [selectedDate]);

  const menstrualPct = (periodLength / cycleLength) * 100;
  const ovulationPct = (3 / cycleLength) * 100;
  const follicularPct = ((Math.max(0, 13 - periodLength)) / cycleLength) * 100;
  const lutealPct = Math.max(0, 100 - menstrualPct - ovulationPct - follicularPct);

  const handleSymptomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCycle?.id) {
      return;
    }

    try {
      await dispatch(
        logSymptom({
          cycleId: currentCycle.id,
          date: selectedDate.toISOString().split('T')[0],
          ...symptomForm,
        })
      ).unwrap();
      setShowSymptomModal(false);
      setSymptomForm({ type: 'cramps', severity: 1, notes: '' });
    } catch {
      // State handles errors
    }
  };

  const handleSymptomChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSymptomForm((prev) => ({
      ...prev,
      [name]: name === 'severity' ? parseInt(value, 10) : value,
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="bloom-card flex items-center gap-3 px-6 py-4 text-ink">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose-quartz border-t-transparent"></div>
          <span className="text-sm font-semibold uppercase tracking-wider">Loading cycle data</span>
        </div>
      </div>
    );
  }

  if (!user?.id) {
    return (
      <div className="bloom-card p-10 text-center text-lg text-muted">Please log in to view your cycle dashboard.</div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeInUp">
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
      )}

      <header>
        <h1 className="page-title">Your Cycle</h1>
        <p className="page-subtitle">Here's what's happening today</p>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_1.95fr]">
        <article className="bloom-card p-6">
          <div
            className="mx-auto flex h-72 w-72 items-center justify-center rounded-full"
            style={{
              background: `conic-gradient(#e84f9f ${ringProgress * 3.6}deg, #ecf0f6 0deg)`,
            }}
          >
            <div className="flex h-[248px] w-[248px] flex-col items-center justify-center rounded-full bg-white text-center">
              <p className="font-display text-5xl text-ink">Day {cycleDay}</p>
              <p className="mt-2 text-xl text-muted">of {cycleLength}</p>
            </div>
          </div>
          <div className="mt-6 flex justify-center">
            <span className="rounded-full bg-rose-quartz px-8 py-3 text-lg font-bold text-white shadow-soft">
              Ovulation Window
            </span>
          </div>
        </article>

        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <article className="bloom-card bg-soft-peach p-4">
              <p className="card-label">Next Period</p>
              <p className="card-value">
                {predictions?.nextPeriod ? format(new Date(predictions.nextPeriod), 'MMM d') : '--'}
              </p>
              <p className="card-meta">{daysLeft !== null ? `in ${daysLeft} days` : '-'}</p>
            </article>

            <article className="bloom-card bg-[#f4ebf8] p-4">
              <p className="card-label">Fertile Window</p>
              <p className="card-value">
                {predictions?.fertileWindowStart
                  ? `${format(new Date(predictions.fertileWindowStart), 'MMM d')} - ${format(
                      new Date(predictions.fertileWindowEnd),
                      'MMM d'
                    )}`
                  : '--'}
              </p>
              <p className="card-meta">High fertility</p>
            </article>

            <article className="bloom-card bg-soft-lilac p-4">
              <p className="card-label">Ovulation</p>
              <p className="card-value">
                {predictions?.ovulationDay ? format(new Date(predictions.ovulationDay), 'MMM d') : '--'}
              </p>
              <p className="card-meta">Day 14</p>
            </article>

            <article className="bloom-card bg-soft-lemon p-4">
              <p className="card-label">Period Ends</p>
              <p className="card-value">{periodEnd ? format(periodEnd, 'MMM d') : '--'}</p>
              <p className="card-meta">{periodLength} day duration</p>
            </article>
          </div>

          <article className="bloom-card p-5">
            <h3 className="section-title">Today's Hormone Snapshot</h3>
            <p className="card-meta">Day {cycleDay} predicted levels</p>
            <div className="mt-5 space-y-4">
              {hormones.map((hormone) => {
                const status = hormone.value >= 70 ? 'High' : hormone.value <= 30 ? 'Low' : 'Moderate';
                const statusColor = status === 'High' ? 'text-sage-green' : status === 'Low' ? 'text-muted' : 'text-deep-indigo';

                return (
                  <div key={hormone.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[1.08rem] font-semibold text-ink">{hormone.name}</p>
                      <p className={`text-[1.08rem] font-semibold ${statusColor}`}>{status}</p>
                    </div>
                    <div className="h-3 rounded-full bg-[#f0f3f8]">
                      <div className={`h-3 rounded-full ${hormone.color}`} style={{ width: `${hormone.value}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>

      <section className="bloom-card p-5">
        <h3 className="section-title">Cycle Overview</h3>
        <div className="mt-5 overflow-hidden rounded-full">
          <div className="flex h-5 w-full">
            <div className="bg-[#f26f85]" style={{ width: `${menstrualPct}%` }} />
            <div className="bg-[#9b5cf5]" style={{ width: `${follicularPct}%` }} />
            <div className="bg-[#e56db2]" style={{ width: `${ovulationPct}%` }} />
            <div className="bg-sunrise" style={{ width: `${lutealPct}%` }} />
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-muted">
          <span>● Menstrual (1-5)</span>
          <span>● Follicular (6-13)</span>
          <span>● Ovulation (13-15)</span>
          <span>● Luteal (16-28)</span>
        </div>
      </section>

      <button className="bloom-card w-full border-none bg-soft-lilac px-4 py-4 text-center text-xl font-bold text-[#7e3deb] transition hover:brightness-105">
        ✦ View Insights & Tips
      </button>

      <section className="bloom-card p-5">
        <h3 className="section-title">Log Symptoms</h3>
        <p className="card-meta">Select a day in this month to add symptoms</p>

        <div className="mt-4 grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="rounded-xl bg-[#f2f5fb] px-1 py-2 text-center text-sm font-bold uppercase tracking-wide text-muted"
            >
              {day}
            </div>
          ))}

          {leadingEmptyDays.map((i) => (
            <div key={`empty-${i}`} />
          ))}

          {monthDays.map((day) => (
            <button
              key={day.toISOString()}
              onClick={() => {
                setSelectedDate(day);
                setShowSymptomModal(true);
              }}
              className={`rounded-xl border px-2 py-3 text-left text-sm font-semibold transition hover:border-rose-quartz hover:bg-soft-peach ${
                isSameDay(day, selectedDate) ? 'border-rose-quartz bg-soft-peach text-rose-quartz' : 'border-line bg-white text-ink'
              }`}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>
      </section>

      {showSymptomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1f2f46]/35 px-4">
          <div className="bloom-card w-full max-w-lg p-6">
            <h3 className="section-title">Log symptom for {format(selectedDate, 'MMM d, yyyy')}</h3>

            <form onSubmit={handleSymptomSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-sm font-semibold text-muted">Type</label>
                <select name="type" value={symptomForm.type} onChange={handleSymptomChange} className="flow-input">
                  <option value="cramps">Cramps</option>
                  <option value="headache">Headache</option>
                  <option value="mood">Mood Changes</option>
                  <option value="fatigue">Fatigue</option>
                  <option value="bloating">Bloating</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-muted">Severity (1-5)</label>
                <input
                  type="number"
                  name="severity"
                  min="1"
                  max="5"
                  value={symptomForm.severity}
                  onChange={handleSymptomChange}
                  className="flow-input"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-muted">Notes</label>
                <textarea
                  name="notes"
                  value={symptomForm.notes}
                  onChange={handleSymptomChange}
                  className="flow-input"
                  rows={3}
                  placeholder="Optional notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowSymptomModal(false)} className="flow-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flow-btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
