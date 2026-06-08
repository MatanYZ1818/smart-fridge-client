import { useOutletContext } from 'react-router-dom';
import ObjectsPage from './ObjectsPage';

export default function ObjectsRoute() {
  const ctx = useOutletContext();
  return <ObjectsPage canOperator={ctx?.canOperator} />;
}

