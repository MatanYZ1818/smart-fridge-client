import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ui } from '../strings/he';

function roleRank(role) {
  if (!role) return 0;
  const r = role.toUpperCase();
  if (r === 'ADMIN') return 3;
  if (r === 'OPERATOR') return 2;
  return 1;
}

export default function FridgeLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const canManage = roleRank(user?.role) >= 2;

  return (
    <div className="fridge-app" dir="rtl">
      <header className="fridge-header">
        <NavLink to="/devices" className="fridge-brand">
          <div className="fridge-logo" aria-hidden>⚙️</div>
          <div>
            <h1>{ui.appTitle}</h1>
            <p>{ui.nav.greeting(user?.username || ui.defaultGuestName)}</p>
          </div>
        </NavLink>

        <nav className="fridge-nav">
          <NavLink
            to="/devices"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            end
          >
            {ui.nav.myDevices}
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            {ui.nav.myProfile}
          </NavLink>
          <button
            type="button"
            className="fridge-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            {ui.nav.logout}
          </button>
        </nav>
      </header>

      <main className="fridge-main">
        <Outlet context={{ canManage, canOperator: canManage }} />
      </main>
    </div>
  );
}
