import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
      <div className="bloom-card w-full max-w-5xl p-8 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Flowelle</p>
        <h1 className="bloom-title mt-2 text-4xl">Your cycle, seen with clarity</h1>
        <p className="mt-4 max-w-2xl text-base text-muted">
          Track symptoms, view predictions, and understand patterns in a calm dashboard experience.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="bloom-card p-5">
            <h2 className="font-display text-2xl text-ink">Track</h2>
            <p className="mt-2 text-base text-muted">Log cycle events and symptoms quickly.</p>
            <Link to="/calendar" className="flow-btn-primary mt-4">
              Open Dashboard
            </Link>
          </article>

          <article className="bloom-card p-5">
            <h2 className="font-display text-2xl text-ink">Learn</h2>
            <p className="mt-2 text-base text-muted">Follow hormone patterns and upcoming windows.</p>
            <Link to="/insights" className="flow-btn-secondary mt-4">
              View Insights
            </Link>
          </article>

          <article className="bloom-card p-5">
            <h2 className="font-display text-2xl text-ink">Connect</h2>
            <p className="mt-2 text-base text-muted">Join curated community circles when launched.</p>
            <Link to="/community" className="flow-btn-secondary mt-4">
              Community
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Home;
