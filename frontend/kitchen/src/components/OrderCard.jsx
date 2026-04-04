import StatusBadge from './StatusBadge';

const timerMinutes = (createdAt) => {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) {
    return 0;
  }

  return Math.max(0, Math.round((Date.now() - created) / 60000));
};

const stageLabel = {
  sent: 'Tap to start',
  preparing: 'Tap to mark ready',
  completed: 'Ready for pickup'
};

const accentByStatus = {
  sent: 'border-rose-200 bg-rose-50/80',
  preparing: 'border-amber-200 bg-amber-50/90',
  completed: 'border-emerald-200 bg-emerald-50/90'
};

const timerTone = (status, urgent) => {
  if (urgent) {
    return 'bg-rose-600 text-white';
  }

  if (status === 'preparing') {
    return 'bg-amber-500 text-white';
  }

  if (status === 'completed') {
    return 'bg-emerald-500 text-white';
  }

  return 'bg-slate-100 text-slate-700';
};

const OrderCard = ({ order, onAdvance, onToggleItem, advancing = false, busyItemIds = new Set() }) => {
  const elapsed = timerMinutes(order.created_at);
  const urgent = elapsed >= 15;
  const items = order.items || [];

  return (
    <article
      className={`group rounded-2xl border shadow-md transition duration-200 hover:-translate-y-0.5 hover:shadow-lg ${accentByStatus[order.status] || 'border-slate-200 bg-white'}`}
    >
      <button
        className="w-full text-left disabled:cursor-not-allowed disabled:opacity-80"
        onClick={() => onAdvance(order.id)}
        disabled={advancing}
      >
        <div className="border-b border-black/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-slate-500">
                Table {order.table_number || '-'}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-semibold text-slate-950">#{order.id.slice(0, 6)}</h3>
                <StatusBadge status={order.status} />
              </div>
              <p className="mt-2 text-sm font-medium text-slate-800">
                {order.customer_name || 'Walk-in customer'}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${timerTone(order.status, urgent)}`}
              >
                {elapsed} min
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {items.length} items
              </span>
            </div>
          </div>

          <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {stageLabel[order.status] || 'Kitchen ticket'}
          </p>
        </div>
      </button>

      <div className="space-y-2 p-4">
        {items.length ? (
          items.map((item) => (
            <button
              key={item.id}
              className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition ${
                item.is_prepared
                  ? 'border-emerald-200 bg-white text-emerald-700'
                  : 'border-white/80 bg-white text-slate-800 hover:border-slate-200'
              } disabled:cursor-not-allowed disabled:opacity-70`}
              onClick={() => onToggleItem(item.id, item.is_prepared)}
              disabled={advancing || busyItemIds.has(item.id)}
            >
              <span className="pr-3 font-medium">
                {item.product_name}
                <span className="ml-2 text-slate-400">x{item.quantity}</span>
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
                {item.is_prepared ? 'Done' : 'Prep'}
              </span>
            </button>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-3 py-4 text-sm text-slate-500">
            No items on this ticket.
          </div>
        )}
      </div>
    </article>
  );
};

export default OrderCard;
