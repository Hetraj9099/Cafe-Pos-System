import BottomSheet from './BottomSheet';
import CartItem from './CartItem';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const CartSheet = ({ open, cart, onClose, onIncrement, onDecrement, onCheckout }) => {
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <BottomSheet
      open={open}
      title="Your cart"
      onClose={onClose}
      action={
        <div className="rounded-xl bg-slate-900 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Estimated total</span>
            <span className="text-base font-medium">{currency(total)}</span>
          </div>
          <button
            className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 disabled:opacity-50"
            onClick={onCheckout}
            disabled={cart.length === 0}
          >
            Continue to checkout
          </button>
        </div>
      }
    >
      <div className="space-y-3 lg:max-h-[calc(100vh-240px)] lg:overflow-y-auto">
        {cart.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
            Add items to get started.
          </p>
        ) : (
          cart.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          ))
        )}
      </div>
    </BottomSheet>
  );
};

export default CartSheet;
