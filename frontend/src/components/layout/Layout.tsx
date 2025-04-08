import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-cream">
      <nav className="bg-deep-indigo text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="font-display text-2xl">
                Flowelle
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/calendar"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-rose-quartz hover:text-white"
                >
                  Calendar
                </Link>
                <Link
                  to="/insights"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-rose-quartz hover:text-white"
                >
                  Insights
                </Link>
                <Link
                  to="/community"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-rose-quartz hover:text-white"
                >
                  Community
                </Link>
                <Link
                  to="/profile"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-rose-quartz hover:text-white"
                >
                  Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="bg-deep-indigo text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="text-center">
            <p className="text-sm">
              © {new Date().getFullYear()} Flowelle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 