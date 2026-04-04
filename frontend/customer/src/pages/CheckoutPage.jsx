import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const paymentMethods = ['cash', 'card', 'upi'];

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart,
    customer,
    table,
    checkoutMode,
    clearCart,
    resetOrderFlow,
    setLatestOrder,
    setLatestReservation
  } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const handleOrderCheckout = async () => {
    const orderResponse = await customerApi.createOrder({
      tableId: table?.id || null,
      source: 'QR',
      customer,
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      sendToKitchen: true
    });

    const order = orderResponse.data;
    const paymentResponse = await customerApi.processPayment({
      orderId: order.id,
      paymentMethod,
      amount: Number(order.total_amount)
    });

    setLatestOrder(paymentResponse.data.order);
    clearCart();
    resetOrderFlow();
    navigate('/success', { state: { mode: 'order' } });
  };

  const handleReservationCheckout = async () => {
    const reservationResponse = await customerApi.createReservation({
      tableId: location.state?.selectedTableId,
      reservationTime: new Date(location.state?.reservationTime).toISOString(),
      customer,
      preorderItems: cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      })),
      prepaid: location.state?.prepaid || false
    });

    setLatestReservation(reservationResponse.data);
    clearCart();
    resetOrderFlow();
    navigate('/success', { state: { mode: 'reservation' } });
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (checkoutMode === 'reservation') {
        await handleReservationCheckout();
      } else {
        await handleOrderCheckout();
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">
          {checkoutMode === 'reservation' ? 'Confirm reservation' : 'Checkout'}
        </h2>
        <div className="mt-4 space-y-3">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold text-slate-900">
                {currency(item.price * item.quantity)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Payment</h3>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {paymentMethods.map((method) => (
            <button
              key={method}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold capitalize ${
                paymentMethod === method
                  ? 'bg-emerald-950 text-white'
                  : 'bg-emerald-50 text-emerald-900'
              }`}
              onClick={() => setPaymentMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-3xl bg-emerald-950 p-5 text-white">
          <div className="flex items-center justify-between">
            <span>Total</span>
            <span className="text-2xl font-bold">{currency(total)}</span>
          </div>
          <button
            className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-base font-semibold text-emerald-950 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={submitting || cart.length === 0}
          >
            {submitting ? 'Processing...' : checkoutMode === 'reservation' ? 'Reserve now' : 'Pay now'}
          </button>
        </div>
      </section>

      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
    </div>
  );
};

export default CheckoutPage;
