import StatusBadge from './StatusBadge';

const toneByStatus = {
  sent: 'border-rose-200 bg-rose-50',
  preparing: 'border-amber-200 bg-amber-50',
  completed: 'border-emerald-200 bg-emerald-50'
};

const nextLabel = {
  sent: 'Start prep',
  preparing: 'Mark ready',
  completed: 'Ready'
};

const timerMinutes = (createdAt) => {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) {
    return 0;
  }

  return Math.max(0, Math.round((Date.now() - created) / 60000));
};

const OrderCard = ({ order, onAdvance, onToggleItem }) => {
  const elapsed = timerMinutes(order.created_at);
  const urgent = elapsed >= 15;

  return (
    <article
      className={`rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${toneByStatus[order.status] || 'border-slate-200 bg-white'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
            T{order.table_number || '-'} · #{order.id.slice(0, 4)}
          </p>
          <h3 className="mt-1 text-base font-medium text-slate-950">
            {order.customer_name || 'Walk-in customer'}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {order.items?.length || 0} items · {order.source}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={order.status} />
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${urgent ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            {elapsed} min
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {order.items?.map((item) => (
          <button
            key={item.id}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
              item.is_prepared
                ? 'bg-white text-emerald-700 ring-1 ring-emerald-200'
                : 'bg-white/80 text-slate-700 hover:bg-white'
            }`}
            onClick={() => onToggleItem(item.id, item.is_prepared)}
          >
            <span className="font-medium">
              {item.product_name} <span className="text-slate-500">x{item.quantity}</span>
            </span>
            <span className="text-xs uppercase tracking-[0.18em]">
              {item.is_prepared ? 'Ready' : 'Prep'}
            </span>
          </button>
        ))}
      </div>

      <button
        className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        onClick={() => onAdvance(order.id)}
      >
        {nextLabel[order.status]}
      </button>
    </article>
  );
};

export default OrderCard;
