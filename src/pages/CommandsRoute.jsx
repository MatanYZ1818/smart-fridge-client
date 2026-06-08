import { useOutletContext } from 'react-router-dom';
import CommandsPage from './CommandsPage';

export default function CommandsRoute() {
  const ctx = useOutletContext();
  return <CommandsPage canAdmin={ctx?.canAdmin} />;
}

