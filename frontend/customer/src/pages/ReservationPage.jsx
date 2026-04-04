import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from '../components/HeaderBar';
import useAppContext from '../hooks/useAppContext';
import { customerApi } from '../services/api';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ReservationPage = () => {
  const navigate = useNavigate();
  const { customer, updateCustomer, setCheckoutMode } = useAppContext();
  const [reservationTime, setReservationTime] = useState('');
  const [availability, setAvailability] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const emailError =
    customer.email && !emailPattern.test(customer.email) ? 'Enter a valid email address.' : '';

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

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr,360px]">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <HeaderBar
            eyebrow="Reservation"
            title="Reserve your table"
            subtitle="Pick your time, view live table availability, and confirm the booking in a few quick steps."
          />

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="Name"
              value={customer.name}
              onChange={(event) => updateCustomer({ name: event.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="Phone"
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
              placeholder="Email"
              type="email"
              value={customer.email}
              onChange={(event) => updateCustomer({ email: event.target.value })}
            />
            <input
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              type="datetime-local"
              value={reservationTime}
              onChange={(event) => setReservationTime(event.target.value)}
            />
          </div>

          <button
            className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700"
            onClick={fetchAvailability}
          >
            {loading ? 'Checking tables...' : 'View table availability'}
          </button>
          {emailError ? <p className="mt-3 text-sm text-rose-600">{emailError}</p> : null}
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <HeaderBar
            eyebrow="Summary"
            title="Confirm details"
            subtitle="Your reservation summary updates as soon as you pick a time and a table."
          />

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">Guest:</span> {customer.name || 'Add your name'}
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-900">Phone:</span> {customer.phone || 'Add phone number'}
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-900">Email:</span> {customer.email || 'Optional'}
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-900">Reservation time:</span>{' '}
              {reservationTime ? new Date(reservationTime).toLocaleString() : 'Choose date and time'}
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-900">Selected table:</span>{' '}
              {selectedTableId
                ? availability.find((table) => table.id === selectedTableId)?.table_number || 'Selected'
                : 'Choose a table'}
            </p>
          </div>

          <button
            className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            onClick={() => {
              if (emailError) {
                setError(emailError);
                return;
              }

              if (!reservationTime || !selectedTableId) {
                setError('Choose a reservation time and select a table first.');
                return;
              }

              setCheckoutMode('reservation');
              navigate('/checkout', {
                state: {
                  reservationTime,
                  selectedTableId
                }
              });
            }}
          >
            Continue reservation
          </button>
        </aside>
      </div>

      {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div> : null}

      {availability.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-md">
          <HeaderBar
            eyebrow="Availability"
            title="Choose a table"
            subtitle="Available tables stay bright and selectable. Reserved or blocked tables are dimmed."
          />
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {availability.map((table) => (
              <button
                key={table.id}
                className={`rounded-xl border px-4 py-5 text-left transition ${
                  selectedTableId === table.id
                    ? 'border-violet-600 bg-violet-600 text-white shadow-sm'
                    : table.is_available
                      ? 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                      : 'border-slate-200 bg-slate-100 text-slate-400'
                }`}
                disabled={!table.is_available}
                onClick={() => setSelectedTableId(table.id)}
              >
                <div className="text-sm font-medium">Table {table.table_number}</div>
                <div className="mt-1 text-xs">Seats {table.seats}</div>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default ReservationPage;