import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import ProductCard from '../components/ProductCard';
import StatusBadge from '../components/StatusBadge';
import useAppContext from '../hooks/useAppContext';
import { posApi } from '../services/api';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9]{10}$/;

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
    getSelectedReservation,
    refreshData
  } = useAppContext();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [notes, setNotes] = useState('');
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const selectedTable = tables.find((table) => table.id === selectedTableId) || null;
  const activeOrder = getSelectedOrder();
  const activeReservation = getSelectedReservation();
  const shouldUseReservationAutofill = selectedTable?.status === 'Reserved';

  useEffect(() => {
    if (activeOrder) {
      setCustomer({
        name: activeOrder.customer_name || '',
        email: activeOrder.customer_email || '',
        phone: activeOrder.customer_phone || ''
      });
      return;
    }

    if (shouldUseReservationAutofill && activeReservation) {
      setCustomer({
        name: activeReservation.customer_name || '',
        email: activeReservation.customer_email || '',
        phone: activeReservation.customer_phone || ''
      });
      return;
    }

    if (shouldUseReservationAutofill && selectedTable?.active_reservation) {
      setCustomer({
        name: selectedTable.active_reservation.customer_name || '',
        email: selectedTable.active_reservation.customer_email || '',
        phone: selectedTable.active_reservation.customer_phone || ''
      });
      return;
    }

    setCustomer({
      name: '',
      email: '',
      phone: ''
    });
  }, [
    activeOrder,
    activeReservation?.id,
    activeReservation?.customer_email,
    activeReservation?.customer_name,
    activeReservation?.customer_phone,
    selectedTable?.id,
    selectedTable?.status,
    selectedTable?.active_reservation?.customer_email,
    selectedTable?.active_reservation?.customer_name,
    selectedTable?.active_reservation?.customer_phone,
    shouldUseReservationAutofill
  ]);

  const groupedProducts = useMemo(() => {
    return products.reduce((groups, product) => {
      const category = product.category || 'General';
      groups[category] = groups[category] || [];
      groups[category].push(product);
      return groups;
    }, {});
  }, [products]);

  const categories = useMemo(() => ['All', ...Object.keys(groupedProducts)], [groupedProducts]);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        String(product.category || '').toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, search]);

  const summary = useMemo(() => {
    const subtotal = Number(activeOrder?.total_amount || 0);
    const tax = Number(
      activeOrder?.items?.reduce((sum, item) => {
        const product = products.find((entry) => entry.id === item.product_id);
        return sum + (Number(product?.tax || 0) / 100) * Number(item.total_price || 0);
      }, 0) || 0
    );

    return {
      subtotal,
      tax,
      total: subtotal + tax
    };
  }, [activeOrder, products]);

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

  const validateCustomer = () => {
    if (customer.name.trim().length < 2) {
      throw new Error('Customer name must be at least 2 characters.');
    }

    if (!phonePattern.test(customer.phone.trim())) {
      throw new Error('Phone number must contain exactly 10 digits.');
    }

    if (customer.email.trim() && !emailPattern.test(customer.email.trim().toLowerCase())) {
      throw new Error('Enter a valid customer email address.');
    }
  };

  const createOrAppend = async (productId) => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      if (!selectedTableId) {
        throw new Error('Select a table from the floor first.');
      }

      if (!activeOrder) {
        validateCustomer();

        await posApi.createOrder({
          tableId: selectedTableId,
          sessionId: session?.id || null,
          createdBy: user?.id || null,
          source: 'POS',
          customer: {
            name: customer.name.trim(),
            email: customer.email.trim().toLowerCase() || null,
            phone: customer.phone.trim()
          },
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

    setSuccess('');
    await posApi.removeOrderItem(activeOrder.id, itemId);
    await refreshData();
  };

  const clearOrder = async () => {
    if (!activeOrder?.items?.length) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      for (const item of activeOrder.items) {
        for (let count = 0; count < Number(item.quantity || 1); count += 1) {
          await posApi.removeOrderItem(activeOrder.id, item.id);
        }
      }
      await refreshData();
      setSuccess('Order cleared.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const sendToKitchen = async () => {
    if (!activeOrder) {
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      await posApi.updateOrderStatus(activeOrder.id, 'sent');
      await refreshData();
      setSuccess('Order sent to kitchen successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const saveCustomerDetails = async () => {
    try {
      setSubmitting(true);
      setError('');
      setSuccess('');
      validateCustomer();

      if (!activeOrder?.customer_id) {
        setSuccess('Customer details will be saved with the first item added to this order.');
        return;
      }

      await posApi.updateCustomer(activeOrder.customer_id, {
        name: customer.name.trim(),
        email: customer.email.trim().toLowerCase() || null,
        phone: customer.phone.trim()
      });

      await refreshData();
      setSuccess('Customer details updated.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.3fr),minmax(0,0.7fr)]">
      <aside className="xl:sticky xl:top-4 xl:self-start">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
          <div className="border-b border-slate-200 bg-[linear-gradient(135deg,#ffffff_0%,#f8fafc_100%)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-500">
                  Order summary
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-950">Current order</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Build the ticket, review totals, and send it through quickly.
                </p>
              </div>
              <button
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                onClick={() => navigate('/pos')}
              >
                Floor
              </button>
            </div>
          </div>

          <div className="space-y-4 p-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    Table
                  </p>
                  <p className="mt-1 text-base font-medium text-slate-950">
                    {selectedTable ? `Table ${selectedTable.table_number}` : 'Select a table'}
                  </p>
                </div>
                {selectedTable ? <StatusBadge status={selectedTable.status} /> : null}
              </div>
              <select
                className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
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

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-medium text-slate-950">Customer</h3>
                  <p className="mt-1 text-sm text-slate-500">Name, phone, and email for this bill.</p>
                </div>
                <button
                  className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                  onClick={saveCustomerDetails}
                  disabled={submitting}
                >
                  Save
                </button>
              </div>

              <div className="mt-3 grid gap-3">
                <input
                  className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                  placeholder="Customer name"
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer((current) => ({ ...current, name: event.target.value }))
                  }
                />
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                    placeholder="Phone number"
                    inputMode="numeric"
                    maxLength={10}
                    value={customer.phone}
                    onChange={(event) =>
                      setCustomer((current) => ({
                        ...current,
                        phone: event.target.value.replace(/\D/g, '').slice(0, 10)
                      }))
                    }
                  />
                  <input
                    className="rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                    placeholder="Email address"
                    type="email"
                    value={customer.email}
                    onChange={(event) =>
                      setCustomer((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-medium text-slate-950">Order lines</h3>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                  {displayItems.length || 0} items
                </span>
              </div>

              <div className="mt-3 space-y-3 xl:max-h-[340px] xl:overflow-y-auto xl:pr-1">
                {displayItems.length ? (
                  displayItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncrement={() => createOrAppend(item.product_id)}
                      onDecrement={() => removeItem(item.id)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    Tap products on the right to start this order.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-3">
              <label className="text-base font-medium text-slate-950">Item notes</label>
              <textarea
                className="mt-3 min-h-24 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                placeholder="Optional notes for kitchen handoff"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Subtotal</span>
                  <span>{currency(summary.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Tax</span>
                  <span>{currency(summary.tax)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3 text-lg font-semibold text-white">
                  <span>Total</span>
                  <span>{currency(summary.total)}</span>
                </div>
              </div>

              <button
                className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-4 text-base font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => navigate('/payment')}
                disabled={!activeOrder}
              >
                Pay
              </button>

              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-2">
                <button
                  className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-60"
                  onClick={clearOrder}
                  disabled={!activeOrder?.items?.length || submitting}
                >
                  Clear order
                </button>
                <button
                  className="rounded-xl bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/30 disabled:opacity-60"
                  onClick={sendToKitchen}
                  disabled={!activeOrder || submitting}
                >
                  Send to kitchen
                </button>
                <button
                  className="rounded-xl bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/15"
                  onClick={() => navigate('/pos')}
                >
                  Hold
                </button>
                <button
                  className="rounded-xl border border-dashed border-white/15 px-4 py-3 text-sm font-medium text-slate-400"
                  disabled
                >
                  Transfer
                </button>
              </div>
            </div>

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </div>
            ) : null}
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-600">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
        <div className="border-b border-slate-200 bg-white p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-500">
                Product catalog
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">Add products</h2>
              <p className="mt-1 text-sm text-slate-500">
                Search fast, tap once, and build the order without leaving the cashier screen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600">
                {selectedTable ? `Table ${selectedTable.table_number}` : 'No table'}
              </span>
              <span className="rounded-full bg-violet-50 px-3 py-1.5 font-medium text-violet-700">
                {currency(summary.total)}
              </span>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  Search
                </span>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-20 pr-4 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
                  placeholder="burgers, cold coffee, wraps..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={`rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                      activeCategory === category
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                    }`}
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {visibleProducts.length ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={createOrAppend} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-sm text-slate-500">
              No products matched that search.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default OrderScreen;
