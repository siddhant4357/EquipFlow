import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SyncProvider } from './context/SyncContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import DashboardOverview from './pages/dashboard/DashboardOverview';
import MapOverview from './pages/dashboard/MapOverview';
import AssetList from './pages/dashboard/AssetList';
import PeopleList from './pages/dashboard/PeopleList';
import OperatorDashboard from './pages/dashboard/OperatorDashboard';

function App() {
  return (
    <AuthProvider>
      <SyncProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* Admin / Manager Routes (Layout) */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'manager']}>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<DashboardOverview />} />
              <Route path="map" element={<MapOverview />} />
              <Route path="assets" element={<AssetList />} />
              <Route path="people" element={<ProtectedRoute allowedRoles={['admin']}><PeopleList /></ProtectedRoute>} />
            </Route>

            {/* Operator Routes (No Sidebar) */}
            <Route path="/operator" element={
              <ProtectedRoute allowedRoles={['operator']}>
                <OperatorDashboard />
              </ProtectedRoute>
            } />

            {/* Default Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SyncProvider>
    </AuthProvider>
  );
}

export default App;