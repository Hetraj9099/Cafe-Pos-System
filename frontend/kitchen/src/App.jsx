import { Link, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import KitchenBoard from './pages/KitchenBoard';

const navigation = [{ to: '/', label: 'Board' }];

function App() {
  return (
    <AppShell
      title="Kitchen Display"
      subtitle="Scaffold for kitchen ticket visibility, prep flow, and line coordination."
      navigation={navigation}
      renderNavItem={(item) => (
        <Link
          key={item.to}
          to={item.to}
          className="rounded-full bg-rose-700 px-4 py-2 text-sm font-medium text-white"
        >
          {item.label}
        </Link>
      )}
    >
      <Routes>
        <Route path="/" element={<KitchenBoard />} />
      </Routes>
    </AppShell>
  );
}

export default App;
