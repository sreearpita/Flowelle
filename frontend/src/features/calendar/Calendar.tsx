import React, { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isSameDay,
  startOfMonth,
  subMonths,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Circle, Droplet, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getCurrentCycle, getDailyLogs, getPredictions } from '../../store/slices/cycleSlice';
import { formatDate, isPredictedFertileDay, isPredictedPeriodDay, logsForDate } from '../common/cycleUi';

const Calendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dailyLogs, predictions, isLoading, error } = useAppSelector((state) => state.cycle);
  const { user } = useAppSelector((state) => state.auth);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user?.id) {
      dispatch(getCurrentCycle());
      dispatch(getPredictions());
      dispatch(getDailyLogs(undefined));
    }
  }, [dispatch, user?.id]);

  const monthDays = useMemo(
    () => eachDayOfInterval({ start: startOfMonth(visibleMonth), end: endOfMonth(visibleMonth) }),
    [visibleMonth]
  );

  const leadingDays = startOfMonth(visibleMonth).getDay();
  const selectedLogs = logsForDate(dailyLogs, selectedDate);

  return (
    <div className="flow-page">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="card-label">Actuals and predictions</p>
          <h1 className="page-title">Calendar</h1>
          <p className="page-subtitle">
            Logged entries are shown as facts. Predicted period and fertile windows are visually separate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVisibleMonth((month) => subMonths(month, 1))}
            className="flow-btn-secondary min-h-10 px-3"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <span className="min-w-36 text-center text-sm font-extrabold text-ink">{format(visibleMonth, 'MMMM yyyy')}</span>
          <button
            onClick={() => setVisibleMonth((month) => addMonths(month, 1))}
            className="flow-btn-secondary min-h-10 px-3"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      {error && <div className="flow-panel border-[#f2b8c2] bg-[#fff4f5] p-4 text-sm font-semibold text-danger">{error}</div>}

      <section className="grid gap-4 xl:grid-cols-[1fr_0.38fr]">
        <article className="flow-card p-4 sm:p-5">
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-extrabold uppercase tracking-[0.12em] text-muted">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: leadingDays }, (_, index) => (
              <div key={`empty-${index}`} className="min-h-24 rounded-lg border border-transparent" />
            ))}
            {monthDays.map((date) => {
              const dayLogs = logsForDate(dailyLogs, date);
              const hasPeriod = dayLogs.some((log) => Boolean(log.periodFlow));
              const hasSymptoms = dayLogs.some((log) => log.symptoms?.length > 0);
              const fertile = isPredictedFertileDay(date, predictions);
              const predictedPeriod = isPredictedPeriodDay(date, predictions);
              const selected = isSameDay(date, selectedDate);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`min-h-24 rounded-lg border p-2 text-left transition hover:border-clinical-blue ${
                    selected ? 'border-clinical-blue bg-soft-cyan' : 'border-line bg-white'
                  }`}
                  aria-label={`${format(date, 'MMMM d')}, ${dayLogs.length} logs`}
                >
                  <span className="text-sm font-extrabold text-ink">{format(date, 'd')}</span>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {hasPeriod && <span className="h-2.5 w-2.5 rounded-full bg-danger" title="Logged period" />}
                    {hasSymptoms && <span className="h-2.5 w-2.5 rounded-full bg-clinical-blue" title="Logged symptom" />}
                    {predictedPeriod && <span className="h-2.5 w-2.5 rounded-full border border-danger" title="Predicted period" />}
                    {fertile && <span className="h-2.5 w-2.5 rounded-full border border-sunrise" title="Predicted fertile window" />}
                  </div>
                  <div className="mt-3 space-y-1">
                    {dayLogs.slice(0, 2).map((log) => (
                      <p key={log.id || log.date} className="truncate rounded bg-mist px-2 py-1 text-xs font-bold text-muted">
                        {log.periodFlow || log.mood || log.symptoms?.[0]?.type?.replace(/_/g, ' ') || 'note'}
                      </p>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="flow-card p-5">
            <h2 className="section-title">{format(selectedDate, 'MMM d, yyyy')}</h2>
            <p className="card-meta">
              {selectedLogs.length > 0 ? `${selectedLogs.length} actual log${selectedLogs.length === 1 ? '' : 's'}` : 'No actual logs for this day'}
            </p>
            <div className="mt-4 space-y-3">
              {selectedLogs.map((log) => (
                <div key={log.id || `${log.date}-${log.createdAt}`} className="rounded-lg border border-line bg-mist p-3">
                  <p className="text-sm font-extrabold text-ink">
                    {log.periodFlow ? `${log.periodFlow} flow` : 'Daily log'}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                    {log.mood ? `Mood: ${log.mood}. ` : ''}
                    {log.energy ? `Energy: ${log.energy}/5.` : ''}
                  </p>
                  {log.symptoms?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {log.symptoms.map((symptom, index) => (
                        <span key={`${symptom.type}-${index}`} className="rounded-full bg-white px-2 py-1 text-xs font-bold text-muted">
                          {symptom.type.replace(/_/g, ' ')} {symptom.severity}/5
                        </span>
                      ))}
                    </div>
                  )}
                  {log.notes && <p className="mt-2 text-sm leading-6 text-muted">{log.notes}</p>}
                </div>
              ))}
            </div>
          </article>

          <article className="flow-card p-5">
            <h2 className="section-title">Legend</h2>
            <div className="mt-4 space-y-3 text-sm font-bold text-muted">
              <p className="flex items-center gap-2">
                <Droplet className="h-4 w-4 fill-danger text-danger" aria-hidden="true" /> Logged period
              </p>
              <p className="flex items-center gap-2">
                <Circle className="h-4 w-4 fill-clinical-blue text-clinical-blue" aria-hidden="true" /> Logged symptom
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sunrise" aria-hidden="true" /> Predicted window
              </p>
            </div>
            <div className="mt-4 rounded-lg bg-mist p-3">
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-muted">Prediction confidence</p>
              <p className="mt-1 text-lg font-extrabold text-ink">{predictions?.confidence ? `${predictions.confidence}%` : '--'}</p>
              <p className="card-meta">{predictions?.basis || 'Add more cycles to improve estimates.'}</p>
            </div>
          </article>
        </aside>
      </section>

      {isLoading && <p className="text-sm font-semibold text-muted">Refreshing calendar data...</p>}
    </div>
  );
};

export default Calendar;
