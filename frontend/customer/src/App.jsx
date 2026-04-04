import { Link, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import ReservationPage from './pages/ReservationPage';
import SuccessPage from './pages/SuccessPage';

const navigation = [
  { to: '/', label: 'Order' },
  { to: '/reservations', label: 'Reservation' },
  { to: '/checkout', label: 'Checkout' },
  { to: '/success', label: 'Success' }
];

function App() {
  return (
    <AppShell
      title="Customer Experience"
      subtitle="Scaffold for QR ordering, reservation requests, and guest checkout."
      navigation={navigation}
      renderNavItem={(item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rounded-full border border-emerald-700 px-4 py-2 text-sm font-medium text-emerald-900"
        >
          {item.label}
        </Link>
      )}
    >
      <Routes>
        <Route path="/" element={<OrderPage />} />
        <Route path="/reservations" element={<ReservationPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
