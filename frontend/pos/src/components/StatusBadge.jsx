const tones = {
  Available: 'bg-emerald-100 text-emerald-700',
  Occupied: 'bg-rose-100 text-rose-700',
  Cooking: 'bg-amber-100 text-amber-700',
  Ready: 'bg-emerald-600 text-white',
  Paid: 'bg-sky-100 text-sky-700',
  Reserved: 'bg-violet-100 text-violet-700',
  created: 'bg-slate-200 text-slate-700',
  sent: 'bg-rose-100 text-rose-700',
  preparing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  paid: 'bg-sky-100 text-sky-700'
};

const labels = {
  sent: 'To Cook',
  completed: 'Ready'
};

const StatusBadge = ({ status, className = '' }) => {
  const tone = tones[status] || 'bg-slate-100 text-slate-700';

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone} ${className}`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
