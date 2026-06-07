import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import Dashboard from '@/pages/Dashboard';
import Prescription from '@/pages/Prescription';
import Member from '@/pages/Member';
import Inventory from '@/pages/Inventory';
import Chronic from '@/pages/Chronic';
import Promotion from '@/pages/Promotion';
import Compliance from '@/pages/Compliance';

export default function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prescription" element={<Prescription />} />
          <Route path="/member" element={<Member />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/chronic" element={<Chronic />} />
          <Route path="/promotion" element={<Promotion />} />
          <Route path="/compliance" element={<Compliance />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
