import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import StatusBadge from '../components/StatusBadge';
import useAppContext from '../hooks/useAppContext';
import { posApi } from '../services/api';
import FakePaymentGateway from '../../../shared/components/FakePaymentGateway';

const paymentMethods = ['cash', 'card', 'upi'];
const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const PaymentScreen = () => {
  const navigate = useNavigate();
  const {
    tables,
    selectedTableId,
    setSelectedTableId,
    getSelectedOrder,
    refreshData,
    markTableAsPaid
  } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);

  const activeOrder = useMemo(() => getSelectedOrder(), [getSelectedOrder, selectedTableId]);

  const displayItems = useMemo(() => {
    const grouped = new Map();

    for (const item of activeOrder?.items || []) {
      const key = item.product_id || item.product_name;
      const existing = grouped.get(key);

      if (existing) {
        grouped.set(key, {
          ...existing,
          quantity: Number(existing.quantity || 0) + Number(item.quantity || 0),
          total_price: Number(existing.total_price || 0) + Number(item.total_price || 0)
        });
      } else {
        grouped.set(key, { ...item });
      }
    }

    return Array.from(grouped.values());
  }, [activeOrder?.items]);

  const finalizePayment = async () => {
    try {
      setSubmitting(true);
      setError('');

      if (!activeOrder) {
        throw new Error('Select a table with an active order.');
      }

      await posApi.processPayment({
        orderId: activeOrder.id,
        paymentMethod,
        amount: Number(activeOrder.total_amount)
      });

      markTableAsPaid(selectedTableId);
      await refreshData();
      setGatewayOpen(false);
      navigate('/pos');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async () => {
    if (!activeOrder) {
      setError('Select a table with an active order.');
      return;
    }

    if (paymentMethod === 'cash') {
      await finalizePayment();
      return;
    }

    setError('');
    setGatewayOpen(true);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[0.36fr,0.64fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Payment desk"
          title="Settle table"
          subtitle="Pick the active table first, then confirm the bill and collect payment."
        />
        <select
          className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
          value={selectedTableId}
          onChange={(event) => setSelectedTableId(event.target.value)}
        >
          <option value="">Select table</option>
          {tables.map((table) => (
            <option key={table.id} value={table.id}>
              Table {table.table_number} - {table.status}
            </option>
          ))}
        </select>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Current ticket</p>
              <h3 className="mt-1 text-lg font-medium text-slate-950">
                {selectedTableId ? `Table ${tables.find((table) => table.id === selectedTableId)?.table_number || '-'}` : 'No table selected'}
              </h3>
            </div>
            {tables.find((table) => table.id === selectedTableId)?.status ? (
              <StatusBadge status={tables.find((table) => table.id === selectedTableId)?.status} />
            ) : null}
          </div>
          <p className="mt-3 text-sm text-slate-500">
            Review the ticket lines and collect payment with the tender buttons on the right.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Checkout"
          title="Review items and collect payment"
          subtitle="Use the tender shortcuts to complete the bill and return the table to service."
        />
        {activeOrder ? (
          <div className="mt-4 grid gap-4 xl:grid-cols-[1fr,260px]">
            <div className="space-y-3">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{item.product_name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-slate-950">{currency(item.total_price)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium capitalize transition ${
                    paymentMethod === method
                      ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}

              <div className="rounded-xl bg-slate-900 p-4 text-white">
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Items</span>
                    <span>{displayItems.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tender</span>
                    <span className="capitalize">{paymentMethod}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-3 text-base font-medium text-white">
                    <span>Total due</span>
                    <span>{currency(activeOrder.total_amount)}</span>
                  </div>
                </div>
                <button
                  className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-100"
                  onClick={submit}
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : 'Complete payment'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
            No active order selected.
          </div>
        )}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>

      <FakePaymentGateway
        open={gatewayOpen}
        method={paymentMethod}
        amount={activeOrder?.total_amount || 0}
        processing={submitting}
        onClose={() => {
          if (!submitting) {
            setGatewayOpen(false);
          }
        }}
        onConfirm={finalizePayment}
      />
    </div>
  );
};

export default PaymentScreen;
