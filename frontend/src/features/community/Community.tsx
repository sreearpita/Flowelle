import React, { useState } from 'react';
import { Flag, MessageCircle, ShieldCheck, UserRoundX } from 'lucide-react';

const circles = [
  ['Cycle basics', 'Low-risk questions about tracking, reminders, and app workflows.'],
  ['Symptom routines', 'Share non-medical routines and logging habits, never diagnoses.'],
  ['Care preparation', 'Discuss how to summarize patterns before professional care.'],
];

const Community: React.FC = () => {
  const [joined, setJoined] = useState(false);

  return (
    <div className="flow-page">
      <header>
        <p className="card-label">Anonymous by default</p>
        <h1 className="page-title">Community</h1>
        <p className="page-subtitle">
          A moderated, privacy-first concept for topic circles. No cycle timeline data is shared by default.
        </p>
      </header>

      <section className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <article className="flow-card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
            <h2 className="section-title">Consent gate</h2>
          </div>
          <p className="card-meta">
            Community should require a separate consent step and make anonymity, moderation, and reporting visible.
          </p>
          <div className="mt-5 space-y-3 rounded-lg border border-line bg-mist p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <UserRoundX className="h-4 w-4 text-clinical-blue" aria-hidden="true" />
              Profile defaults to anonymous display
            </p>
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Flag className="h-4 w-4 text-clinical-blue" aria-hidden="true" />
              Report controls are available on every post
            </p>
          </div>
          <button type="button" onClick={() => setJoined(true)} className="flow-btn-primary mt-5">
            I understand and want to preview
          </button>
          {joined && <p className="mt-3 text-sm font-bold text-sage-green">Preview enabled for this session.</p>}
        </article>

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-1">
          {circles.map(([title, description]) => (
            <article key={title} className="flow-card p-5">
              <MessageCircle className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
              <h2 className="mt-3 text-lg font-extrabold text-ink">{title}</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-muted">{description}</p>
              <button type="button" disabled={!joined} className="flow-btn-secondary mt-4">
                {joined ? 'Open circle' : 'Consent required'}
              </button>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
};

export default Community;
