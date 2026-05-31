import React, { useState } from 'react';
import { format } from 'date-fns';
import { AlertTriangle, Bot, CheckCircle2, LockKeyhole, MessageSquareText, ShieldCheck } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { updatePrivacySettings } from '../../store/slices/authSlice';
import { createCoachRealtimeSession } from '../../services/realtime.service';

const coachPrompts = [
  'Explain what my predicted window means without medical certainty.',
  'Help me phrase a symptom note for review.',
  'What patterns should I track before my next appointment?',
  'How does Flowelle separate predictions from logged facts?',
];

const Coach: React.FC = () => {
  const dispatch = useAppDispatch();
  const { privacy } = useAppSelector((state) => state.auth);
  const { predictions, dailyLogs } = useAppSelector((state) => state.cycle);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const enableCoach = async () => {
    setError(null);
    await dispatch(updatePrivacySettings({ aiCoachEnabled: true })).unwrap();
  };

  const startCoachSession = async () => {
    setError(null);
    setStatus('Creating a private coach session...');
    try {
      await createCoachRealtimeSession(format(new Date(), 'yyyy-MM-dd'));
      setStatus('Coach session is available. The next step is a reviewed draft or educational response, never an automatic save.');
    } catch (err) {
      setStatus(null);
      setError(err instanceof Error ? err.message : 'Unable to create coach session.');
    }
  };

  return (
    <div className="flow-page">
      <header>
        <p className="card-label">Opt-in AI</p>
        <h1 className="page-title">Private Coach</h1>
        <p className="page-subtitle">
          Educational guidance for patterns, logging, and privacy. It is not a diagnostic, contraceptive, or treatment tool.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="flow-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
            <h2 className="section-title">Coach consent</h2>
          </div>
          <p className="card-meta">
            Coach mode uses only consented context. It can draft language or explain patterns, but it cannot save data by itself.
          </p>

          {!privacy?.aiCoachEnabled ? (
            <div className="mt-5 rounded-lg border border-line bg-soft-cyan p-4">
              <ShieldCheck className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
              <p className="mt-3 text-sm font-extrabold text-ink">AI coach is off</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                Enable it to create coach sessions. You can turn it off from Privacy Center.
              </p>
              <button type="button" onClick={enableCoach} className="flow-btn-primary mt-4">
                Enable coach
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-line bg-mist p-4">
                <CheckCircle2 className="h-5 w-5 text-sage-green" aria-hidden="true" />
                <p className="mt-3 text-sm font-extrabold text-ink">Coach enabled</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                  Session context is minimized. Review any draft before saving it as a log.
                </p>
              </div>
              <button type="button" onClick={startCoachSession} className="flow-btn-primary">
                <MessageSquareText className="h-4 w-4" aria-hidden="true" />
                Start private session
              </button>
              {status && <p className="rounded-lg bg-soft-cyan p-3 text-sm font-bold text-clinical-blue">{status}</p>}
              {error && <p className="rounded-lg bg-[#fff4f5] p-3 text-sm font-bold text-danger">{error}</p>}
            </div>
          )}
        </article>

        <article className="flow-card p-5 sm:p-6">
          <h2 className="section-title">What the coach can do</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {coachPrompts.map((prompt) => (
              <button key={prompt} type="button" className="rounded-lg border border-line bg-white p-4 text-left text-sm font-bold leading-6 text-ink transition hover:border-clinical-blue hover:bg-mist">
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-line bg-mist p-4">
              <p className="card-label">Latest logs</p>
              <p className="card-value">{dailyLogs.length}</p>
              <p className="card-meta">Used only if consented.</p>
            </div>
            <div className="rounded-lg border border-line bg-mist p-4">
              <p className="card-label">Prediction</p>
              <p className="card-value">{predictions?.confidence ? `${predictions.confidence}%` : '--'}</p>
              <p className="card-meta">Always marked as estimate.</p>
            </div>
            <div className="rounded-lg border border-line bg-mist p-4">
              <p className="card-label">Saving</p>
              <p className="card-value">Manual</p>
              <p className="card-meta">No automatic writes.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="flow-card border-[#f1d39a] bg-[#fffaf0] p-5">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-sunrise" aria-hidden="true" />
          <div>
            <h2 className="text-base font-extrabold text-ink">Medical boundary</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-muted">
              The coach should redirect severe pain, very heavy bleeding, fainting, pregnancy concerns, infection symptoms, or urgent risks to qualified care.
            </p>
          </div>
        </div>
      </section>

      <section className="flow-card p-5">
        <div className="flex items-start gap-3">
          <LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-clinical-blue" aria-hidden="true" />
          <div>
            <h2 className="text-base font-extrabold text-ink">Data minimization</h2>
            <p className="mt-1 text-sm font-semibold leading-6 text-muted">
              Coach mode should receive only the smallest useful summary, not your full raw timeline by default.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Coach;
