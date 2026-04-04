import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const ReservationPage = () => {
  const navigate = useNavigate();
  const {
    customer,
    cart,
    addToCart,
    updateCartQuantity,
    updateCustomer,
    setCheckoutMode
  } = useAppContext();
  const [reservationTime, setReservationTime] = useState('');
  const [availability, setAvailability] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [prepaid, setPrepaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    customerApi.listProducts().then((response) => setProducts(response.data)).catch(() => {});
  }, []);

  const fetchAvailability = async () => {
    if (!reservationTime) {
      return;
    }

    try {
      setLoading(true);
      const response = await customerApi.getAvailability(reservationTime);
      setAvailability(response.data);
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const preorderTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Reserve your table</h2>
        <p className="mt-2 text-sm text-slate-600">
          Pick a date, find open tables, and optionally add a preorder before arrival.
        </p>

        <div className="mt-4 grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Name"
            value={customer.name}
            onChange={(event) => updateCustomer({ name: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Phone"
            value={customer.phone}
            onChange={(event) => updateCustomer({ phone: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            placeholder="Email"
            value={customer.email}
            onChange={(event) => updateCustomer({ email: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            type="datetime-local"
            value={reservationTime}
            onChange={(event) => setReservationTime(event.target.value)}
          />
          <button
            className="rounded-2xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white"
            onClick={fetchAvailability}
          >
            {loading ? 'Checking tables...' : 'View table availability'}
          </button>
        </div>
      </section>

      {error ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {availability.length > 0 ? (
        <section className="rounded-[28px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">Available tables</h3>
            <span className="text-xs uppercase tracking-[0.24em] text-emerald-600">
              Live availability
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {availability.map((table) => (
              <button
                key={table.id}
                className={`rounded-3xl border px-4 py-5 text-left ${
                  selectedTableId === table.id
                    ? 'border-emerald-900 bg-emerald-950 text-white'
                    : table.is_available
                      ? 'border-emerald-100 bg-emerald-50'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}
                disabled={!table.is_available}
                onClick={() => setSelectedTableId(table.id)}
              >
                <div className="text-sm font-semibold">Table {table.table_number}</div>
                <div className="mt-1 text-xs">Seats {table.seats}</div>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Optional preorder</h3>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {currency(preorderTotal)}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {products.map((product) => {
            const item = cart.find((entry) => entry.productId === product.id);

            return (
              <div
                key={product.id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-slate-900">{product.name}</div>
                    <div className="text-sm text-slate-500">{currency(product.price)}</div>
                  </div>

                  {!item ? (
                    <button
                      className="rounded-full bg-emerald-900 px-4 py-2 text-sm font-medium text-white"
                      onClick={() => addToCart(product)}
                    >
                      Add
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        className="h-8 w-8 rounded-full bg-white"
                        onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="text-sm font-semibold">{item.quantity}</span>
                      <button
                        className="h-8 w-8 rounded-full bg-emerald-900 text-white"
                        onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <label className="mt-4 flex items-center gap-3 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
          <input
            type="checkbox"
            checked={prepaid}
            onChange={(event) => setPrepaid(event.target.checked)}
          />
          Pay for preorder now
        </label>

        <button
          className="mt-4 w-full rounded-2xl bg-emerald-950 px-4 py-3 text-base font-semibold text-white"
          onClick={() => {
            setCheckoutMode('reservation');
            navigate('/checkout', {
              state: {
                reservationTime,
                selectedTableId,
                prepaid
              }
            });
          }}
        >
          Continue reservation
        </button>
      </section>
    </div>
  );
};

export default ReservationPage;
