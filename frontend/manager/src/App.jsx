import { Link, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import StaffView from './pages/StaffView';

const navigation = [
  { to: '/', label: 'Dashboard' },
  { to: '/staff', label: 'Staff' }
];

function App() {
  return (
    <AppShell
      title="Manager Dashboard"
      subtitle="Scaffold for analytics, operational summaries, and staff oversight."
      navigation={navigation}
      renderNavItem={(item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rounded-full bg-sky-900 px-4 py-2 text-sm font-medium text-white"
        >
          {item.label}
        </Link>
      )}
    >
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/staff" element={<StaffView />} />
      </Routes>
    </AppShell>
  );
}

export default App;
