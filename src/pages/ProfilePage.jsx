import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="fridge-form" style={{ maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>הפרופיל שלי</h2>
      <p style={{ color: 'var(--fridge-muted)' }}>
        אימייל: <b>{user?.userId?.email}</b>
        <br />
        תפקיד: <b>{user?.role}</b>
      </p>

      {error ? <div className="fridge-alert error">{error}</div> : null}
      {message ? <div className="fridge-alert success">{message}</div> : null}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setMessage(null);
          if (!password.trim()) {
            setError('יש להזין סיסמה נוכחית');
            return;
          }
          try {
            await updateProfile({
              email: user.userId.email,
              existingPassword: password,
              update: {
                username: username.trim(),
                avatar: user.avatar,
                role: user.role,
                password: newPassword.trim() || undefined,
              },
            });
            setMessage('הפרופיל עודכן בהצלחה');
            setPassword('');
            setNewPassword('');
          } catch (err) {
            setError(err?.data?.message || err.message || 'עדכון נכשל');
          }
        }}
      >
        <div className="fridge-field">
          <label htmlFor="username">שם תצוגה</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="fridge-field">
          <label htmlFor="password">סיסמה נוכחית</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="fridge-field">
          <label htmlFor="new-password">סיסמה חדשה (אופציונלי)</label>
          <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button type="submit" className="fridge-btn fridge-btn-primary">
          שמור שינויים
        </button>
      </form>

      <button
        type="button"
        className="fridge-btn"
        style={{ marginTop: 16 }}
        onClick={logout}
      >
        התנתק
      </button>
    </div>
  );
}
