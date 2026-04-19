import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import SuperAdminRoute from './components/SuperAdminRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Logs from './pages/Logs';
import Profil from './pages/Profil';
import Parametres from './pages/Parametres';
import Admins from './pages/Admins';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Page publique */}
        <Route path="/login" element={<Login />} />

        {/* Pages privées : enveloppées dans Layout (sidebar + navbar) */}
        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/logs" element={<Logs />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/parametres" element={<Parametres />} />

          {/* Page Super Admin uniquement */}
          <Route
            path="/admins"
            element={
              <SuperAdminRoute>
                <Admins />
              </SuperAdminRoute>
            }
          />
        </Route>
      </Routes>
    </AuthProvider>
  );
}