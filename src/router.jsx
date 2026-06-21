import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AuthGate from './components/AuthGate';
import FridgeLayout from './components/FridgeLayout';
import LoginPage from './pages/LoginPage';
import FridgeHomeRoute from './pages/FridgeHomeRoute';
import DevicePage from './pages/DevicePage';
import ProductPage from './pages/ProductPage';
import ProfilePage from './pages/ProfilePage';

function RequireAuth({ children }) {
  return <AuthGate>{children}</AuthGate>;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            element={
              <RequireAuth>
                <FridgeLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<Navigate to="/devices" replace />} />
            <Route path="/devices" element={<FridgeHomeRoute />} />
            <Route path="/devices/:deviceId" element={<DevicePage />} />
            <Route path="/fridge" element={<Navigate to="/devices" replace />} />
            <Route path="/fridge/products/:productId" element={<ProductPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/devices" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
