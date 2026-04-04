import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import KitchenBoard from './pages/KitchenBoard';

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/kitchen" replace />} />
        <Route path="/kitchen" element={<KitchenBoard />} />
      </Routes>
    </AppShell>
  );
}

export default App;
