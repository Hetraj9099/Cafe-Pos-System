import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';
import FakePaymentGateway from '../../../shared/components/FakePaymentGateway';

const orderStatusLabels = {
  created: 'Created',
  sent: 'Sent to kitchen',
  preparing: 'Preparing',
  completed: 'Ready to serve',
  paid: 'Paid'
};
const paymentMethods = ['card', 'upi', 'cash'];

const SuccessPage = () => {
  const location = useLocation();
  const {
    latestOrder,
    latestReservation,
    customer,
    preferredPaymentMethod,
    setPreferredPaymentMethod,
    setLatestOrder,
    resetOrderFlow
  } = useAppContext();
  const [emailStatus, setEmailStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);

  useEffect(() => {
    if (!latestOrder?.id || location.state?.mode !== 'order') {
      return undefined;
    }

    const interval = setInterval(async () => {
      try {
        const response = await customerApi.getOrder(latestOrder.id);
        setLatestOrder(response.data);
      } catch (error) {
        clearInterval(interval);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [latestOrder?.id, location.state?.mode]);

  const countdown = useMemo(() => {
    if (!latestOrder?.created_at || !latestOrder?.estimated_prep_time) {
      return 0;
    }

    const elapsedMinutes =
      (Date.now() - new Date(latestOrder.created_at).getTime()) / (1000 * 60);
    return Math.max(0, Math.round(Number(latestOrder.estimated_prep_time) - elapsedMinutes));
  }, [latestOrder]);

  const progress = useMemo(() => {
    if (!latestOrder?.estimated_prep_time) {
      return 0;
    }

    return Math.max(
      8,
      Math.min(
        100,
        ((Number(latestOrder.estimated_prep_time) - countdown) /
          Number(latestOrder.estimated_prep_time)) *
          100
      )
    );
  }, [latestOrder, countdown]);

  const handleDownload = async () => {
    if (!latestOrder?.id) {
      return;
    }

    const blob = await customerApi.downloadBill(latestOrder.id);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bill-${latestOrder.id}.pdf`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailBill = async () => {
    if (!latestOrder?.id || !customer.email) {
      setEmailStatus('Add an email address before requesting the bill.');
      return;
    }

    try {
      const response = await customerApi.emailBill(latestOrder.id, customer.email);
      setEmailStatus(response.data.message || 'Bill email request completed.');
    } catch (error) {
      setEmailStatus(error.message);
    }
  };

  const finalizePayment = async () => {
    if (processingPayment) {
      return;
    }

    if (!latestOrder?.id) {
      return;
    }

    try {
      setProcessingPayment(true);
      setPaymentStatus('');
      const response = await customerApi.processPayment({
        orderId: latestOrder.id,
        paymentMethod: preferredPaymentMethod,
        amount: Number(latestOrder.total_amount)
      });
      setLatestOrder(response.data.order);
      resetOrderFlow();
      setGatewayOpen(false);
      setPaymentStatus(`Payment completed by ${preferredPaymentMethod.toUpperCase()}.`);
    } catch (error) {
      setPaymentStatus(error.message);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handlePayment = async () => {
    if (processingPayment) {
      return;
    }

    if (preferredPaymentMethod === 'cash') {
      await finalizePayment();
      return;
    }

    setPaymentStatus('');
    setGatewayOpen(true);
  };

  if (location.state?.mode === 'reservation' && latestReservation) {
    return (
      <div className="grid gap-4 xl:grid-cols-[1fr,360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <HeaderBar
            eyebrow="Reservation confirmed"
            title="Your table is booked"
            subtitle="The cashier team can now see this reservation on the floor."
          />
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>Reservation ID: {latestReservation.reservation.id}</p>
            <p className="mt-2">Time: {new Date(latestReservation.reservation.reservation_time).toLocaleString()}</p>
            <p className="mt-2">Table ID: {latestReservation.reservation.table_id}</p>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <HeaderBar
            eyebrow="Next steps"
            title="What happens next"
            subtitle="Arrive around your selected time and check in with the floor team."
          />
          <div className="mt-4 rounded-xl bg-slate-900 p-4 text-sm text-slate-200">
            <p>Your reservation is now visible to the floor team.</p>
            <p className="mt-3">Reach the venue close to your selected time and check in with the cashier.</p>
            <p className="mt-3">If you need changes, create a new reservation with the updated time.</p>
          </div>
        </aside>
      </div>
    );
  }

  if (!latestOrder) {
    return <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">No active order yet.</div>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr,360px]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Order placed"
          title="We are preparing your order"
          subtitle="Track the kitchen stage here. You can pay as soon as the order is ready."
        />

        <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Current stage</span>
            <span className="text-base font-medium">
              {orderStatusLabels[latestOrder.status] || latestOrder.status}
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-slate-300">Estimated time remaining: {countdown} min</p>
        </div>

        {latestOrder.status === 'paid' ? (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                onClick={handleDownload}
              >
                Download bill
              </button>
              <button
                className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
                onClick={handleEmailBill}
              >
                Email bill
              </button>
            </div>
            {emailStatus ? <p className="mt-3 text-sm text-slate-600">{emailStatus}</p> : null}
          </>
        ) : (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <HeaderBar
              eyebrow="Payment"
              title="Pay when the order is ready"
              subtitle="Choose the payment method now. The payment action unlocks when the kitchen marks the order ready."
            />
            <div className="mt-4 grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`rounded-xl px-4 py-3 text-sm font-medium capitalize transition ${
                    preferredPaymentMethod === method
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setPreferredPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
              onClick={handlePayment}
              disabled={processingPayment || latestOrder.status !== 'completed'}
            >
              {processingPayment ? 'Processing payment...' : 'Pay now'}
            </button>
            <p className="mt-3 text-xs text-slate-500">
              Payment unlocks once the kitchen marks the order as ready to serve.
            </p>
            {paymentStatus ? <p className="mt-3 text-sm text-slate-700">{paymentStatus}</p> : null}
          </div>
        )}
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Summary"
          title="Order details"
          subtitle="Keep the bill and order reference in one place."
        />
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <p><span className="font-medium text-slate-900">Order ID:</span> {latestOrder.id}</p>
          <p className="mt-2"><span className="font-medium text-slate-900">Status:</span> {orderStatusLabels[latestOrder.status] || latestOrder.status}</p>
          <p className="mt-2"><span className="font-medium text-slate-900">Estimated prep:</span> {latestOrder.estimated_prep_time || 0} min</p>
          <p className="mt-2"><span className="font-medium text-slate-900">Bill total:</span> Rs. {Number(latestOrder.total_amount || 0).toFixed(2)}</p>
        </div>
      </aside>

      <FakePaymentGateway
        open={gatewayOpen}
        method={preferredPaymentMethod}
        amount={latestOrder.total_amount || 0}
        processing={processingPayment}
        onClose={() => {
          if (!processingPayment) {
            setGatewayOpen(false);
          }
        }}
        onConfirm={finalizePayment}
      />
    </div>
  );
};

export default SuccessPage;
