import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import useAppContext from './hooks/useAppContext';
import FloorView from './pages/FloorView';
import OrderScreen from './pages/OrderScreen';
import PaymentScreen from './pages/PaymentScreen';

const LoginGate = () => {
  const { login, loading } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = async () => {
    try {
      setError('');
      await login(email, password);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fffef8_0%,#eef2ff_100%)] px-4 py-8">
      <div className="mx-auto max-w-md rounded-[32px] bg-white p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-600">
          Cashier Login
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">Start your session</h1>
        <div className="mt-6 grid gap-3">
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            className="rounded-2xl bg-slate-950 px-4 py-3 font-semibold text-white"
            onClick={submit}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        </div>
      </div>
    </div>
  );
};

function App() {
  const { token } = useAppContext();

  if (!token) {
    return <LoginGate />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/pos" replace />} />
        <Route path="/pos" element={<FloorView />} />
        <Route path="/orders" element={<OrderScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
      </Routes>
    </AppShell>
  );
}

export default App;
