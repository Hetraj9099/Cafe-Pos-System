const HeaderBar = ({ eyebrow, title, subtitle, children }) => {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">{eyebrow}</p>
        ) : null}
        <h2 className="text-base font-medium text-slate-950 sm:text-xl">{title}</h2>
        {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
};

export default HeaderBar;
