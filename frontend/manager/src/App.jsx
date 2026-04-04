import { useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import useAppContext from './hooks/useAppContext';
import Dashboard from './pages/Dashboard';
import StaffView from './pages/StaffView';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LoginGate = () => {
  const { login, signup, requestPasswordReset, resetPassword, loading } = useAppContext();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const title = useMemo(() => {
    if (mode === 'signup') {
      return 'Create manager access';
    }

    if (mode === 'forgot') {
      return 'Recover access with OTP';
    }

    return 'Access operations';
  }, [mode]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    try {
      setError('');
      setMessage('');
      setDevOtp('');

      if (!emailPattern.test(form.email.trim().toLowerCase())) {
        throw new Error('Enter a valid email address.');
      }

      if (mode === 'login') {
        if (form.password.trim().length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }

        await login(form.email.trim().toLowerCase(), form.password);
        return;
      }

      if (mode === 'signup') {
        if (form.name.trim().length < 2) {
          throw new Error('Name must be at least 2 characters.');
        }

        if (form.password.trim().length < 8) {
          throw new Error('Password must be at least 8 characters.');
        }

        if (form.password !== form.confirmPassword) {
          throw new Error('Passwords do not match.');
        }

        await signup({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          role: 'admin'
        });
        return;
      }

      if (!form.otp) {
        const response = await requestPasswordReset(form.email.trim().toLowerCase());
        setMessage(response.message || response.data?.message || 'OTP sent.');
        setDevOtp(response.data?.devOtp || '');
        return;
      }

      if (form.otp.trim().length !== 6) {
        throw new Error('OTP must be 6 digits.');
      }

      if (form.newPassword.trim().length < 8) {
        throw new Error('New password must be at least 8 characters.');
      }

      if (form.newPassword !== form.confirmNewPassword) {
        throw new Error('New passwords do not match.');
      }

      const response = await resetPassword({
        email: form.email.trim().toLowerCase(),
        otp: form.otp.trim(),
        password: form.newPassword
      });

      setMessage(response.message || response.data?.message || 'Password updated.');
      setForm((current) => ({
        ...current,
        otp: '',
        newPassword: '',
        confirmNewPassword: '',
        password: ''
      }));
      setMode('login');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f6fbff_0%,#ebf4ff_100%)] px-4 py-8">
      <div className="mx-auto max-w-md rounded-[32px] bg-white p-6 shadow-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-sky-700">
          Manager Access
        </p>
        <h1 className="mt-3 text-3xl font-bold text-sky-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sign in, create a manager account, or reset a password with OTP.
        </p>
        <div className="mt-5 grid grid-cols-3 rounded-2xl bg-sky-50 p-1 text-sm font-medium text-sky-900">
          <button
            className={`rounded-xl px-3 py-2 ${mode === 'login' ? 'bg-white text-sky-950 shadow-sm' : ''}`}
            onClick={() => {
              setMode('login');
              setError('');
              setMessage('');
            }}
          >
            Login
          </button>
          <button
            className={`rounded-xl px-3 py-2 ${mode === 'signup' ? 'bg-white text-sky-950 shadow-sm' : ''}`}
            onClick={() => {
              setMode('signup');
              setError('');
              setMessage('');
            }}
          >
            Sign up
          </button>
          <button
            className={`rounded-xl px-3 py-2 ${mode === 'forgot' ? 'bg-white text-sky-950 shadow-sm' : ''}`}
            onClick={() => {
              setMode('forgot');
              setError('');
              setMessage('');
            }}
          >
            Forgot
          </button>
        </div>
        <div className="mt-6 grid gap-3">
          {mode === 'signup' ? (
            <input
              className="rounded-2xl border border-slate-200 px-4 py-3"
              placeholder="Full name"
              value={form.name}
              onChange={(event) => updateForm('name', event.target.value)}
            />
          ) : null}
          <input
            className="rounded-2xl border border-slate-200 px-4 py-3"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => updateForm('email', event.target.value)}
          />
          {mode === 'forgot' ? (
            <>
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="6-digit OTP"
                value={form.otp}
                onChange={(event) => updateForm('otp', event.target.value.replace(/\D/g, '').slice(0, 6))}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="New password"
                type="password"
                value={form.newPassword}
                onChange={(event) => updateForm('newPassword', event.target.value)}
              />
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Confirm new password"
                type="password"
                value={form.confirmNewPassword}
                onChange={(event) => updateForm('confirmNewPassword', event.target.value)}
              />
            </>
          ) : (
            <>
              <input
                className="rounded-2xl border border-slate-200 px-4 py-3"
                placeholder="Password"
                type="password"
                value={form.password}
                onChange={(event) => updateForm('password', event.target.value)}
              />
              {mode === 'signup' ? (
                <input
                  className="rounded-2xl border border-slate-200 px-4 py-3"
                  placeholder="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateForm('confirmPassword', event.target.value)}
                />
              ) : null}
            </>
          )}
          <button
            className="rounded-2xl bg-sky-950 px-4 py-3 font-semibold text-white"
            onClick={submit}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
                ? 'Login'
                : mode === 'signup'
                  ? 'Create account'
                  : form.otp
                    ? 'Reset password'
                    : 'Send OTP'}
          </button>
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
          {devOtp ? <p className="text-sm text-amber-700">Local OTP preview: {devOtp}</p> : null}
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
        <Route path="/" element={<Navigate to="/manager" replace />} />
        <Route path="/manager" element={<Dashboard />} />
        <Route path="/staff" element={<StaffView />} />
      </Routes>
    </AppShell>
  );
}

export default App;
