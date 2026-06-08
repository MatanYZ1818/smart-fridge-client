import { useOutletContext } from 'react-router-dom';
import ObjectDetailPage from './ObjectDetailPage';

export default function ObjectDetailRoute() {
  const ctx = useOutletContext();
  return <ObjectDetailPage canOperator={ctx?.canOperator} />;
}

