const AppShell = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
        <header className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-violet-600">
            Kitchen Display
          </p>
          <h1 className="mt-2 text-2xl font-medium text-slate-950">Kitchen workflow</h1>
          <p className="mt-1 text-sm text-slate-500">
            Polling every few seconds to keep tickets, item prep, and status transitions in sync.
          </p>
        </header>
        <main className="mt-4">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
