import { useState } from 'react';
import useAppContext from '../hooks/useAppContext';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;
const imageToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Could not read the selected image.'));
    reader.readAsDataURL(file);
  });

const Dashboard = () => {
  const { overview, cuisines, products, createCuisine, createProduct, updateProduct } =
    useAppContext();
  const [form, setForm] = useState({
    name: '',
    cuisine: '',
    price: '',
    tax: '5',
    prepTimeMinutes: '15',
    imageUrl: ''
  });
  const [newCuisine, setNewCuisine] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingProductId, setEditingProductId] = useState('');

  if (!overview) {
    return (
      <div className="rounded-[32px] bg-white p-6 text-sm text-slate-600">Loading dashboard...</div>
    );
  }

  const cards = [
    { label: 'Revenue Today', value: currency(overview.sales.total_revenue) },
    { label: 'Paid Orders', value: overview.sales.paid_orders || 0 },
    { label: 'Total Orders', value: overview.sales.total_orders || 0 },
    { label: 'Customers', value: overview.customerStats.total_customers || 0 }
  ];

  const maxRevenue = Math.max(1, ...overview.trends.map((entry) => Number(entry.revenue || 0)));
  const sortedProductAnalytics = [...overview.productAnalytics].sort((left, right) => {
    const soldDifference = Number(right.items_sold || 0) - Number(left.items_sold || 0);

    if (soldDifference !== 0) {
      return soldDifference;
    }

    return Number(right.revenue || 0) - Number(left.revenue || 0);
  });
  const pieProducts = sortedProductAnalytics.filter((product) => Number(product.items_sold || 0) > 0).slice(0, 5);
  const pieTotal = pieProducts.reduce((total, product) => total + Number(product.items_sold || 0), 0);
  const pieColors = ['#0f172a', '#0369a1', '#0ea5e9', '#38bdf8', '#7dd3fc'];
  let cumulativeDegrees = 0;
  const pieSegments = pieProducts.map((product, index) => {
    const productValue = Number(product.items_sold || 0);
    const segmentDegrees = pieTotal > 0 ? (productValue / pieTotal) * 360 : 0;
    const start = cumulativeDegrees;
    const end = cumulativeDegrees + segmentDegrees;
    cumulativeDegrees = end;

    return {
      ...product,
      color: pieColors[index % pieColors.length],
      start,
      end,
      percentage: pieTotal > 0 ? (productValue / pieTotal) * 100 : 0
    };
  });
  const pieBackground =
    pieSegments.length > 0
      ? `conic-gradient(${pieSegments
          .map((segment) => `${segment.color} ${segment.start}deg ${segment.end}deg`)
          .join(', ')})`
      : 'conic-gradient(#e2e8f0 0deg 360deg)';

  const resetForm = () => {
    setForm({
      name: '',
      cuisine: '',
      price: '',
      tax: '5',
      prepTimeMinutes: '15',
      imageUrl: ''
    });
    setEditingProductId('');
  };

  const startEditing = (product) => {
    setEditingProductId(product.id);
    setError('');
    setSuccess('');
    setForm({
      name: product.name || '',
      cuisine: product.category || '',
      price: String(product.price ?? ''),
      tax: String(product.tax ?? '5'),
      prepTimeMinutes: String(product.prep_time_minutes ?? '15'),
      imageUrl: product.image_url || ''
    });
  };

  const submitCuisine = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (newCuisine.trim().length < 2) {
        throw new Error('Cuisine name must be at least 2 characters.');
      }

      await createCuisine({ name: newCuisine.trim() });
      setForm((current) => ({ ...current, cuisine: newCuisine.trim() }));
      setNewCuisine('');
      setSuccess('Cuisine created successfully.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const submitProduct = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (form.name.trim().length < 2) {
        throw new Error('Food item name must be at least 2 characters.');
      }

      if (form.cuisine.trim().length < 2) {
        throw new Error('Cuisine selection is required.');
      }

      if (Number(form.price) < 0) {
        throw new Error('Price must be 0 or more.');
      }

      if (Number(form.tax) < 0) {
        throw new Error('Tax must be 0 or more.');
      }

      if (Number(form.prepTimeMinutes) < 0) {
        throw new Error('Prep time must be 0 or more.');
      }

      const payload = {
        name: form.name.trim(),
        category: form.cuisine.trim(),
        imageUrl: form.imageUrl || null,
        price: Number(form.price),
        tax: Number(form.tax),
        prepTimeMinutes: Number(form.prepTimeMinutes)
      };

      if (editingProductId) {
        await updateProduct(editingProductId, payload);
        setSuccess('Food item updated successfully.');
      } else {
        await createProduct(payload);
        setSuccess('New food item added successfully.');
      }

      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-[28px] bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-sky-950">{card.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.25fr,0.95fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-sky-950">Revenue trend</h2>
            <div className="mt-6 flex items-end gap-3">
              {overview.trends.map((entry) => (
                <div key={entry.day} className="flex-1">
                  <div className="flex h-56 items-end justify-center rounded-3xl bg-sky-50 p-3">
                    <div
                      className="w-16 max-w-full rounded-2xl bg-sky-800"
                      style={{
                        height: `${Math.max(12, (Number(entry.revenue || 0) / maxRevenue) * 100)}%`
                      }}
                    />
                  </div>
                  <p className="mt-2 text-center text-xs text-slate-500">
                    {new Date(entry.day).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-sky-950">Most sold items</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Share of sold units across the current top-performing menu items.
                </p>
              </div>
              <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                {pieTotal} sold
              </div>
            </div>
            <div className="mt-5 grid gap-5 lg:grid-cols-[0.82fr,1.18fr]">
              <div className="flex items-center justify-center">
                <div
                  className="relative flex h-52 w-52 items-center justify-center rounded-full"
                  style={{ background: pieBackground }}
                >
                  <div className="flex h-28 w-28 flex-col items-center justify-center rounded-full bg-white text-center shadow-sm">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                      Top items
                    </span>
                    <span className="mt-2 text-2xl font-semibold text-sky-950">{pieTotal}</span>
                    <span className="text-xs text-slate-500">units sold</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {pieSegments.length > 0 ? (
                  pieSegments.map((product) => (
                    <div key={product.id} className="rounded-2xl bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3.5 w-3.5 rounded-full"
                            style={{ backgroundColor: product.color }}
                          />
                          <div>
                            <p className="font-semibold text-slate-900">{product.name}</p>
                            <p className="text-sm text-slate-500">{product.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900">{product.items_sold} sold</p>
                          <p className="text-sm text-slate-500">
                            {product.percentage.toFixed(0)}% of top items
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                    Product sales will appear here once orders start flowing through the system.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-sky-950">Payment mix</h2>
            <div className="mt-5 space-y-3">
              {overview.paymentBreakdown.map((item) => (
                <div key={item.payment_method}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-slate-600">{item.payment_method}</span>
                    <span className="font-semibold text-slate-900">
                      {currency(item.total_amount)}
                    </span>
                  </div>
                  <div className="mt-2 h-3 rounded-full bg-sky-50">
                    <div
                      className="h-full rounded-full bg-sky-700"
                      style={{
                        width: `${Math.min(100, Number(item.total_amount || 0) / 10)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-sky-950">Top selling items</h2>
            <div className="mt-5 space-y-3">
              {sortedProductAnalytics.map((product) => (
                <div key={product.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Sold {product.items_sold} • Revenue {currency(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-sky-950">
                {editingProductId ? 'Edit food item' : 'Add food item'}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Cuisine is the single food classification. Create cuisines once, then choose them
                from the dropdown while adding or editing items.
              </p>
            </div>
            <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
              Product setup
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Food item name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            />
            <select
              className="rounded-2xl border border-slate-200 px-4 py-3"
              value={form.cuisine}
              onChange={(event) =>
                setForm((current) => ({ ...current, cuisine: event.target.value }))
              }
            >
              <option value="">Select cuisine</option>
              {cuisines.map((cuisine) => (
                <option key={cuisine.id} value={cuisine.name}>
                  {cuisine.name}
                </option>
              ))}
            </select>
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Tax %"
              type="number"
              min="0"
              step="0.01"
              value={form.tax}
              onChange={(event) => setForm((current) => ({ ...current, tax: event.target.value }))}
            />
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2"
              placeholder="Prep time in minutes"
              type="number"
              min="0"
              value={form.prepTimeMinutes}
              onChange={(event) =>
                setForm((current) => ({ ...current, prepTimeMinutes: event.target.value }))
              }
            />
          </div>

          <div className="mt-4 rounded-[28px] bg-slate-50 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end">
              <div className="flex-1">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Create new cuisine
                </label>
                <input
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Enter cuisine name"
                  value={newCuisine}
                  onChange={(event) => setNewCuisine(event.target.value)}
                />
              </div>
              <button
                className="rounded-2xl bg-sky-950 px-5 py-3 font-semibold text-white disabled:opacity-60"
                onClick={submitCuisine}
                disabled={saving}
              >
                Add cuisine
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[28px] bg-slate-50 p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Food image</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a photo or keep this empty for a text-only item card.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl bg-sky-950 px-4 py-3 text-sm font-semibold text-white">
                Choose image
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={async (event) => {
                    const file = event.target.files?.[0];

                    if (!file) {
                      return;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                      setError('Image must be smaller than 2 MB.');
                      return;
                    }

                    try {
                      setError('');
                      const imageUrl = await imageToDataUrl(file);
                      setForm((current) => ({ ...current, imageUrl }));
                    } catch (requestError) {
                      setError(requestError.message);
                    }
                  }}
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[0.85fr,1.15fr]">
              <div className="flex h-44 items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-slate-200 bg-white">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.name || 'Food preview'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <p className="px-6 text-center text-sm text-slate-400">
                    Image preview appears here
                  </p>
                )}
              </div>

              <textarea
                className="min-h-44 rounded-[28px] border border-slate-200 px-4 py-3 text-sm"
                placeholder="Optional image data URL or external image URL"
                value={form.imageUrl}
                onChange={(event) =>
                  setForm((current) => ({ ...current, imageUrl: event.target.value }))
                }
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              className="rounded-2xl bg-sky-950 px-5 py-3 font-semibold text-white disabled:opacity-60"
              onClick={submitProduct}
              disabled={saving}
            >
              {saving ? 'Saving item...' : editingProductId ? 'Update food item' : 'Add food item'}
            </button>
            {editingProductId ? (
              <button
                className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-700"
                onClick={resetForm}
                disabled={saving}
              >
                Cancel edit
              </button>
            ) : null}
            {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-sky-950">Menu catalog</h2>
              <p className="mt-2 text-sm text-slate-500">
                Existing menu items now grouped by a single cuisine field.
              </p>
            </div>
            <div className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
              {products.length} items
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="overflow-hidden rounded-[28px] border border-slate-100 bg-slate-50"
              >
                <div className="h-40 bg-slate-100">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{product.category}</p>
                    </div>
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
                      {currency(product.price)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    Tax {Number(product.tax || 0).toFixed(2)}% • Prep {product.prep_time_minutes}{' '}
                    min
                  </p>
                  <button
                    className="mt-4 rounded-full bg-sky-950 px-4 py-2 text-sm font-semibold text-white"
                    onClick={() => startEditing(product)}
                  >
                    Edit item
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;