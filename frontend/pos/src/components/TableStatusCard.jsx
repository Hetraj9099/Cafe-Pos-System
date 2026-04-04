const palettes = {
  Available: {
    shell: 'border-slate-200 bg-white text-slate-900',
    badge: 'bg-slate-200 text-slate-800',
    glow: 'shadow-[0_16px_40px_rgba(148,163,184,0.18)]',
    table: 'bg-slate-300',
    chair: 'bg-slate-200'
  },
  Occupied: {
    shell: 'border-rose-200 bg-rose-50 text-rose-950',
    badge: 'bg-rose-500 text-white',
    glow: 'shadow-[0_18px_42px_rgba(244,63,94,0.22)]',
    table: 'bg-rose-500',
    chair: 'bg-rose-200'
  },
  Cooking: {
    shell: 'border-amber-200 bg-amber-50 text-amber-950',
    badge: 'bg-amber-400 text-slate-950',
    glow: 'shadow-[0_18px_42px_rgba(251,191,36,0.24)]',
    table: 'bg-amber-400',
    chair: 'bg-amber-200'
  },
  Ready: {
    shell: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    badge: 'bg-emerald-500 text-white',
    glow: 'shadow-[0_18px_42px_rgba(16,185,129,0.22)]',
    table: 'bg-emerald-500',
    chair: 'bg-emerald-200'
  },
  Paid: {
    shell: 'border-sky-200 bg-sky-50 text-sky-950',
    badge: 'bg-sky-500 text-white',
    glow: 'shadow-[0_18px_42px_rgba(14,165,233,0.22)]',
    table: 'bg-sky-500',
    chair: 'bg-sky-200'
  },
  Reserved: {
    shell: 'border-violet-200 bg-violet-50 text-violet-950',
    badge: 'bg-violet-500 text-white',
    glow: 'shadow-[0_18px_42px_rgba(168,85,247,0.22)]',
    table: 'bg-violet-500',
    chair: 'bg-violet-200'
  }
};

const Chair = ({ className }) => <div className={`absolute rounded-full ${className}`} />;

const TableGraphic = ({ seats, palette, status }) => {
  if (seats <= 2) {
    return (
      <div className="relative h-40 w-full">
        <div className={`absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full ${palette.table} shadow-inner`} />
        <Chair className={`left-1/2 top-3 h-12 w-20 -translate-x-1/2 ${palette.chair}`} />
        <Chair className={`left-1/2 bottom-3 h-12 w-20 -translate-x-1/2 ${palette.chair}`} />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
          Cozy 2
        </div>
        <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-700">
          {status}
        </div>
      </div>
    );
  }

  if (seats <= 4) {
    return (
      <div className="relative h-40 w-full">
        <div className={`absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-[34px] ${palette.table} shadow-inner`} />
        <Chair className={`left-1/2 top-4 h-10 w-16 -translate-x-1/2 ${palette.chair}`} />
        <Chair className={`left-1/2 bottom-4 h-10 w-16 -translate-x-1/2 ${palette.chair}`} />
        <Chair className={`left-5 top-1/2 h-16 w-10 -translate-y-1/2 ${palette.chair}`} />
        <Chair className={`right-5 top-1/2 h-16 w-10 -translate-y-1/2 ${palette.chair}`} />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
          Family 4
        </div>
        <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-700">
          {status}
        </div>
      </div>
    );
  }

  if (seats <= 6) {
    return (
      <div className="relative h-40 w-full">
        <div className={`absolute left-1/2 top-1/2 h-24 w-40 -translate-x-1/2 -translate-y-1/2 rounded-[32px] ${palette.table} shadow-inner`} />
        <Chair className={`left-1/2 top-4 h-10 w-16 -translate-x-1/2 ${palette.chair}`} />
        <Chair className={`left-1/2 bottom-4 h-10 w-16 -translate-x-1/2 ${palette.chair}`} />
        <Chair className={`left-5 top-8 h-12 w-10 ${palette.chair}`} />
        <Chair className={`left-5 bottom-8 h-12 w-10 ${palette.chair}`} />
        <Chair className={`right-5 top-8 h-12 w-10 ${palette.chair}`} />
        <Chair className={`right-5 bottom-8 h-12 w-10 ${palette.chair}`} />
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
          Party 6
        </div>
        <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-700">
          {status}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-40 w-full">
      <div className={`absolute left-1/2 top-1/2 h-24 w-48 -translate-x-1/2 -translate-y-1/2 rounded-[30px] ${palette.table} shadow-inner`} />
      <Chair className={`left-1/2 top-4 h-9 w-16 -translate-x-1/2 ${palette.chair}`} />
      <Chair className={`left-1/2 bottom-4 h-9 w-16 -translate-x-1/2 ${palette.chair}`} />
      <Chair className={`left-6 top-5 h-10 w-10 ${palette.chair}`} />
      <Chair className={`left-6 top-[4.35rem] h-10 w-10 ${palette.chair}`} />
      <Chair className={`left-6 bottom-5 h-10 w-10 ${palette.chair}`} />
      <Chair className={`right-6 top-5 h-10 w-10 ${palette.chair}`} />
      <Chair className={`right-6 top-[4.35rem] h-10 w-10 ${palette.chair}`} />
      <Chair className={`right-6 bottom-5 h-10 w-10 ${palette.chair}`} />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-white/90">
        Group {seats}
      </div>
      <div className="absolute bottom-4 right-4 rounded-full bg-white/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-700">
        {status}
      </div>
    </div>
  );
};

const statusOptions = ['AUTO', 'Available', 'Occupied', 'Cooking', 'Ready', 'Reserved', 'Paid'];

const TableStatusCard = ({ table, selected, onClick, onStatusChange, statusSaving }) => {
  const displayStatus = table.manual_status || table.status || table.derived_status || 'Available';
  const palette = palettes[displayStatus] || palettes.Available;
  const statusValue = table.manual_status || 'AUTO';

  return (
    <div
      className={`rounded-[30px] border p-5 text-left transition duration-200 ${palette.shell} ${palette.glow} ${
        selected ? 'ring-2 ring-slate-950 ring-offset-2' : 'hover:-translate-y-1'
      }`}
    >
      <button className="block w-full text-left" onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Dining table
            </p>
            <h3 className="mt-2 text-2xl font-bold">Table {table.table_number}</h3>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette.badge}`}>
            {displayStatus}
          </span>
        </div>

        <div className="relative mt-5 overflow-hidden rounded-[28px] bg-white/70">
          <TableGraphic
            seats={Number(table.seats) || 0}
            palette={palette}
            status={displayStatus}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-600">Seats {table.seats}</span>
          <span className="font-medium text-slate-900">
            {table.latest_order
              ? `Rs. ${Number(table.latest_order.total_amount).toFixed(2)}`
              : 'No bill'}
          </span>
        </div>
      </button>

      <div className="mt-4 rounded-2xl bg-white/80 p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            Cashier status
          </div>
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800"
            value={statusValue}
            disabled={statusSaving}
            onChange={(event) => {
              onStatusChange(event.target.value === 'AUTO' ? null : event.target.value);
            }}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'AUTO' ? 'Auto' : status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default TableStatusCard;
