import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Bot,
  CalendarDays,
  ClipboardList,
  HeartPulse,
  Home,
  Library,
  LockKeyhole,
  LogOut,
  MessageCircle,
  UserCircle,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { logout } from '../../store/slices/authSlice';

type NavItem = {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
};

const primaryNav: NavItem[] = [
  { label: 'Today', to: '/today', icon: Home },
  { label: 'Log', to: '/log', icon: ClipboardList },
  { label: 'Calendar', to: '/calendar', icon: CalendarDays },
  { label: 'Insights', to: '/insights', icon: HeartPulse },
  { label: 'Coach', to: '/coach', icon: Bot },
];

const secondaryNav: NavItem[] = [
  { label: 'Library', to: '/library', icon: Library },
  { label: 'Community', to: '/community', icon: MessageCircle },
  { label: 'Privacy', to: '/privacy', icon: LockKeyhole },
  { label: 'Profile', to: '/profile', icon: UserCircle },
];

const Layout: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, privacy } = useAppSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-bold transition ${
      isActive ? 'bg-soft-cyan text-clinical-blue' : 'text-muted hover:bg-mist hover:text-ink'
    }`;

  const bottomNavClass = ({ isActive }: { isActive: boolean }) =>
    `flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 rounded-lg text-[0.68rem] font-bold transition ${
      isActive ? 'text-clinical-blue' : 'text-muted'
    }`;

  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-72 shrink-0 border-r border-line bg-white px-4 py-5 lg:flex lg:flex-col">
          <div className="mb-5 flex items-center gap-3 px-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-clinical-blue text-white">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none text-ink">Flowelle</p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                Privacy tracker
              </p>
            </div>
          </div>

          <nav aria-label="Primary navigation" className="space-y-1">
            {primaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.label} to={item.to} className={navClass}>
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-5 border-t border-line pt-5">
            <p className="mb-2 px-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">More</p>
            <nav aria-label="Secondary navigation" className="space-y-1">
              {secondaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={item.label} to={item.to} className={navClass}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto rounded-xl border border-line bg-mist p-3">
            <p className="text-sm font-bold text-ink">{user?.firstName ? `${user.firstName}'s data` : 'Your data'}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-muted">
              AI coach {privacy?.aiCoachEnabled ? 'enabled' : 'off'} · Analytics{' '}
              {privacy?.analyticsOptIn ? 'on' : 'off'}
            </p>
            <button onClick={handleLogout} className="flow-btn-secondary mt-3 w-full">
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Log out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-24 lg:pb-0">
          <header className="sticky top-0 z-20 border-b border-line bg-cream/95 px-4 py-3 backdrop-blur lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-lg font-extrabold leading-none text-ink">Flowelle</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-muted">Privacy tracker</p>
              </div>
              <button onClick={handleLogout} className="flow-btn-secondary min-h-10 px-3" aria-label="Log out">
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </header>

          <main>
            <Outlet />
          </main>

          <nav
            aria-label="Primary navigation"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-2 shadow-[0_-12px_28px_rgba(23,35,58,0.08)] lg:hidden"
          >
            <div className="mx-auto flex max-w-xl gap-1">
              {primaryNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink key={`mobile-${item.label}`} to={item.to} className={bottomNavClass}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Layout;
