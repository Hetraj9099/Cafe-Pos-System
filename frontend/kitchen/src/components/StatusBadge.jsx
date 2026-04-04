const tones = {
  sent: 'bg-rose-100 text-rose-700',
  preparing: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700'
};

const labels = {
  sent: 'To Cook',
  preparing: 'Preparing',
  completed: 'Ready'
};

const StatusBadge = ({ status, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[status] || 'bg-slate-100 text-slate-600'} ${className}`}
    >
      {labels[status] || status}
    </span>
  );
};

export default StatusBadge;
