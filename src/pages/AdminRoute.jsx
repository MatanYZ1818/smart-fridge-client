import { useOutletContext } from 'react-router-dom';
import AdminPage from './AdminPage';

export default function AdminRoute() {
  const ctx = useOutletContext();
  return <AdminPage canAdmin={ctx?.canAdmin} />;
}

