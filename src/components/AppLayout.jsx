import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function roleRank(role) {
  if (!role) return 0;
  const r = role.toUpperCase();
  if (r === 'ADMIN') return 3;
  if (r === 'OPERATOR') return 2;
  if (r === 'END_USER') return 1;
  return 0;
}

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role;
  const canAdmin = roleRank(role) >= 3;
  const canOperator = roleRank(role) >= 2;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ fontWeight: 700, textDecoration: 'none' }}>
            Ambient Invisible Intelligence
          </Link>
          <span style={{ color: '#6b7280', fontSize: 13 }}>
            System: {user?.userId?.systemID || '—'}
          </span>
        </div>

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#111827', fontSize: 13 }}>
              {user.username} ({user.role})
            </span>
            <button
              type="button"
              onClick={() => {
                logout();
                navigate('/login');
              }}
              style={{
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: 10,
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </header>

      {user ? (
        <nav
          style={{
            padding: '12px 18px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex',
            gap: 14,
            alignItems: 'center',
          }}
        >
          <NavLink
            to="/objects"
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#111827' : '#374151',
            })}
          >
            Objects
          </NavLink>
          <NavLink
            to="/commands"
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#111827' : '#374151',
            })}
          >
            Commands
          </NavLink>
          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              textDecoration: 'none',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#111827' : '#374151',
            })}
          >
            Profile
          </NavLink>
          {canAdmin ? (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#111827' : '#374151',
              })}
            >
              Admin
            </NavLink>
          ) : null}
        </nav>
      ) : null}

      <main style={{ flex: 1, padding: 18 }}>
        <Outlet context={{ canAdmin, canOperator }} />
      </main>

      <footer
        style={{
          padding: '14px 18px',
          borderTop: '1px solid #f3f4f6',
          color: '#6b7280',
          fontSize: 13,
        }}
      >
        Client app for Ambient Invisible Intelligence (AI-I)
      </footer>
    </div>
  );
}

