import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAppContext from '../hooks/useAppContext';

const statusStyles = {
  Available: 'bg-slate-200 text-slate-800',
  Occupied: 'bg-rose-500 text-white',
  Cooking: 'bg-amber-400 text-slate-950',
  Ready: 'bg-emerald-500 text-white',
  Paid: 'bg-sky-500 text-white',
  Reserved: 'bg-violet-500 text-white'
};

const FloorView = () => {
  const navigate = useNavigate();
  const { tables, selectedTableId, setSelectedTableId, createTable } = useAppContext();
  const [tableNumber, setTableNumber] = useState('');
  const [seats, setSeats] = useState('4');
  const [error, setError] = useState('');

  const totals = useMemo(() => {
    return tables.reduce((summary, table) => {
      summary[table.status] = (summary[table.status] || 0) + 1;
      return summary;
    }, {});
  }, [tables]);

  const submit = async () => {
    try {
      setError('');
      await createTable({
        tableNumber: Number(tableNumber),
        seats: Number(seats)
      });
      setTableNumber('');
      setSeats('4');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.5fr,0.8fr]">
      <section className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-950">Floor status</h2>
            <p className="mt-1 text-sm text-slate-600">
              Click a table to manage the ticket and payment flow.
            </p>
          </div>
          <button
            className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => navigate('/orders')}
          >
            Open order screen
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Object.entries(totals).map(([status, count]) => (
            <div key={status} className="rounded-2xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">{status}</div>
              <div className="mt-2 text-2xl font-semibold text-slate-950">{count}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => (
            <button
              key={table.id}
              className={`rounded-[28px] border p-5 text-left transition ${
                selectedTableId === table.id
                  ? 'border-slate-950 shadow-lg'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => {
                setSelectedTableId(table.id);
                navigate('/orders');
              }}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-950">
                  Table {table.table_number}
                </h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[table.status]}`}
                >
                  {table.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">Seats {table.seats}</p>
              {table.latest_order ? (
                <p className="mt-2 text-sm text-slate-700">
                  Latest total Rs. {Number(table.latest_order.total_amount).toFixed(2)}
                </p>
              ) : null}
            </button>
          ))}
        </div>
      </section>

      <aside className="rounded-[32px] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-950">Add table</h2>
        <p className="mt-1 text-sm text-slate-600">Create a new QR-enabled dining table.</p>
        <div className="mt-5 grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Table number"
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Seats"
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
          />
          <button
            className="rounded-2xl bg-amber-400 px-4 py-3 font-semibold text-slate-950"
            onClick={submit}
          >
            Create table
          </button>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
      </aside>
    </div>
  );
};

export default FloorView;
