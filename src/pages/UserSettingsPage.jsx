import { useEffect, useState } from 'react';
import InlineAlert from '../components/InlineAlert';
import { useAuth } from '../context/AuthContext';

const ROLE_OPTIONS = ['ADMIN', 'OPERATOR', 'END_USER'];

export default function UserSettingsPage() {
  const { user, updateProfile } = useAuth();

  const [username, setUsername] = useState('');
  const [avatar, setAvatar] = useState('');
  const [role, setRole] = useState('END_USER');

  const [existingPassword, setExistingPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (!user) return;
    const id = setTimeout(() => {
      setUsername(user.username || '');
      setAvatar(user.avatar || '');
      setRole(user.role || 'END_USER');
    }, 0);
    return () => clearTimeout(id);
  }, [user]);

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <h2 style={{ margin: '6px 0 4px' }}>Profile</h2>
      <p style={{ marginTop: 0, color: '#6b7280' }}>Update user details and optionally rotate password.</p>

      {error ? <InlineAlert type="error" title="Update failed" message={error} /> : null}
      {success ? <InlineAlert type="success" title="Updated" message={success} /> : null}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff', marginTop: 14 }}>
        <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 10 }}>
          Email (immutable): <b style={{ color: '#111827' }}>{user?.userId?.email}</b>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            setSuccess(null);

            try {
              if (!existingPassword.trim()) {
                setError('Existing password is required.');
                return;
              }

              await updateProfile({
                email: user.userId.email,
                existingPassword,
                update: {
                  role,
                  username,
                  avatar,
                  password: newPassword.trim() ? newPassword : undefined,
                },
              });

              setSuccess('Profile updated successfully. Please login again if needed.');
              setExistingPassword('');
              setNewPassword('');
            } catch (err) {
              setError(err?.data?.message || err.message || 'Update failed');
            }
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Username</div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Avatar</div>
              <input
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                placeholder="avatar.png"
              />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Role</div>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
            >
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 12, marginTop: 12 }}>
            <div style={{ fontWeight: 950, marginBottom: 8 }}>Password update (optional)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Existing password</div>
                <input
                  type="password"
                  value={existingPassword}
                  onChange={(e) => setExistingPassword(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 6 }}>New password (leave empty to keep)</div>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: 'none',
              background: '#111827',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 950,
              marginTop: 6,
            }}
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

