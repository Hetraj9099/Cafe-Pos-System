import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import StatusBadge from '../components/StatusBadge';
import TableCard from '../components/TableCard';
import useAppContext from '../hooks/useAppContext';

const statusColors = {
  Available: 'bg-slate-400',
  Occupied: 'bg-rose-500',
  Cooking: 'bg-amber-400',
  Ready: 'bg-emerald-500',
  Paid: 'bg-sky-500',
  Reserved: 'bg-violet-500'
};

const FloorView = () => {
  const navigate = useNavigate();
  const {
    tables,
    selectedTableId,
    setSelectedTableId,
    createTable,
    updateTable,
    recentlyPaidTableIds
  } = useAppContext();
  const [tableNumber, setTableNumber] = useState('');
  const [seats, setSeats] = useState('4');
  const [error, setError] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [selectedArea, setSelectedArea] = useState('main');

  const decoratedTables = useMemo(() => {
    return tables.map((table) => ({
      ...table,
      status: recentlyPaidTableIds.includes(table.id)
        ? 'Paid'
        : table.manual_status || table.status || table.derived_status || 'Available'
    }));
  }, [recentlyPaidTableIds, tables]);

  const totals = useMemo(() => {
    return decoratedTables.reduce((summary, table) => {
      summary[table.status] = (summary[table.status] || 0) + 1;
      return summary;
    }, {});
  }, [decoratedTables]);

  const areaTables = useMemo(() => {
    if (selectedArea === 'patio') {
      return decoratedTables.filter((table) => Number(table.table_number) > 6);
    }

    return decoratedTables.filter((table) => Number(table.table_number) <= 6);
  }, [decoratedTables, selectedArea]);

  const submit = async () => {
    try {
      setError('');

      if (!tableNumber || Number(tableNumber) <= 0) {
        throw new Error('Table number must be greater than 0.');
      }

      if (!seats || Number(seats) <= 0) {
        throw new Error('Seats must be greater than 0.');
      }

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

  const applyStatus = async (tableId, manualStatus) => {
    try {
      setStatusSaving(true);
      await updateTable(tableId, { manualStatus });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1.55fr,0.72fr]">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Floor plan"
          title="Dining floor"
          subtitle="Track table activity with an Odoo-style overview and jump into service with one tap."
        >
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            onClick={() => navigate('/orders')}
          >
            Open order
          </button>
        </HeaderBar>

        <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {Object.entries(totals).map(([status, count]) => (
            <div key={status} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-2">
                <StatusBadge status={status} />
                <span className="text-sm font-medium text-slate-500">Tables</span>
              </div>
              <div className="mt-3 text-2xl font-medium text-slate-950">{count}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          {[
            { key: 'main', label: 'Main floor' },
            { key: 'patio', label: 'Patio' }
          ].map((area) => (
            <button
              key={area.key}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedArea === area.key
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100'
              }`}
              onClick={() => setSelectedArea(area.key)}
            >
              {area.label}
            </button>
          ))}

          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-600">
              <span className={`h-3 w-3 rounded-full ${color}`} />
              <span>{status}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {areaTables.length > 0 ? (
            areaTables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                selected={selectedTableId === table.id}
                statusSaving={statusSaving && selectedTableId === table.id}
                onStatusChange={async (manualStatus) => {
                  setSelectedTableId(table.id);
                  await applyStatus(table.id, manualStatus);
                }}
                onClick={() => {
                  setSelectedTableId(table.id);
                  navigate('/orders');
                }}
              />
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              No tables are assigned to this zone yet.
            </div>
          )}
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
        <HeaderBar
          eyebrow="Table setup"
          title="Create table"
          subtitle="Add a new QR-enabled table without leaving the floor view."
        />
        <div className="mt-4 grid gap-3">
          <input
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            placeholder="Table number"
            value={tableNumber}
            onChange={(event) => setTableNumber(event.target.value)}
          />
          <input
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            placeholder="Seats"
            value={seats}
            onChange={(event) => setSeats(event.target.value)}
          />
          <button
            className="rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
            onClick={submit}
          >
            Create table
          </button>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-900">Cashier flow</p>
          <p className="mt-2 text-sm text-slate-500">
            Walk-in tables move from Available to Occupied, then Cooking, Ready, Paid, and back to
            Available. Reserved tables stay purple until service begins.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default FloorView;
