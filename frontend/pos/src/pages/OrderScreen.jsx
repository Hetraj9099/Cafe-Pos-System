import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';
import { posApi } from '../services/api';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const OrderScreen = () => {
  const navigate = useNavigate();
  const {
    user,
    session,
    tables,
    products,
    selectedTableId,
    setSelectedTableId,
    getSelectedOrder,
    refreshData
  } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedTable = tables.find((table) => table.id === selectedTableId) || null;
  const activeOrder = getSelectedOrder();

  const groupedProducts = useMemo(() => {
    return products.reduce((groups, product) => {
      groups[product.category] = groups[product.category] || [];
      groups[product.category].push(product);
      return groups;
    }, {});
  }, [products]);

  const createOrAppend = async (productId) => {
    try {
      setSubmitting(true);
      setError('');

      if (!selectedTableId) {
        throw new Error('Select a table from the floor first.');
      }

      if (!activeOrder) {
        await posApi.createOrder({
          tableId: selectedTableId,
          sessionId: session?.id || null,
          createdBy: user?.id || null,
          source: 'POS',
          items: [{ productId, quantity: 1 }]
        });
      } else {
        await posApi.addOrderItem(activeOrder.id, { productId, quantity: 1 });
      }

      await refreshData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const removeItem = async (itemId) => {
    if (!activeOrder) {
      return;
    }

    await posApi.removeOrderItem(activeOrder.id, itemId);
    await refreshData();
  };

  const sendToKitchen = async () => {
    if (!activeOrder) {
      return;
    }

    await posApi.updateOrderStatus(activeOrder.id, 'sent');
    await refreshData();
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr,1.25fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Selected table</h2>
            <p className="mt-1 text-sm text-slate-600">
              Pick a table and build the order before sending it to the kitchen.
            </p>
          </div>
          <button
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700"
            onClick={() => navigate('/pos')}
          >
            Back to floor
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <select
            className="rounded-2xl border border-slate-200 px-4 py-3"
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
        </div>

        <div className="mt-5 rounded-[28px] bg-slate-50 p-5">
          <h3 className="text-lg font-semibold text-slate-950">
            {selectedTable ? `Table ${selectedTable.table_number}` : 'No table selected'}
          </h3>
          <div className="mt-4 space-y-3">
            {activeOrder?.items?.length ? (
              activeOrder.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-900">{item.product_name}</p>
                    <p className="text-sm text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-slate-900">{currency(item.total_price)}</p>
                    <button
                      className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No items on this ticket yet.</p>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between">
              <span>Total</span>
              <span className="text-xl font-semibold">
                {currency(activeOrder?.total_amount || 0)}
              </span>
            </div>
            <button
              className="mt-4 w-full rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
              onClick={sendToKitchen}
              disabled={!activeOrder || submitting}
            >
              Send to kitchen
            </button>
          </div>
          {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        </div>
      </section>

      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-950">Menu</h2>
        <div className="mt-5 space-y-5">
          {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-600">
                {category}
              </h3>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {categoryProducts.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-[28px] border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          Prep {product.prep_time_minutes} min
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{currency(product.price)}</p>
                        <button
                          className="mt-3 rounded-full bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                          onClick={() => createOrAppend(product.id)}
                          disabled={submitting}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OrderScreen;
