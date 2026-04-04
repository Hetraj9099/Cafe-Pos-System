import useAppContext from '../hooks/useAppContext';
import { kitchenApi } from '../services/api';

const lanes = [
  { title: 'To Cook', status: 'sent' },
  { title: 'Preparing', status: 'preparing' },
  { title: 'Completed', status: 'completed' }
];

const nextStatus = {
  sent: 'preparing',
  preparing: 'completed',
  completed: 'completed'
};

const KitchenBoard = () => {
  const { orders, loading, refreshOrders } = useAppContext();

  const updateStatus = async (orderId, status) => {
    await kitchenApi.updateOrderStatus(orderId, status);
    await refreshOrders();
  };

  const togglePrepared = async (itemId, currentValue) => {
    await kitchenApi.markItemPrepared(itemId, !currentValue);
    await refreshOrders();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {lanes.map((lane) => (
        <section key={lane.status} className="rounded-[32px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-950">{lane.title}</h2>
            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
              {orders.filter((order) => order.status === lane.status).length}
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {orders
              .filter((order) => order.status === lane.status)
              .map((order) => (
                <article
                  key={order.id}
                  className="rounded-[28px] border border-orange-100 bg-orange-50/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">
                        Table {order.table_number || 'N/A'}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {order.customer_name || 'Walk-in'} • {order.source}
                      </p>
                    </div>
                    <button
                      className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
                      onClick={() => updateStatus(order.id, nextStatus[lane.status])}
                    >
                      {lane.status === 'completed' ? 'Done' : 'Move'}
                    </button>
                  </div>

                  <div className="mt-4 space-y-2">
                    {order.items.map((item) => (
                      <button
                        key={item.id}
                        className={`flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left ${
                          item.is_prepared
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-white text-slate-900'
                        }`}
                        onClick={() => togglePrepared(item.id, item.is_prepared)}
                      >
                        <span>
                          {item.product_name} x {item.quantity}
                        </span>
                        <span className="text-xs font-semibold uppercase tracking-[0.18em]">
                          {item.is_prepared ? 'Ready' : 'Pending'}
                        </span>
                      </button>
                    ))}
                  </div>
                </article>
              ))}

            {!orders.some((order) => order.status === lane.status) ? (
              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                {loading ? 'Refreshing board...' : 'No tickets in this column.'}
              </div>
            ) : null}
          </div>
        </section>
      ))}
    </div>
  );
};

export default KitchenBoard;
