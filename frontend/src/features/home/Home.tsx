import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-display text-deep-indigo mb-6">
          Welcome to Flowelle
        </h1>
        <p className="text-xl mb-8">
          Track your cycle, understand your body, and make informed decisions about your health.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-display text-rose-quartz mb-4">Track</h2>
            <p className="mb-4">Log your cycle, symptoms, and mood to build a complete picture of your health.</p>
            <Link
              to="/calendar"
              className="inline-block bg-rose-quartz text-white px-4 py-2 rounded-md hover:bg-opacity-90"
            >
              Start Tracking
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-display text-rose-quartz mb-4">Learn</h2>
            <p className="mb-4">Get personalized insights and predictions based on your unique patterns.</p>
            <Link
              to="/insights"
              className="inline-block bg-rose-quartz text-white px-4 py-2 rounded-md hover:bg-opacity-90"
            >
              View Insights
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-display text-rose-quartz mb-4">Connect</h2>
            <p className="mb-4">Join our community of users and share experiences in a safe space.</p>
            <Link
              to="/community"
              className="inline-block bg-rose-quartz text-white px-4 py-2 rounded-md hover:bg-opacity-90"
            >
              Join Community
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 