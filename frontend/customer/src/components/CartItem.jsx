const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const CartItem = ({ item, onIncrement, onDecrement }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-900">{item.name}</p>
          <p className="mt-1 text-xs text-slate-500">{currency(item.price)} each</p>
        </div>
        <p className="text-sm font-medium text-slate-950">{currency(item.price * item.quantity)}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            className="h-9 w-9 rounded-lg border border-slate-200 bg-slate-50 text-base font-medium text-slate-700 transition hover:bg-slate-100"
            onClick={() => onDecrement(item.productId)}
          >
            -
          </button>
          <span className="min-w-6 text-center text-sm font-medium text-slate-700">{item.quantity}</span>
          <button
            className="h-9 w-9 rounded-lg bg-violet-600 text-base font-medium text-white transition hover:bg-violet-700"
            onClick={() => onIncrement(item.productId)}
          >
            +
          </button>
        </div>
        <span className="text-xs text-slate-500">Adjust quantity</span>
      </div>
    </div>
  );
};

export default CartItem;
