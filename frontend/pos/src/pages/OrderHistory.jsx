import { useEffect, useState } from 'react';
import { posApi } from '../services/api';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = async () => {
    try {
      setError('');
      const response = await posApi.listOrders({});
      setOrders(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = window.setInterval(loadOrders, 5000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-medium text-slate-950">Order history</h2>
          <p className="mt-1 text-sm text-slate-500">
            Review past and active tickets with customer, table, time, and total at a glance.
          </p>
        </div>
        <button
          className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
          onClick={loadOrders}
        >
          Refresh
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

      {loading ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">
          Loading order history...
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
          <div className="hidden grid-cols-[1.2fr,0.9fr,1fr,0.9fr,0.8fr] gap-4 bg-slate-50 px-5 py-4 text-xs font-medium uppercase tracking-[0.18em] text-slate-500 md:grid">
            <span>Customer</span>
            <span>Table</span>
            <span>Time</span>
            <span>Status</span>
            <span className="text-right">Total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {orders.length > 0 ? (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 md:grid-cols-[1.2fr,0.9fr,1fr,0.9fr,0.8fr] md:items-center md:gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {order.customer_name || 'Walk-in customer'}
                    </p>
                    <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {order.table_number ? `Table ${order.table_number}` : 'No table'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900">
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-700">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="font-semibold text-slate-900">{currency(order.total_amount)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-5 py-8 text-sm text-slate-500">No orders recorded yet.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default OrderHistory;
