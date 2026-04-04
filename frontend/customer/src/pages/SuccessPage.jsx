import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';

const orderStatusLabels = {
  created: 'Created',
  sent: 'Sent to kitchen',
  preparing: 'Preparing',
  completed: 'Ready to serve',
  paid: 'Paid'
};

const SuccessPage = () => {
  const location = useLocation();
  const { latestOrder, latestReservation, customer, setLatestOrder } = useAppContext();
  const [emailStatus, setEmailStatus] = useState('');

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
  }, [latestOrder?.id, location.state?.mode, setLatestOrder]);

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

    const response = await customerApi.emailBill(latestOrder.id, customer.email);
    setEmailStatus(response.data.message || 'Bill email request completed.');
  };

  if (location.state?.mode === 'reservation' && latestReservation) {
    return (
      <div className="space-y-4">
        <section className="rounded-[28px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Reservation confirmed</h2>
          <p className="mt-2 text-sm text-slate-600">
            Table locked in and visible to the cashier team.
          </p>
          <div className="mt-5 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">
            <p>Reservation ID: {latestReservation.reservation.id}</p>
            <p>Time: {new Date(latestReservation.reservation.reservation_time).toLocaleString()}</p>
            <p>Table ID: {latestReservation.reservation.table_id}</p>
          </div>
        </section>
      </div>
    );
  }

  if (!latestOrder) {
    return <div className="rounded-[28px] bg-white p-6 text-sm text-slate-600">No active order yet.</div>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">Order confirmed</h2>
        <p className="mt-2 text-sm text-slate-600">
          We are tracking your order in real time while the kitchen works on it.
        </p>

        <div className="mt-5 rounded-3xl bg-emerald-950 p-5 text-white">
          <div className="flex items-center justify-between">
            <span className="text-sm text-emerald-200">Current stage</span>
            <span className="text-base font-semibold">
              {orderStatusLabels[latestOrder.status] || latestOrder.status}
            </span>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-emerald-100">
            Estimated time remaining: {countdown} min
          </p>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            className="flex-1 rounded-2xl bg-emerald-100 px-4 py-3 text-sm font-semibold text-emerald-900"
            onClick={handleDownload}
          >
            Download bill
          </button>
          <button
            className="flex-1 rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white"
            onClick={handleEmailBill}
          >
            Email bill
          </button>
        </div>
        {emailStatus ? <p className="mt-3 text-sm text-slate-600">{emailStatus}</p> : null}
      </section>
    </div>
  );
};

export default SuccessPage;
