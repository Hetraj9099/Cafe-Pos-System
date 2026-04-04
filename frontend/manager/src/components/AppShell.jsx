import { Link, useLocation } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';

const AppShell = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAppContext();

  const navItems = [
    { to: '/manager', label: 'Dashboard' },
    { to: '/staff', label: 'Staff' }
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbff_0%,#ebf4ff_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-sky-100 bg-white/95 p-6 shadow-[0_24px_70px_rgba(14,165,233,0.1)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-700">
                Manager Console
              </p>
              <h1 className="mt-2 text-3xl font-bold text-sky-950">Operations dashboard</h1>
              <p className="mt-2 text-sm text-slate-600">
                Logged in as {user?.name || 'Manager'}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {navItems.map((item) => {
                const active =
                  item.to === '/manager'
                    ? location.pathname === '/' || location.pathname === '/manager'
                    : location.pathname.startsWith(item.to);

                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`rounded-full px-4 py-2 text-sm font-medium ${
                      active ? 'bg-sky-950 text-white' : 'bg-sky-50 text-sky-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <button
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
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
