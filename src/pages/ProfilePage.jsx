import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ui } from '../strings/he';

export default function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  return (
    <div className="fridge-form" style={{ maxWidth: 520 }}>
      <h2 style={{ marginTop: 0 }}>{ui.profile.title}</h2>
      <p style={{ color: 'var(--fridge-muted)' }}>
        {ui.profile.email}: <b>{user?.userId?.email}</b>
        <br />
        {ui.profile.role}: <b>{user?.role}</b>
      </p>

      {error ? <div className="fridge-alert error">{error}</div> : null}
      {message ? <div className="fridge-alert success">{message}</div> : null}

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setMessage(null);
          if (!password.trim()) {
            setError(ui.profile.passwordRequired);
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
            setMessage(ui.profile.updateSuccess);
            setPassword('');
            setNewPassword('');
          } catch (err) {
            setError(err?.data?.message || err.message || ui.profile.updateFailed);
          }
        }}
      >
        <div className="fridge-field">
          <label htmlFor="username">{ui.profile.displayNameLabel}</label>
          <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="fridge-field">
          <label htmlFor="password">{ui.profile.currentPasswordLabel}</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="fridge-field">
          <label htmlFor="new-password">{ui.profile.newPasswordLabel}</label>
          <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        </div>
        <button type="submit" className="fridge-btn fridge-btn-primary">
          {ui.profile.save}
        </button>
      </form>

      <button
        type="button"
        className="fridge-btn"
        style={{ marginTop: 16 }}
        onClick={logout}
      >
        {ui.profile.disconnect}
      </button>
    </div>
  );
}
