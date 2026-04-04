import StatusBadge from './StatusBadge';

const surfaceTones = {
  Available: 'border-emerald-200 bg-emerald-50/60',
  Occupied: 'border-rose-200 bg-rose-50',
  Cooking: 'border-amber-200 bg-amber-50',
  Ready: 'border-emerald-300 bg-emerald-50',
  Paid: 'border-sky-200 bg-sky-50',
  Reserved: 'border-violet-200 bg-violet-50'
};

const shapeTones = {
  Available: 'bg-emerald-500',
  Occupied: 'bg-rose-500',
  Cooking: 'bg-amber-400',
  Ready: 'bg-emerald-600',
  Paid: 'bg-sky-500',
  Reserved: 'bg-violet-500'
};

const occupiedSeats = (table) => {
  if (table.status === 'Available') {
    return 0;
  }

  return Math.min(Number(table.seats) || 0, Math.max(1, Math.round(Number(table.seats || 0) / 2)));
};

const TableShape = ({ seats, tone }) => {
  if (seats <= 2) {
    return (
      <div className="relative mx-auto h-24 w-24">
        <div className={`absolute inset-3 rounded-full ${tone}`} />
        <div className="absolute left-1/2 top-0 h-5 w-14 -translate-x-1/2 rounded-full bg-white/80" />
        <div className="absolute bottom-0 left-1/2 h-5 w-14 -translate-x-1/2 rounded-full bg-white/80" />
      </div>
    );
  }

  if (seats <= 4) {
    return (
      <div className="relative mx-auto h-28 w-28">
        <div className={`absolute inset-4 rounded-2xl ${tone}`} />
        <div className="absolute left-1/2 top-0 h-6 w-14 -translate-x-1/2 rounded-xl bg-white/80" />
        <div className="absolute bottom-0 left-1/2 h-6 w-14 -translate-x-1/2 rounded-xl bg-white/80" />
        <div className="absolute left-0 top-1/2 h-14 w-6 -translate-y-1/2 rounded-xl bg-white/80" />
        <div className="absolute right-0 top-1/2 h-14 w-6 -translate-y-1/2 rounded-xl bg-white/80" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto h-24 w-40">
      <div className={`absolute inset-x-5 inset-y-4 rounded-3xl ${tone}`} />
      <div className="absolute left-1/2 top-0 h-5 w-16 -translate-x-1/2 rounded-full bg-white/80" />
      <div className="absolute bottom-0 left-1/2 h-5 w-16 -translate-x-1/2 rounded-full bg-white/80" />
      <div className="absolute left-1 top-5 h-5 w-7 rounded-full bg-white/80" />
      <div className="absolute left-1 bottom-5 h-5 w-7 rounded-full bg-white/80" />
      <div className="absolute right-1 top-5 h-5 w-7 rounded-full bg-white/80" />
      <div className="absolute right-1 bottom-5 h-5 w-7 rounded-full bg-white/80" />
    </div>
  );
};

const TableCard = ({ table, selected, statusSaving, onStatusChange, onClick }) => {
  const tone = surfaceTones[table.status] || 'border-slate-200 bg-white';
  const shapeTone = shapeTones[table.status] || 'bg-slate-400';

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        selected ? 'ring-2 ring-slate-400 ring-offset-2' : ''
      } ${tone}`}
    >
      <button className="w-full text-left" onClick={onClick}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Table</p>
            <h3 className="mt-1 text-2xl font-medium text-slate-950">{table.table_number}</h3>
          </div>
          <StatusBadge status={table.status} />
        </div>

        <div className="mt-4 rounded-xl bg-white/90 p-4">
          <TableShape seats={Number(table.seats) || 0} tone={shapeTone} />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
          <span>{occupiedSeats(table)}/{table.seats} seats</span>
          <span>{table.latest_order ? '1 active ticket' : 'No active ticket'}</span>
        </div>
      </button>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/90 p-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cashier Status</p>
        </div>
        <select
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          value={table.manual_status || 'AUTO'}
          disabled={statusSaving}
          onChange={(event) => onStatusChange(event.target.value === 'AUTO' ? null : event.target.value)}
        >
          <option value="AUTO">Auto</option>
          <option value="Available">Available</option>
          <option value="Occupied">Occupied</option>
          <option value="Cooking">Cooking</option>
          <option value="Ready">Ready</option>
          <option value="Reserved">Reserved</option>
          <option value="Paid">Paid</option>
        </select>
      </div>
    </div>
  );
};

export default TableCard;
