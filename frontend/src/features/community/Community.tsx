import React from 'react';

const Community: React.FC = () => {
  return (
    <div className="space-y-6 animate-fadeInUp">
      <section className="bloom-card p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Community</p>
        <h1 className="bloom-title mt-2">A safer space to learn and share</h1>
        <p className="mt-3 max-w-2xl text-base text-muted">
          Community features are in progress. This area will support moderated discussion circles
          and topic-based resources.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <article className="bloom-card p-5">
          <h3 className="font-display text-2xl text-ink">Topic circles</h3>
          <p className="mt-2 text-base text-muted">Join focused groups around symptoms, routines, and wellbeing.</p>
        </article>
        <article className="bloom-card p-5">
          <h3 className="font-display text-2xl text-ink">Guided moderation</h3>
          <p className="mt-2 text-base text-muted">Conversation quality and privacy-first defaults by design.</p>
        </article>
      </section>
    </div>
  );
};

export default Community;
