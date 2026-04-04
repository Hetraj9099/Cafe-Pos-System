import { Link, useLocation } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';

const AppShell = ({ children }) => {
  const location = useLocation();
  const { user, session, logout } = useAppContext();

  const navItems = [
    { to: '/pos', label: 'Floor' },
    { to: '/orders', label: 'Orders' },
    { to: '/payment', label: 'Payment' }
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffef8_0%,#eef2ff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-slate-200 bg-white/95 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-600">
                POS Cafe
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950">Cashier Control</h1>
              <p className="mt-2 text-sm text-slate-600">
                Signed in as {user?.name || 'Guest'}{session ? ' with an open session' : ''}.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {navItems.map((item) => {
                const active =
                  item.to === '/pos'
                    ? location.pathname === '/' || location.pathname === '/pos'
                    : location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      active ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
