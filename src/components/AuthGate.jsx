import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthGate({ children }) {
  const { user, bootstrapped } = useAuth();
  const location = useLocation();

  if (!bootstrapped) return null;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

