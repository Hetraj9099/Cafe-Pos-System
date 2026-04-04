const AppShell = ({ title, subtitle, navigation, renderNavItem, children }) => {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="rounded-3xl bg-white/90 p-6 shadow-xl shadow-orange-100">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-600">
            Kitchen Module
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-950">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-700">{subtitle}</p>
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
