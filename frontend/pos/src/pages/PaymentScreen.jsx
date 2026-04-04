import { useMemo, useState } from 'react';
import useAppContext from '../hooks/useAppContext';
import { posApi } from '../services/api';

const paymentMethods = ['cash', 'card', 'upi'];
const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const PaymentScreen = () => {
  const { tables, selectedTableId, setSelectedTableId, getSelectedOrder, refreshData } = useAppContext();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeOrder = useMemo(() => getSelectedOrder(), [getSelectedOrder, selectedTableId]);

  const submit = async () => {
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

      await refreshData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Choose table</h2>
        <select
          className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3"
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
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Payment summary</h2>
        {activeOrder ? (
          <>
            <div className="mt-5 space-y-3">
              {activeOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.product_name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-slate-900">{currency(item.total_price)}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold capitalize ${
                    paymentMethod === method
                      ? 'bg-sky-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                  onClick={() => setPaymentMethod(method)}
                >
                  {method}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-[28px] bg-sky-950 p-5 text-white">
              <div className="flex items-center justify-between">
                <span>Total due</span>
                <span className="text-2xl font-bold">{currency(activeOrder.total_amount)}</span>
              </div>
              <button
                className="mt-4 w-full rounded-2xl bg-white px-4 py-3 font-semibold text-sky-950"
                onClick={submit}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Complete payment'}
              </button>
            </div>
          </>
        ) : (
          <p className="mt-5 text-sm text-slate-500">No active order selected.</p>
        )}
        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}
      </section>
    </div>
  );
};

export default PaymentScreen;
