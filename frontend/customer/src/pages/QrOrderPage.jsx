import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import CartSheet from '../components/CartSheet';
import HeaderBar from '../components/HeaderBar';
import ProductCard from '../components/ProductCard';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[0-9]{10}$/;

const QrOrderPage = ({ tokenOverride = '' }) => {
  const { token: routeToken } = useParams();
  const navigate = useNavigate();
  const token = tokenOverride || routeToken || '';
  const {
    customer,
    cart,
    addToCart,
    updateCartQuantity,
    updateCustomer,
    setTable,
    setCheckoutMode,
    setLatestOrder
  } = useAppContext();
  const [tableData, setTableData] = useState(null);
  const [products, setProducts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const emailError =
    customer.email && !emailPattern.test(customer.email) ? 'Enter a valid email address.' : '';
  const phoneError =
    customer.phone && !phonePattern.test(customer.phone)
      ? 'Phone number must contain exactly 10 digits.'
      : '';

  useEffect(() => {
    if (!token) {
      setError('QR token is missing.');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const [tableResponse, productResponse] = await Promise.all([
          customerApi.getTableByToken(token),
          customerApi.listProducts()
        ]);

        setTableData(tableResponse.data);
        setTable(tableResponse.data);
        setLatestOrder(null);
        setProducts(productResponse.data);
        setError('');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((product) => product.category).filter(Boolean)))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        String(product.category || '').toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, products, search]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const continueToCheckout = () => {
    if (customer.name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (!phonePattern.test(customer.phone.trim())) {
      setError('Phone number must contain exactly 10 digits.');
      return;
    }

    if (customer.email.trim() && !emailPattern.test(customer.email.trim().toLowerCase())) {
      setError('Enter a valid email address.');
      return;
    }

    if (cart.length === 0) {
      setError('Add at least one item before checkout.');
      return;
    }

    setCheckoutMode('order');
    setError('');
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-md">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-3">
              <div className="aspect-[4/3] animate-pulse rounded-lg bg-slate-200" />
              <div className="mt-3 h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && !tableData) {
    return <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="QR guest"
          title={`Table ${tableData?.table_number} is ready`}
          subtitle="The table is already detected from your QR code, so you can focus on ordering."
        >
          <span className="rounded-lg bg-violet-100 px-3 py-2 text-xs font-medium uppercase tracking-[0.18em] text-violet-700">
            Token {token}
          </span>
        </HeaderBar>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            placeholder="Your name"
            value={customer.name}
            onChange={(event) => updateCustomer({ name: event.target.value })}
          />
          <input
            className={`rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
              phoneError
                ? 'border-rose-300 bg-rose-50/60 focus:border-rose-300 focus:ring-rose-100'
                : 'border-slate-200 focus:border-violet-300 focus:ring-violet-100'
            }`}
            placeholder="Phone number"
            value={customer.phone}
            inputMode="numeric"
            maxLength={10}
            onChange={(event) =>
              updateCustomer({
                phone: event.target.value.replace(/\D/g, '').slice(0, 10)
              })
            }
          />
          <input
            className={`rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 ${
              emailError
                ? 'border-rose-300 bg-rose-50/60 focus:border-rose-300 focus:ring-rose-100'
                : 'border-slate-200 focus:border-violet-300 focus:ring-violet-100'
            }`}
            placeholder="Email for bill"
            type="email"
            value={customer.email}
            onChange={(event) => updateCustomer({ email: event.target.value })}
          />
        </div>
        {phoneError ? <p className="mt-3 text-sm text-rose-600">{phoneError}</p> : null}
        {emailError ? <p className="mt-2 text-sm text-rose-600">{emailError}</p> : null}
      </section>

      <div className="grid gap-4 xl:grid-cols-[1fr,320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <div className="space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="Search food or drinks"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeCategory === category
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {filteredProducts.length ? (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} onAdd={addToCart} />
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-sm text-slate-500">
              No matching menu items found.
            </div>
          )}
        </section>

        <aside className="hidden xl:block">
          <div className="sticky top-4 rounded-xl border border-slate-200 bg-white p-4 shadow-md">
            <HeaderBar
              eyebrow="QR cart"
              title={`${totalItems} items selected`}
              subtitle="This order is locked to the scanned table."
            />
            <div className="mt-4 rounded-xl bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Estimated total</span>
                <span className="text-base font-medium">Rs. {totalAmount.toFixed(2)}</span>
              </div>
              <button
                className="mt-4 w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-slate-900"
                onClick={continueToCheckout}
              >
                Continue to checkout
              </button>
            </div>
            <button
              className="mt-3 w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
              onClick={() => setCartOpen(true)}
            >
              View cart
            </button>
          </div>
        </aside>
      </div>

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
          setCartOpen(false);
          continueToCheckout();
        }}
      />

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur xl:hidden">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-left text-white"
            onClick={() => setCartOpen(true)}
          >
            <span className="block text-xs uppercase tracking-[0.18em] text-slate-300">Cart</span>
            <span className="text-sm font-medium">{totalItems} items | Rs. {totalAmount.toFixed(2)}</span>
          </button>
          <button
            className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white"
            onClick={continueToCheckout}
          >
            Checkout
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}
    </div>
  );
};

export default QrOrderPage;
