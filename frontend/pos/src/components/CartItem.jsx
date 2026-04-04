const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const CartItem = ({ item, onIncrement, onDecrement }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-slate-900">{item.product_name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">Qty {item.quantity}</p>
        </div>
        <p className="text-sm font-semibold text-slate-950">{currency(item.total_price)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-1">
          <button
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={onDecrement}
          >
            -
          </button>
          <span className="min-w-8 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
          <button
            className="h-9 w-9 rounded-xl bg-slate-800 text-sm font-medium text-white transition hover:bg-violet-600"
            onClick={onIncrement}
          >
            +
          </button>
        </div>
        <span className="text-xs text-slate-400">Tap minus to reduce</span>
      </div>
    </div>
  );
};

export default CartItem;
