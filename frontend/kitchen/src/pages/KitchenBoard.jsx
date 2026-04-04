import { useMemo, useState } from 'react';
import HeaderBar from '../components/HeaderBar';
import OrderCard from '../components/OrderCard';
import useAppContext from '../hooks/useAppContext';
import { kitchenApi } from '../services/api';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'sent', label: 'To Cook' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'completed', label: 'Ready' },
  { key: 'done', label: 'Completed' }
];

const lanes = [
  {
    status: 'sent',
    title: 'To Cook',
    subtitle: 'Fresh tickets waiting to be picked up by the line.',
    empty: 'No new tickets right now.',
    tone: 'bg-rose-50 border-rose-200'
  },
  {
    status: 'preparing',
    title: 'Preparing',
    subtitle: 'Items actively being cooked and plated.',
    empty: 'Nothing is being prepared.',
    tone: 'bg-amber-50 border-amber-200'
  },
  {
    status: 'completed',
    title: 'Ready',
    subtitle: 'Orders completed and ready for pickup or payment.',
    empty: 'Nothing is waiting at the pass.',
    tone: 'bg-emerald-50 border-emerald-200'
  }
];

const nextStatus = {
  sent: 'preparing',
  preparing: 'completed',
  completed: 'completed'
};

const KitchenBoard = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [pendingOrderIds, setPendingOrderIds] = useState([]);
  const [pendingItemIds, setPendingItemIds] = useState([]);
  const { orders, loading, syncing, refreshOrders, patchOrder, patchOrderByItemId } =
    useAppContext();

  const updateStatus = async (orderId, status) => {
    if (pendingOrderIds.includes(orderId)) {
      return;
    }

    const previousOrder = orders.find((order) => order.id === orderId);
    setPendingOrderIds((current) => [...current, orderId]);

    patchOrder(orderId, (order) => ({ ...order, status }));

    try {
      await kitchenApi.updateOrderStatus(orderId, status);
      await refreshOrders({ silent: true });
    } catch (error) {
      if (previousOrder) {
        patchOrder(orderId, () => previousOrder);
      }
      throw error;
    } finally {
      setPendingOrderIds((current) => current.filter((id) => id !== orderId));
    }
  };

  const togglePrepared = async (itemId, currentValue) => {
    if (pendingItemIds.includes(itemId)) {
      return;
    }

    const nextPrepared = !currentValue;
    const previousOrders = orders;
    setPendingItemIds((current) => [...current, itemId]);

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
    } finally {
      setPendingItemIds((current) => current.filter((id) => id !== itemId));
    }
  };

  const counts = useMemo(
    () => ({
      all: orders.length,
      sent: orders.filter((order) => order.status === 'sent').length,
      preparing: orders.filter((order) => order.status === 'preparing').length,
      completed: orders.filter((order) => order.status === 'completed').length,
      done: orders.filter((order) => order.status === 'paid').length
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    if (activeFilter === 'all') {
      return orders.filter((order) => order.status !== 'paid');
    }

    if (activeFilter === 'done') {
      return orders.filter((order) => order.status === 'paid');
    }

    return orders.filter((order) => order.status === activeFilter);
  }, [activeFilter, orders]);

  const visibleLaneOrders = (status) => filteredOrders.filter((order) => order.status === status);

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Kitchen display"
          title="Live kitchen workflow"
          subtitle="Scan fast, tap cards to move stages, and keep the pass visible under pressure."
        >
          <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600">
            <span className={`h-2.5 w-2.5 rounded-full ${syncing ? 'bg-amber-400' : 'bg-emerald-500'}`} />
            {loading ? 'Loading board' : syncing ? 'Syncing' : 'Live'}
          </div>
        </HeaderBar>

        <div className="mt-4 flex flex-wrap gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeFilter === tab.key
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              onClick={() => setActiveFilter(tab.key)}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  activeFilter === tab.key ? 'bg-white/15 text-white' : 'bg-white text-slate-600'
                }`}
              >
                {counts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeFilter === 'done' ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-medium text-slate-950">Completed kitchen tickets</h2>
              <p className="mt-1 text-sm text-slate-500">
                Orders already closed out from the kitchen flow.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600">
              {counts.done} tickets
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.length ? (
              filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  advancing={false}
                  busyItemIds={new Set()}
                  onAdvance={async () => {}}
                  onToggleItem={async () => {}}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
                No completed kitchen tickets yet.
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {lanes.map((lane) => {
            const laneOrders = visibleLaneOrders(lane.status);

            return (
              <section
                key={lane.status}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md"
              >
                <div className={`rounded-2xl border p-4 ${lane.tone}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
                        {lane.title}
                      </p>
                      <h2 className="mt-2 text-lg font-semibold text-slate-950">{lane.title}</h2>
                      <p className="mt-1 text-sm text-slate-600">{lane.subtitle}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm">
                      {laneOrders.length}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  {laneOrders.length ? (
                    laneOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        advancing={pendingOrderIds.includes(order.id)}
                        busyItemIds={new Set(pendingItemIds)}
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
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                      {loading ? 'Refreshing board...' : lane.empty}
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KitchenBoard;
