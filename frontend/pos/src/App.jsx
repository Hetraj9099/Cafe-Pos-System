import { Link, Route, Routes } from 'react-router-dom';
import FloorView from './pages/FloorView';
import OrderScreen from './pages/OrderScreen';
import PaymentScreen from './pages/PaymentScreen';
import AppShell from './components/AppShell';

const navigation = [
  { to: '/', label: 'Floor' },
  { to: '/orders', label: 'Orders' },
  { to: '/payment', label: 'Payment' }
];

function App() {
  return (
    <AppShell
      title="Cashier POS"
      subtitle="Scaffold for floor operations, order entry, and payment handoff."
      navigation={navigation}
      renderNavItem={(item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          {item.label}
        </Link>
      )}
    >
      <Routes>
        <Route path="/" element={<FloorView />} />
        <Route path="/orders" element={<OrderScreen />} />
        <Route path="/payment" element={<PaymentScreen />} />
      </Routes>
    </AppShell>
  );
}

export default App;
