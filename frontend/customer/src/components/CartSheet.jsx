const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const CartSheet = ({
  open,
  cart,
  onClose,
  onIncrement,
  onDecrement,
  onCheckout
}) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className={`fixed inset-0 z-30 transition ${
        open ? 'pointer-events-auto bg-black/30' : 'pointer-events-none bg-transparent'
      }`}
    >
      <div
        className={`absolute inset-x-0 bottom-0 mx-auto max-w-md rounded-t-[30px] bg-white p-5 shadow-2xl transition ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Your Cart</h2>
          <button className="text-sm font-medium text-emerald-700" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {cart.length === 0 ? (
            <p className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
              Add items to get started.
            </p>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500">{currency(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="h-8 w-8 rounded-full bg-white text-lg"
                      onClick={() => onDecrement(item.productId)}
                    >
                      -
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      className="h-8 w-8 rounded-full bg-emerald-900 text-lg text-white"
                      onClick={() => onIncrement(item.productId)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 rounded-2xl bg-emerald-950 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-100">Estimated total</span>
            <span className="text-lg font-semibold">{currency(total)}</span>
          </div>
          <button
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-emerald-950 disabled:opacity-50"
            onClick={onCheckout}
            disabled={cart.length === 0}
          >
            Continue to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartSheet;
