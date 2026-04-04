import { useMemo, useState } from 'react';
import HeaderBar from '../components/HeaderBar';
import OrderCard from '../components/OrderCard';
import StatusBadge from '../components/StatusBadge';
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
  const [activeFilter, setActiveFilter] = useState('all');
  const { orders, loading, syncing, refreshOrders, patchOrder, patchOrderByItemId } =
    useAppContext();

  const updateStatus = async (orderId, status) => {
    const previousOrder = orders.find((order) => order.id === orderId);

    patchOrder(orderId, (order) => ({ ...order, status }));

    try {
      await kitchenApi.updateOrderStatus(orderId, status);
      await refreshOrders({ silent: true });
    } catch (error) {
      if (previousOrder) {
        patchOrder(orderId, () => previousOrder);
      }
      throw error;
    }
  };

  const togglePrepared = async (itemId, currentValue) => {
    const nextPrepared = !currentValue;
    const previousOrders = orders;

    patchOrderByItemId(itemId, (item) => ({
      ...item,
      is_prepared: nextPrepared
    }));

    try {
      await kitchenApi.markItemPrepared(itemId, nextPrepared);
      await refreshOrders({ silent: true });
    } catch (error) {
      const previousOrder = previousOrders.find((order) =>
        order.items?.some((item) => item.id === itemId)
      );

      if (previousOrder) {
        patchOrder(previousOrder.id, () => previousOrder);
      }

      throw error;
    }
  };

  const counts = useMemo(
    () => ({
      all: orders.length,
      sent: orders.filter((order) => order.status === 'sent').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      completed: orders.filter((order) => order.status === 'completed').length
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return orders;
    }

    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter, orders]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="KDS"
          title="Prep queue"
          subtitle="Move tickets through kitchen stages with quick visual scanning and single-tap actions."
        >
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${syncing ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            {loading ? 'Loading' : syncing ? 'Syncing' : 'Live'}
          </div>
        </HeaderBar>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'sent', label: 'To Cook' },
            { key: 'preparing', label: 'Ready' },
            { key: 'completed', label: 'Completed' }
          ].map((filter) => (
            <button
              key={filter.key}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeFilter === filter.key
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setActiveFilter(filter.key)}
            >
              <span>{filter.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  activeFilter === filter.key ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                }`}
              >
                {counts[filter.key]}
              </span>
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-3">
        {lanes.map((lane) => {
          const laneOrders = filteredOrders.filter((order) => order.status === lane.status);

          return (
            <section key={lane.status} className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-medium text-slate-950">{lane.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {lane.status === 'sent'
                      ? 'New tickets waiting for prep.'
                      : lane.status === 'preparing'
                        ? 'Orders currently being worked on.'
                        : 'Completed orders ready for pickup or payment.'}
                  </p>
                </div>
                <StatusBadge status={lane.status} className="rounded-lg" />
              </div>

              <div className="mt-4 space-y-4">
                {laneOrders.length ? (
                  laneOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onAdvance={async (orderId) => {
                        try {
                          await updateStatus(orderId, nextStatus[lane.status]);
                        } catch {}
                      }}
                      onToggleItem={async (itemId, currentValue) => {
                        try {
                          await togglePrepared(itemId, currentValue);
                        } catch {}
                      }}
                    />
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                    {loading ? 'Refreshing board...' : 'No tickets in this column.'}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default KitchenBoard;
