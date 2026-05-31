import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { differenceInDays, format, parseISO } from 'date-fns';
import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getCurrentCycle, getDailyLogs, getPredictions } from '../../store/slices/cycleSlice';
import { formatDate, getCycleDay, getPhase, latestLogs, phaseCopy } from '../common/cycleUi';

const Today: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentCycle, predictions, dailyLogs, isLoading, error } = useAppSelector((state) => state.cycle);
  const { user, privacy } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(getCurrentCycle());
      dispatch(getPredictions());
      dispatch(getDailyLogs(undefined));
    }
  }, [dispatch, user?.id]);

  const cycleDay = getCycleDay(currentCycle);
  const cycleLength = currentCycle?.cycleLength ?? 28;
  const progress = cycleDay ? Math.min(100, Math.round((cycleDay / cycleLength) * 100)) : 0;
  const phase = getPhase(currentCycle);
  const phaseMeta = phaseCopy[phase];
  const daysToPeriod = predictions?.nextPeriod
    ? Math.max(0, differenceInDays(parseISO(predictions.nextPeriod), new Date()))
    : null;
  const recentLogs = latestLogs(dailyLogs);

  return (
    <div className="flow-page">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="card-label">{format(new Date(), 'EEEE, MMM d')}</p>
          <h1 className="page-title">Today</h1>
          <p className="page-subtitle">
            A private, low-friction view of what is logged, what is predicted, and what needs review.
          </p>
        </div>
        <Link to="/privacy" className="flow-btn-secondary self-start sm:self-auto">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          Privacy center
        </Link>
      </header>

      {error && <div className="flow-panel border-[#f2b8c2] bg-[#fff4f5] p-4 text-sm font-semibold text-danger">{error}</div>}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <article className="flow-card p-5 sm:p-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex justify-center md:w-72">
              <div
                className="flex h-56 w-56 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#2d6f8f ${progress * 3.6}deg, #e7ecef 0deg)`,
                }}
                aria-label={cycleDay ? `Cycle day ${cycleDay} of ${cycleLength}` : 'Cycle day unavailable'}
              >
                <div className="flex h-44 w-44 flex-col items-center justify-center rounded-full bg-white text-center">
                  <span className="text-sm font-bold uppercase tracking-[0.12em] text-muted">Cycle</span>
                  <span className="mt-1 text-4xl font-extrabold text-ink">{cycleDay ? `Day ${cycleDay}` : '--'}</span>
                  <span className="mt-1 text-sm font-bold text-muted">of {cycleLength}</span>
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <span className={`phase-pill ${phaseMeta.tone}`}>{phaseMeta.label}</span>
              <h2 className="mt-3 text-2xl font-extrabold leading-tight text-ink">
                {daysToPeriod !== null ? `Next predicted period in ${daysToPeriod} days` : 'Add a period start to build predictions'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-muted">{phaseMeta.description}</p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-line bg-mist p-3">
                  <p className="card-label">Next period</p>
                  <p className="card-value">{formatDate(predictions?.nextPeriod)}</p>
                  <p className="card-meta">{predictions?.isPredicted ? 'Predicted' : 'No prediction'}</p>
                </div>
                <div className="rounded-lg border border-line bg-mist p-3">
                  <p className="card-label">Confidence</p>
                  <p className="card-value">{predictions?.confidence ? `${predictions.confidence}%` : '--'}</p>
                  <p className="card-meta">{predictions?.basis || 'Needs more data'}</p>
                </div>
                <div className="rounded-lg border border-line bg-mist p-3">
                  <p className="card-label">AI use</p>
                  <p className="card-value">{privacy?.aiCoachEnabled ? 'On' : 'Off'}</p>
                  <p className="card-meta">Always review before saving</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <aside className="flow-card p-5 sm:p-6">
          <h2 className="section-title">Quick actions</h2>
          <p className="card-meta">Designed for one-handed logging and explicit consent.</p>
          <div className="mt-4 grid gap-3">
            <Link to="/log" className="flow-btn-primary justify-between">
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="h-4 w-4" aria-hidden="true" />
                Add a log
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/calendar" className="flow-btn-secondary justify-between">
              <span className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                Check calendar
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link to="/coach" className="flow-btn-secondary justify-between">
              <span className="inline-flex items-center gap-2">
                <Bot className="h-4 w-4" aria-hidden="true" />
                Ask private coach
              </span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 rounded-lg border border-line bg-soft-cyan p-4">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-clinical-blue" aria-hidden="true" />
              <div>
                <p className="text-sm font-extrabold text-ink">Privacy status</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                  Analytics {privacy?.analyticsOptIn ? 'opted in' : 'off'} · Voice{' '}
                  {privacy?.voiceProcessingEnabled ? 'allowed' : 'requires consent'}.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <article className="flow-card p-5">
          <h2 className="section-title">Recent logs</h2>
          <p className="card-meta">Actual entries, separate from predictions.</p>
          <div className="mt-4 space-y-3">
            {isLoading && <p className="text-sm font-semibold text-muted">Loading health data...</p>}
            {!isLoading && recentLogs.length === 0 && (
              <div className="rounded-lg border border-dashed border-line p-4 text-sm font-semibold text-muted">
                No daily logs yet. Add a period, symptom, mood, or note to start seeing patterns.
              </div>
            )}
            {recentLogs.map((log) => (
              <div key={log.id || `${log.date}-${log.createdAt}`} className="rounded-lg border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-extrabold text-ink">{formatDate(log.date, 'MMM d, yyyy')}</p>
                    <p className="mt-1 text-sm font-semibold text-muted">
                      {log.periodFlow ? `${log.periodFlow} flow` : 'Daily check-in'}
                      {log.mood ? ` · ${log.mood}` : ''}
                      {log.energy ? ` · energy ${log.energy}/5` : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold uppercase text-muted">
                    {log.source || 'manual'}
                  </span>
                </div>
                {log.symptoms?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {log.symptoms.map((symptom, index) => (
                      <span key={`${symptom.type}-${index}`} className="rounded-full bg-soft-peach px-2.5 py-1 text-xs font-bold text-danger">
                        {symptom.type.replace(/_/g, ' ')} {symptom.severity}/5
                      </span>
                    ))}
                  </div>
                )}
                {log.notes && <p className="mt-3 text-sm leading-6 text-muted">{log.notes}</p>}
              </div>
            ))}
          </div>
        </article>

        <article className="flow-card p-5">
          <h2 className="section-title">Trust cues</h2>
          <p className="card-meta">Flowelle should make uncertainty visible instead of hiding it in decoration.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ['Logged facts', 'Period starts, symptoms, flow, mood, and notes you saved.'],
              ['Predictions', 'Cycle windows estimated from your history and marked with confidence.'],
              ['AI drafts', 'Coach and voice can draft entries, but you confirm before saving.'],
            ].map(([title, body]) => (
              <div key={title} className="rounded-lg border border-line bg-mist p-4">
                <CheckCircle2 className="h-5 w-5 text-sage-green" aria-hidden="true" />
                <p className="mt-3 text-sm font-extrabold text-ink">{title}</p>
                <p className="mt-1 text-sm font-medium leading-6 text-muted">{body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Today;
