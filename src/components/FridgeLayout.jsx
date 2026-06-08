import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
            <h1>הבית החכם</h1>
            <p>שלום, {user?.username || 'משתמש'}</p>
          </div>
        </NavLink>

        <nav className="fridge-nav">
          <NavLink
            to="/devices"
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            end
          >
            המכשירים שלי
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            הפרופיל שלי
          </NavLink>
          <button
            type="button"
            className="fridge-btn"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            יציאה
          </button>
        </nav>
      </header>

      <main className="fridge-main">
        <Outlet context={{ canManage, canOperator: canManage }} />
      </main>
    </div>
  );
}
