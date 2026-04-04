import { Link, useLocation } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';

const AppShell = ({ children }) => {
  const location = useLocation();
  const { user, session, logout } = useAppContext();

  const navItems = [
    { to: '/pos', label: 'Floor' },
    { to: '/orders', label: 'Orders' },
    { to: '/history', label: 'History' },
    { to: '/payment', label: 'Payment' }
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-600">
                POS Cafe
              </p>
              <h1 className="mt-2 text-2xl font-medium text-slate-950">Cashier POS</h1>
              <p className="mt-1 text-sm text-slate-500">
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
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                      active
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                className="rounded-lg bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-200"
                onClick={logout}
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="mt-4">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
