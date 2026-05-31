import React, { useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { Activity, AlertTriangle, ClipboardCheck, Download, LineChart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { getCycleHistory, getDailyLogs, getPredictions } from '../../store/slices/cycleSlice';
import { formatDate } from '../common/cycleUi';

const Insights: React.FC = () => {
  const dispatch = useAppDispatch();
  const { cycleHistory, dailyLogs, predictions } = useAppSelector((state) => state.cycle);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (user?.id) {
      dispatch(getCycleHistory());
      dispatch(getPredictions());
      dispatch(getDailyLogs(undefined));
    }
  }, [dispatch, user?.id]);

  const stats = useMemo(() => {
    const cycleLengths = cycleHistory.map((cycle) => Number(cycle.cycleLength || 0)).filter(Boolean);
    const periodLengths = cycleHistory.map((cycle) => Number(cycle.periodLength || 0)).filter(Boolean);
    const averageCycle = cycleLengths.length
      ? Math.round(cycleLengths.reduce((sum, value) => sum + value, 0) / cycleLengths.length)
      : user?.cycleLength || 28;
    const averagePeriod = periodLengths.length
      ? Math.round(periodLengths.reduce((sum, value) => sum + value, 0) / periodLengths.length)
      : user?.periodLength || 5;
    const variation = cycleLengths.length > 1 ? Math.max(...cycleLengths) - Math.min(...cycleLengths) : 0;
    const symptomCounts = new Map<string, number>();
    dailyLogs.forEach((log) => {
      log.symptoms?.forEach((symptom) => {
        const label = symptom.type.replace(/_/g, ' ');
        symptomCounts.set(label, (symptomCounts.get(label) || 0) + 1);
      });
    });

    return {
      averageCycle,
      averagePeriod,
      variation,
      logCount: dailyLogs.length,
      periodLogCount: dailyLogs.filter((log) => Boolean(log.periodFlow)).length,
      topSymptoms: Array.from(symptomCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      latestCycle: [...cycleHistory].sort(
        (a, b) => parseISO(b.startDate).getTime() - parseISO(a.startDate).getTime()
      )[0],
    };
  }, [cycleHistory, dailyLogs, user?.cycleLength, user?.periodLength]);

  return (
    <div className="flow-page">
      <header>
        <p className="card-label">Pattern review</p>
        <h1 className="page-title">Insights</h1>
        <p className="page-subtitle">
          Flowelle summarizes your own logs and labels estimates clearly. It does not diagnose, prescribe, or claim hormone levels.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Average cycle', `${stats.averageCycle} days`, 'Based on saved cycle lengths.'],
          ['Average period', `${stats.averagePeriod} days`, 'Based on saved period lengths.'],
          ['Cycle variation', `${stats.variation} days`, stats.variation > 7 ? 'Variation worth monitoring.' : 'Within your recorded range.'],
          ['Daily logs', `${stats.logCount}`, `${stats.periodLogCount} include flow.`],
        ].map(([label, value, meta]) => (
          <article key={label} className="flow-card p-5">
            <p className="card-label">{label}</p>
            <p className="card-value">{value}</p>
            <p className="card-meta">{meta}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
        <article className="flow-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <LineChart className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
            <h2 className="section-title">Logged pattern signals</h2>
          </div>
          <div className="mt-5 space-y-4">
            {stats.topSymptoms.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line p-4 text-sm font-semibold text-muted">
                No symptom pattern yet. Add symptoms across several days to build this view.
              </div>
            ) : (
              stats.topSymptoms.map(([symptom, count]) => (
                <div key={symptom}>
                  <div className="mb-2 flex items-center justify-between text-sm font-bold">
                    <span className="capitalize text-ink">{symptom}</span>
                    <span className="text-muted">{count} log{count === 1 ? '' : 's'}</span>
                  </div>
                  <div className="h-2 rounded-full bg-mist">
                    <div
                      className="h-2 rounded-full bg-clinical-blue"
                      style={{ width: `${Math.min(100, (count / Math.max(1, stats.logCount)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <aside className="space-y-4">
          <article className="flow-card p-5">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-sage-green" aria-hidden="true" />
              <h2 className="section-title">Prediction quality</h2>
            </div>
            <p className="card-value">{predictions?.confidence ? `${predictions.confidence}%` : '--'}</p>
            <p className="card-meta">{predictions?.basis || 'Add period starts to build predictions.'}</p>
            <div className="mt-4 rounded-lg bg-mist p-3">
              <p className="text-sm font-extrabold text-ink">Next predicted period</p>
              <p className="mt-1 text-sm font-semibold text-muted">{formatDate(predictions?.nextPeriod, 'MMMM d, yyyy')}</p>
            </div>
          </article>

          <article className="flow-card border-[#f1d39a] bg-[#fffaf0] p-5">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-sunrise" aria-hidden="true" />
              <div>
                <h2 className="text-base font-extrabold text-ink">When to seek care</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-muted">
                  Severe pain, very heavy bleeding, fainting, infection symptoms, pregnancy concerns, or sudden changes should be discussed with a qualified healthcare professional.
                </p>
              </div>
            </div>
          </article>
        </aside>
      </section>

      <section className="flow-card p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
              <h2 className="section-title">Clinician summary</h2>
            </div>
            <p className="card-meta">A concise, non-diagnostic summary you can export from Privacy Center.</p>
          </div>
          <button className="flow-btn-secondary" type="button">
            <Download className="h-4 w-4" aria-hidden="true" />
            Use Privacy export
          </button>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-line bg-mist p-4">
            <p className="card-label">Latest period start</p>
            <p className="mt-2 text-lg font-extrabold text-ink">
              {stats.latestCycle ? format(parseISO(stats.latestCycle.startDate), 'MMM d, yyyy') : '--'}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-mist p-4">
            <p className="card-label">Common symptoms</p>
            <p className="mt-2 text-sm font-bold leading-6 text-ink">
              {stats.topSymptoms.length ? stats.topSymptoms.map(([symptom]) => symptom).join(', ') : 'Not enough data'}
            </p>
          </div>
          <div className="rounded-lg border border-line bg-mist p-4">
            <p className="card-label">Recorded range</p>
            <p className="mt-2 text-sm font-bold leading-6 text-ink">
              {cycleHistory.length} cycle{cycleHistory.length === 1 ? '' : 's'} · {dailyLogs.length} daily log{dailyLogs.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Insights;
