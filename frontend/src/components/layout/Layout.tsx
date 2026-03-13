import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';

type NavItem = {
  label: string;
  to: string;
  icon: string;
};

const primaryNav: NavItem[] = [
  { label: 'Dashboard', to: '/calendar', icon: '◫' },
  { label: 'Log Period', to: '/log-period', icon: '◔' },
  { label: 'Symptoms', to: '/symptoms', icon: '∿' },
  { label: 'Insights', to: '/insights', icon: '✦' },
  { label: 'Library', to: '/library', icon: '◍' },
];

const secondaryNav: NavItem[] = [
  { label: 'Community', to: '/community', icon: '◎' },
  { label: 'Profile', to: '/profile', icon: '◌' },
];

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-white text-ink shadow-[0_8px_24px_rgba(31,47,70,0.08)]'
        : 'text-muted hover:bg-white/70 hover:text-deep-indigo'
    }`;

  const mobileNavClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
      isActive ? 'bg-soft-peach text-rose-quartz' : 'bg-white text-muted border border-line'
    }`;

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="relative hidden min-h-screen w-80 border-r border-line bg-gradient-to-b from-[#fdfbff] via-[#f9f7fb] to-[#f7f3fa] px-7 py-8 lg:flex lg:flex-col">
          <div className="pointer-events-none absolute -right-24 top-24 h-52 w-52 rounded-full bg-[#f0dcf2] opacity-60 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-8 h-44 w-44 rounded-full bg-[#dfeefe] opacity-55 blur-3xl" />

          <div className="relative mb-8 flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ef6cae] to-[#9d62f3] text-2xl text-white shadow-soft">
              ♡
            </div>
            <div>
              <h1 className="font-display text-[1.9rem] leading-none text-ink">Flowelle</h1>
              <p className="mt-1 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-muted">Cycle Tracker</p>
            </div>
          </div>

          <nav className="relative space-y-2">
            {primaryNav.map((item) => (
              <NavLink key={item.label} to={item.to} className={navClass}>
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-current/25 text-sm">
                  {item.icon}
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="relative mt-6 border-t border-line pt-6">
            <nav className="space-y-2">
              {secondaryNav.map((item) => (
                <NavLink key={item.label} to={item.to} className={navClass}>
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-current/25 text-sm">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="relative mt-auto space-y-4 border-t border-line pt-6">
            <button onClick={handleLogout} className="flow-btn-primary w-full">
              Logout
            </button>
            <p className="text-center text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-muted">
              Track • Understand • Thrive
            </p>
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-line bg-cream/95 px-4 py-4 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl text-ink">Flowelle</h1>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Cycle Tracker</p>
              </div>
              <button onClick={handleLogout} className="flow-btn-primary px-4 py-2 text-sm">
                Logout
              </button>
            </div>
            <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {[...primaryNav, ...secondaryNav].map((item) => (
                <NavLink key={`m-${item.label}`} to={item.to} className={mobileNavClass}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </header>

          <main className="px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
