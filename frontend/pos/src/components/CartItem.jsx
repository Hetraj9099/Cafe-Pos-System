const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const CartItem = ({ item, onIncrement, onDecrement }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{item.product_name}</p>
          <p className="mt-1 text-xs text-slate-500">Qty {item.quantity}</p>
        </div>
        <p className="text-sm font-medium text-slate-950">{currency(item.total_price)}</p>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={onDecrement}
          >
            -
          </button>
          <span className="min-w-6 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
          <button
            className="h-8 w-8 rounded-lg bg-slate-800 text-sm font-medium text-white transition hover:bg-slate-900"
            onClick={onIncrement}
          >
            +
          </button>
        </div>
        <span className="text-xs text-slate-500">Tap minus to remove this line</span>
      </div>
    </div>
  );
};

export default CartItem;
