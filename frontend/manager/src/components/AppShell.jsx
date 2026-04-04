const AppShell = ({ title, subtitle, navigation, renderNavItem, children }) => {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-sky-100">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">
            Management Module
          </p>
          <h1 className="mt-3 text-3xl font-bold text-sky-950">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-sky-900/70">{subtitle}</p>
          <nav className="mt-6 flex flex-wrap gap-3">
            {navigation.map((item) => renderNavItem(item))}
          </nav>
        </header>

        <main className="mt-6">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
