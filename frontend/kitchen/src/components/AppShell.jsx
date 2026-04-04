const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff7ed_0%,#ffe8d5_100%)] text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[32px] border border-orange-100 bg-white/95 p-6 shadow-[0_24px_70px_rgba(249,115,22,0.1)]">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-rose-600">
            Kitchen Display
          </p>
          <h1 className="mt-3 text-3xl font-bold">Live prep board</h1>
          <p className="mt-2 text-sm text-slate-600">
            Polling every few seconds to keep tickets, item prep, and status transitions in sync.
          </p>
        </header>
        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
