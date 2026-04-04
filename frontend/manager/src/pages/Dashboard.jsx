import useAppContext from '../hooks/useAppContext';

const currency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const Dashboard = () => {
  const { overview } = useAppContext();

  if (!overview) {
    return <div className="rounded-[32px] bg-white p-6 text-sm text-slate-600">Loading dashboard...</div>;
  }

  const cards = [
    { label: 'Revenue Today', value: currency(overview.sales.total_revenue) },
    { label: 'Paid Orders', value: overview.sales.paid_orders || 0 },
    { label: 'Total Orders', value: overview.sales.total_orders || 0 },
    { label: 'Customers', value: overview.customerStats.total_customers || 0 }
  ];

  const maxRevenue = Math.max(
    1,
    ...overview.trends.map((entry) => Number(entry.revenue || 0))
  );

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
        <div className="rounded-[32px] bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-sky-950">Revenue trend</h2>
          <div className="mt-6 flex items-end gap-3">
            {overview.trends.map((entry) => (
              <div key={entry.day} className="flex-1">
                <div className="flex h-56 items-end rounded-3xl bg-sky-50 p-3">
                  <div
                    className="w-full rounded-2xl bg-sky-800"
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
            <h2 className="text-2xl font-semibold text-sky-950">Top products</h2>
            <div className="mt-5 space-y-3">
              {overview.productAnalytics.map((product) => (
                <div key={product.id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{product.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Revenue {currency(product.revenue)} • Sold {product.items_sold}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;