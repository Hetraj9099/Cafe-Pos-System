import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/reserve', label: 'Reserve' },
  { to: '/checkout', label: 'Checkout' }
];

const AppShell = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4fff8_0%,#dff7e8_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-24 pt-5">
        <header className="rounded-[28px] border border-emerald-100 bg-white/95 p-5 shadow-[0_18px_50px_rgba(16,185,129,0.14)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-600">
                POS Cafe
              </p>
              <h1 className="mt-2 text-2xl font-bold text-emerald-950">Guest Ordering</h1>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Mobile Flow
            </div>
          </div>

          <nav className="mt-5 flex gap-2">
            {navItems.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-emerald-900 text-white'
                      : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mt-5 flex-1">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
