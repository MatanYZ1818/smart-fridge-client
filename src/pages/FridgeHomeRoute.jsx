import { useOutletContext } from 'react-router-dom';
import FridgeHomePage from './FridgeHomePage';

export default function FridgeHomeRoute() {
  const ctx = useOutletContext();
  return <FridgeHomePage canManage={ctx?.canManage} />;
}
