import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import QrOrderPage from './pages/QrOrderPage';
import ReservationPage from './pages/ReservationPage';
import SuccessPage from './pages/SuccessPage';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/reserve" replace />} />
        <Route path="/order/:token" element={<QrOrderPage />} />
        <Route path="/menu/:token" element={<QrOrderPage />} />
        <Route path="/legacy-order/:token" element={<OrderPage />} />
        <Route path="/reserve" element={<ReservationPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/success" element={<SuccessPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
