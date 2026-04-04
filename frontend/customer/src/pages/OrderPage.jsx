import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CartSheet from '../components/CartSheet';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const OrderPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    customer,
    cart,
    addToCart,
    updateCartQuantity,
    updateCustomer,
    setTable,
    setCheckoutMode
  } = useAppContext();
  const [tableData, setTableData] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [tableResponse, productResponse] = await Promise.all([
          customerApi.getTableByToken(token),
          customerApi.listProducts()
        ]);

        setTableData(tableResponse.data);
        setTable(tableResponse.data);
        setProducts(productResponse.data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, setTable]);

  const groupedProducts = useMemo(() => {
    return products.reduce((groups, product) => {
      groups[product.category] = groups[product.category] || [];
      groups[product.category].push(product);
      return groups;
    }, {});
  }, [products]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <div className="rounded-[28px] bg-white p-6 text-sm text-slate-600">Loading menu...</div>;
  }

  if (error) {
    return <div className="rounded-[28px] bg-rose-50 p-6 text-sm text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">Ordering for</p>
            <h2 className="text-2xl font-semibold text-slate-900">
              Table {tableData?.table_number}
            </h2>
          </div>
          <div className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
            Scan-to-order
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
            placeholder="Your name"
            value={customer.name}
            onChange={(event) => updateCustomer({ name: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
            placeholder="Phone number"
            value={customer.phone}
            onChange={(event) => updateCustomer({ phone: event.target.value })}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none ring-0"
            placeholder="Email for bill (optional)"
            value={customer.email}
            onChange={(event) => updateCustomer({ email: event.target.value })}
          />
        </div>
      </section>

      {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
        <section key={category} className="rounded-[28px] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Fresh picks
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {categoryProducts.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-base font-semibold text-slate-900">{product.name}</h4>
                    <p className="mt-1 text-sm text-slate-600">
                      Prep time {product.prep_time_minutes} min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-semibold text-slate-900">
                      {currency(product.price)}
                    </p>
                    <button
                      className="mt-3 rounded-full bg-emerald-900 px-4 py-2 text-sm font-medium text-white"
                      onClick={() => addToCart(product)}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      <CartSheet
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onIncrement={(productId) => {
          const item = cart.find((entry) => entry.productId === productId);
          updateCartQuantity(productId, (item?.quantity || 0) + 1);
        }}
        onDecrement={(productId) => {
          const item = cart.find((entry) => entry.productId === productId);
          updateCartQuantity(productId, (item?.quantity || 0) - 1);
        }}
        onCheckout={() => {
          setCheckoutMode('order');
          setCartOpen(false);
          navigate('/checkout');
        }}
      />

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto flex max-w-md items-center gap-3 border-t border-emerald-100 bg-white/95 px-4 py-4 backdrop-blur">
        <button
          className="flex-1 rounded-2xl bg-emerald-950 px-5 py-3 text-left text-white"
          onClick={() => setCartOpen(true)}
        >
          <span className="block text-xs uppercase tracking-[0.18em] text-emerald-200">
            Cart
          </span>
          <span className="text-base font-semibold">{totalItems} items selected</span>
        </button>
        <button
          className="rounded-2xl bg-emerald-100 px-5 py-3 text-sm font-semibold text-emerald-900"
          onClick={() => {
            setCheckoutMode('order');
            navigate('/checkout');
          }}
        >
          Quick Pay
        </button>
      </div>
    </div>
  );
};

export default OrderPage;
