import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9]{10}$/;
const paymentMethods = ['card', 'upi', 'cash'];

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart,
    customer,
    table,
    checkoutMode,
    preferredPaymentMethod,
    setPreferredPaymentMethod,
    clearCart,
    resetOrderFlow,
    setLatestOrder,
    setLatestReservation
  } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );
  const tax = useMemo(() => Number((total * 0.05).toFixed(2)), [total]);
  const grandTotal = total + tax;
  const selectedReservationTable = location.state?.selectedTableId || '';
  const reservationTime = location.state?.reservationTime || '';

  const validateCustomerDetails = () => {
    if (customer.name.trim().length < 2) {
      throw new Error('Name must be at least 2 characters.');
    }

    if (!phonePattern.test(customer.phone.trim())) {
      throw new Error('Phone number must contain exactly 10 digits.');
    }

    if (customer.email.trim() && !emailPattern.test(customer.email.trim().toLowerCase())) {
      throw new Error('Enter a valid email address.');
    }
  };

  const handleOrderCheckout = async () => {
    validateCustomerDetails();

    if (!table?.id) {
      throw new Error('This QR order is not linked to a table.');
    }

    if (cart.length === 0) {
      throw new Error('Add at least one item before checkout.');
    }

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

    setLatestOrder(orderResponse.data);
    clearCart();
    navigate('/success', { state: { mode: 'order' } });
  };

  const handleReservationCheckout = async () => {
    validateCustomerDetails();

    const reservationResponse = await customerApi.createReservation({
      tableId: selectedReservationTable,
      reservationTime: new Date(reservationTime).toISOString(),
      customer
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
    <div className="grid gap-4 xl:grid-cols-[1fr,360px]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow={checkoutMode === 'reservation' ? 'Reservation checkout' : 'Guest checkout'}
          title={checkoutMode === 'reservation' ? 'Confirm reservation' : 'Review your order'}
          subtitle={
            checkoutMode === 'reservation'
              ? 'Double-check guest details and reserve the table.'
              : 'Review the cart, choose a payment preference, and send the order to the kitchen.'
          }
        />

        {checkoutMode === 'reservation' ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p><span className="font-medium text-slate-900">Guest:</span> {customer.name || 'Guest'}</p>
            <p className="mt-2"><span className="font-medium text-slate-900">Phone:</span> {customer.phone || 'Not added'}</p>
            <p className="mt-2"><span className="font-medium text-slate-900">Email:</span> {customer.email || 'Not added'}</p>
            <p className="mt-2"><span className="font-medium text-slate-900">Reservation time:</span> {reservationTime ? new Date(reservationTime).toLocaleString() : 'Not selected'}</p>
            <p className="mt-2"><span className="font-medium text-slate-900">Table ID:</span> {selectedReservationTable || 'Not selected'}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {cart.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.name}</p>
                  <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                </div>
                <p className="text-sm font-medium text-slate-950">
                  {currency(item.price * item.quantity)}
                </p>
              </div>
            ))}
            {cart.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No items in cart yet.
              </div>
            ) : null}
          </div>
        )}
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Summary"
          title={checkoutMode === 'reservation' ? 'Reservation action' : 'Payment preference'}
          subtitle={
            checkoutMode === 'reservation'
              ? 'Once confirmed, the booking becomes visible to the cashier.'
              : 'Choose the payment method the guest intends to use.'
          }
        />

        {checkoutMode === 'reservation' ? (
          <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Reservation</span>
              <span className="text-base font-medium">No pre-order</span>
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 disabled:opacity-60"
              onClick={handleSubmit}
              disabled={submitting || !selectedReservationTable || !reservationTime}
            >
              {submitting ? 'Confirming...' : 'Confirm reservation'}
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`rounded-xl px-4 py-3 text-sm font-medium capitalize transition ${
                    preferredPaymentMethod === method
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={() => setPreferredPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{currency(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax</span>
                  <span>{currency(tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-medium text-white">
                  <span>Total</span>
                  <span>{currency(grandTotal)}</span>
                </div>
              </div>
              <button
                className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 disabled:opacity-60"
                onClick={handleSubmit}
                disabled={submitting || cart.length === 0}
              >
                {submitting ? 'Placing order...' : 'Place order'}
              </button>
            </div>
          </>
        )}

        {checkoutMode === 'order' ? (
          <p className="mt-4 text-sm text-slate-500">
            The order is sent to the kitchen first. Payment completes later from the live tracking page when the order is ready.
          </p>
        ) : null}
        {error ? <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
      </aside>
    </div>
  );
};

export default CheckoutPage;
