import React, { useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Mic, Save, ShieldCheck, Square, Waves } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createCycle, getCurrentCycle, getDailyLogs, saveDailyLog } from '../../store/slices/cycleSlice';
import { updatePrivacySettings } from '../../store/slices/authSlice';
import {
  startVoiceCheckIn,
  VoiceCheckInConnection,
  VoiceCheckInStatus,
  VoiceSymptomReview,
} from '../../services/realtime.service';
import { DailyLog, Symptom } from '../../types/cycle';

const symptomOptions = [
  'cramps',
  'headache',
  'fatigue',
  'bloating',
  'breast_tenderness',
  'mood_changes',
  'anxiety',
  'stress',
  'irritability',
  'brain_fog',
  'low_motivation',
];

const voiceStatusCopy: Record<VoiceCheckInStatus, string> = {
  idle: 'Ready when you are.',
  'requesting-mic': 'Requesting microphone access.',
  listening: 'Listening. Mention symptom, date, severity, and any note.',
  processing: 'Preparing a review card.',
  review: 'Review before saving.',
  error: 'Voice check-in needs attention.',
};

const Log: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentCycle, isLoading, error } = useAppSelector((state) => state.cycle);
  const { user, privacy } = useAppSelector((state) => state.auth);
  const voiceConnectionRef = useRef<VoiceCheckInConnection | null>(null);

  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    periodStarted: false,
    periodFlow: '',
    symptomType: '',
    severity: 3,
    mood: '',
    energy: 3,
    notes: '',
  });
  const [actionError, setActionError] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [voiceStatus, setVoiceStatus] = useState<VoiceCheckInStatus>('idle');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceReview, setVoiceReview] = useState<VoiceSymptomReview | null>(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(getCurrentCycle());
    }
    return () => {
      voiceConnectionRef.current?.stop();
    };
  }, [dispatch, user?.id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setActionError(null);
    setSavedMessage(null);

    try {
      let cycleId = currentCycle?.id;
      if (form.periodStarted) {
        const created = await dispatch(
          createCycle({
            startDate: form.date,
            cycleLength: user?.cycleLength || currentCycle?.cycleLength || 28,
            periodLength: user?.periodLength || currentCycle?.periodLength || 5,
            notes: form.periodFlow ? `Flow: ${form.periodFlow}. ${form.notes}`.trim() : form.notes || undefined,
          })
        ).unwrap();
        cycleId = created.id;
      }

      const symptoms: Symptom[] = form.symptomType
        ? [
            {
              cycleId: cycleId || '',
              date: form.date,
              type: form.symptomType,
              severity: Number(form.severity),
              notes: form.notes || undefined,
            },
          ]
        : [];

      const dailyLog: DailyLog = {
        date: form.date,
        cycleId,
        periodFlow: form.periodFlow as DailyLog['periodFlow'],
        symptoms,
        mood: form.mood || undefined,
        energy: Number(form.energy),
        notes: form.notes || undefined,
        source: 'manual',
      };

      await dispatch(saveDailyLog(dailyLog)).unwrap();
      await dispatch(getDailyLogs(undefined));
      setSavedMessage('Log saved. Predictions and insights will use it once refreshed.');
      setForm((prev) => ({
        ...prev,
        periodStarted: false,
        periodFlow: '',
        symptomType: '',
        severity: 3,
        mood: '',
        energy: 3,
        notes: '',
      }));
    } catch {
      setActionError('Unable to save this log right now. Review the fields and try again.');
    }
  };

  const handleEnableVoice = async () => {
    await dispatch(updatePrivacySettings({ voiceProcessingEnabled: true }));
  };

  const handleStartVoice = async () => {
    setVoiceError(null);
    setVoiceReview(null);
    setVoiceTranscript('');

    try {
      voiceConnectionRef.current?.stop();
      voiceConnectionRef.current = await startVoiceCheckIn({
        onStatusChange: setVoiceStatus,
        onReview: setVoiceReview,
        onTranscriptChange: setVoiceTranscript,
        onError: setVoiceError,
      });
    } catch (err) {
      setVoiceStatus('error');
      setVoiceError(err instanceof Error ? err.message : 'Unable to start voice check-in.');
    }
  };

  const handleSaveVoiceReview = async () => {
    if (!voiceReview) {
      return;
    }
    try {
      await dispatch(
        saveDailyLog({
          date: voiceReview.date,
          cycleId: currentCycle?.id,
          symptoms: voiceReview.symptoms.map((symptom) => ({
            cycleId: currentCycle?.id || '',
            date: voiceReview.date,
            type: symptom.type,
            severity: symptom.severity,
            notes: symptom.notes,
          })),
          source: 'voice',
        })
      ).unwrap();
      await dispatch(getDailyLogs(undefined));
      voiceConnectionRef.current?.stop();
      setVoiceStatus('idle');
      setVoiceReview(null);
      setVoiceTranscript('');
      setSavedMessage('Voice draft saved after review.');
    } catch {
      setVoiceError('Unable to save the reviewed voice draft.');
    }
  };

  return (
    <div className="flow-page">
      <header>
        <p className="card-label">Unified logging</p>
        <h1 className="page-title">Log</h1>
        <p className="page-subtitle">
          Record period starts, flow, symptoms, mood, energy, and notes in one place. Voice drafts never save without review.
        </p>
      </header>

      {(error || actionError) && (
        <div className="flow-panel border-[#f2b8c2] bg-[#fff4f5] p-4 text-sm font-semibold text-danger">
          {actionError || error}
        </div>
      )}
      {savedMessage && (
        <div className="flow-panel border-[#b7e1cf] bg-[#f0fbf6] p-4 text-sm font-semibold text-[#17704f]">
          {savedMessage}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1fr_0.85fr]">
        <form onSubmit={handleSave} className="flow-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Waves className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
            <h2 className="section-title">Manual entry</h2>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-ink">
              Date
              <input
                type="date"
                value={form.date}
                onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))}
                className="flow-input"
              />
            </label>

            <label className="flex min-h-11 items-center gap-3 rounded-lg border border-line bg-mist px-3 py-2 text-sm font-bold text-ink md:mt-6">
              <input
                type="checkbox"
                checked={form.periodStarted}
                onChange={(event) => setForm((prev) => ({ ...prev, periodStarted: event.target.checked }))}
                className="h-5 w-5 accent-clinical-blue"
              />
              Period started on this date
            </label>

            <label className="text-sm font-bold text-ink">
              Flow
              <select
                value={form.periodFlow}
                onChange={(event) => setForm((prev) => ({ ...prev, periodFlow: event.target.value }))}
                className="flow-input"
              >
                <option value="">No flow logged</option>
                <option value="spotting">Spotting</option>
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </label>

            <label className="text-sm font-bold text-ink">
              Symptom
              <select
                value={form.symptomType}
                onChange={(event) => setForm((prev) => ({ ...prev, symptomType: event.target.value }))}
                className="flow-input"
              >
                <option value="">No symptom</option>
                {symptomOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-sm font-bold text-ink">
              Severity {form.severity}/5
              <input
                type="range"
                min="1"
                max="5"
                value={form.severity}
                onChange={(event) => setForm((prev) => ({ ...prev, severity: Number(event.target.value) }))}
                className="mt-4 w-full accent-clinical-blue"
              />
            </label>

            <label className="text-sm font-bold text-ink">
              Energy {form.energy}/5
              <input
                type="range"
                min="1"
                max="5"
                value={form.energy}
                onChange={(event) => setForm((prev) => ({ ...prev, energy: Number(event.target.value) }))}
                className="mt-4 w-full accent-sage-green"
              />
            </label>

            <label className="text-sm font-bold text-ink md:col-span-2">
              Mood
              <input
                type="text"
                value={form.mood}
                onChange={(event) => setForm((prev) => ({ ...prev, mood: event.target.value }))}
                className="flow-input"
                placeholder="Calm, anxious, focused, low..."
              />
            </label>

            <label className="text-sm font-bold text-ink md:col-span-2">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
                className="flow-input min-h-28"
                placeholder="Optional context. Avoid entering anything you do not want stored."
              />
            </label>
          </div>

          <button type="submit" disabled={isLoading} className="flow-btn-primary mt-5">
            <Save className="h-4 w-4" aria-hidden="true" />
            Save log
          </button>
        </form>

        <aside className="flow-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
            <h2 className="section-title">Voice check-in</h2>
          </div>
          <p className="card-meta">
            Voice is opt-in. Flowelle sends audio for processing only after consent and returns a draft for review.
          </p>

          {!privacy?.voiceProcessingEnabled ? (
            <div className="mt-5 rounded-lg border border-line bg-soft-cyan p-4">
              <ShieldCheck className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
              <p className="mt-3 text-sm font-extrabold text-ink">Voice processing is off</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-muted">
                Enable it only if you want spoken check-ins processed for draft logs.
              </p>
              <button onClick={handleEnableVoice} className="flow-btn-primary mt-4" type="button">
                Enable voice
              </button>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-line bg-mist p-4">
                <p className="text-sm font-extrabold text-ink">{voiceStatusCopy[voiceStatus]}</p>
                {voiceTranscript && <p className="mt-2 text-sm leading-6 text-muted">{voiceTranscript}</p>}
              </div>
              {voiceError && <p className="text-sm font-bold text-danger">{voiceError}</p>}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStartVoice}
                  disabled={voiceStatus === 'requesting-mic' || voiceStatus === 'listening' || voiceStatus === 'processing'}
                  className="flow-btn-primary"
                >
                  <Mic className="h-4 w-4" aria-hidden="true" />
                  Start voice
                </button>
                {(voiceStatus === 'listening' || voiceStatus === 'processing') && (
                  <button type="button" onClick={() => voiceConnectionRef.current?.finish()} className="flow-btn-secondary">
                    <Square className="h-4 w-4" aria-hidden="true" />
                    Finish
                  </button>
                )}
              </div>

              {voiceReview && (
                <div className="rounded-lg border border-line bg-white p-4">
                  <p className="text-sm font-extrabold text-ink">Review draft for {voiceReview.date}</p>
                  <div className="mt-3 space-y-2">
                    {voiceReview.symptoms.map((symptom, index) => (
                      <div key={`${symptom.type}-${index}`} className="rounded-lg bg-mist p-3 text-sm font-semibold text-muted">
                        {symptom.type.replace(/_/g, ' ')} · severity {symptom.severity}/5
                        {symptom.notes ? ` · ${symptom.notes}` : ''}
                      </div>
                    ))}
                  </div>
                  <button onClick={handleSaveVoiceReview} type="button" className="flow-btn-primary mt-4">
                    Save reviewed draft
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </section>
    </div>
  );
};

export default Log;
