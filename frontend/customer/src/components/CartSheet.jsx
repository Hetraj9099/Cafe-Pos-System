import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { to: '/reserve', label: 'Reserve' }
];

const AppShell = ({ children }) => {
  const location = useLocation();
  const isQrFlow =
    location.pathname.startsWith('/order/') ||
    location.pathname.startsWith('/menu/') ||
    location.pathname.startsWith('/legacy-order/');

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900">
      <div className="mx-auto min-h-screen max-w-[1440px] px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-md lg:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-600">
                POS Cafe
              </p>
              <h1 className="mt-2 text-2xl font-medium text-slate-950 lg:text-4xl">
                {isQrFlow ? 'QR Table Ordering' : 'Guest Ordering'}
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-500 lg:text-base">
                {isQrFlow
                  ? 'Scan, confirm your details, order from your table, and pay by UPI or card without picking a table manually.'
                  : 'Reserve a table or order directly from your table with a clean, guided guest flow.'}
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <div className="rounded-lg bg-violet-100 px-4 py-2 text-xs font-medium uppercase tracking-[0.24em] text-violet-700">
                {isQrFlow ? 'QR Guest Portal' : 'Guest Portal'}
              </div>
              {!isQrFlow ? (
                <nav className="flex flex-wrap gap-2">
                  {navItems.map((item) => {
                    const active = location.pathname.startsWith(item.to);
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
                </nav>
              ) : null}
            </div>
          </div>
        </header>

        <main className="mt-4">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
