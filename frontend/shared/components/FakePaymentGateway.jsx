import { useEffect, useMemo, useState } from 'react';
import qrDataUrl from '../assets/upi-qr.png';

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');

const FakePaymentGateway = ({ open, method, amount, processing, onClose, onConfirm }) => {
  const [cardHolder, setCardHolder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cvv, setCvv] = useState('');
  const [error, setError] = useState('');

  const title = useMemo(() => {
    if (method === 'card') {
      return 'Card payment gateway';
    }

    if (method === 'upi') {
      return 'UPI payment gateway';
    }

    return 'Payment gateway';
  }, [method]);

  useEffect(() => {
    if (!open) {
      setCardHolder('');
      setCardNumber('');
      setCvv('');
      setError('');
    }
  }, [open, method]);

  if (!open) {
    return null;
  }

  const confirmCard = () => {
    if (processing) {
      return;
    }

    if (cardHolder.trim().length < 2) {
      setError('Enter the card holder name.');
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Enter a 16 digit card number.');
      return;
    }

    if (!/^\d{3}$/.test(cvv)) {
      setError('Enter a 3 digit CVV.');
      return;
    }

    setError('');
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Demo gateway</p>
            <h3 className="mt-1 text-lg font-medium text-slate-950">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">Amount to collect: Rs. {Number(amount || 0).toFixed(2)}</p>
          </div>
          <button
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
            onClick={onClose}
            disabled={processing}
          >
            Close
          </button>
        </div>

        {method === 'card' ? (
          <div className="mt-4 space-y-3">
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="Card holder name"
              value={cardHolder}
              onChange={(event) => setCardHolder(event.target.value)}
            />
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="Card number"
              inputMode="numeric"
              value={cardNumber}
              onChange={(event) => setCardNumber(formatCardNumber(event.target.value))}
            />
            <input
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              placeholder="3 digit CVV"
              inputMode="numeric"
              value={cvv}
              maxLength={3}
              onChange={(event) => setCvv(event.target.value.replace(/\D/g, '').slice(0, 3))}
            />
            <button
              className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
              onClick={confirmCard}
              disabled={processing}
            >
              {processing ? 'Processing payment...' : 'Pay now'}
            </button>
          </div>
        ) : (
          <div className="mt-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
              <img
                src={qrDataUrl}
                alt="Sample UPI QR code"
                className="mx-auto h-56 w-56 rounded-xl border border-slate-200 bg-white p-3"
              />
              <p className="mt-3 text-sm font-medium text-slate-900">Scan this sample QR in your UPI app</p>
              <p className="mt-1 text-xs text-slate-500">This is a demo payment prompt for the hackathon flow.</p>
            </div>
            <button
              className="mt-4 w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-60"
              onClick={() => {
                if (!processing) {
                  setError('');
                  onConfirm();
                }
              }}
              disabled={processing}
            >
              {processing ? 'Marking payment...' : 'Done'}
            </button>
          </div>
        )}

        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
      </div>
    </div>
  );
};

export default FakePaymentGateway;
