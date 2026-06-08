import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState('login');
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const disabled = useMemo(() => !email.trim() || !password.trim(), [email, password]);

  return (
    <div className="fridge-login-wrap" dir="rtl">
      <div className="fridge-login-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div className="fridge-logo" aria-hidden>🧊</div>
          <div>
            <h1>הבית החכם</h1>
            <p className="subtitle">צפו במכשירים, הפעילו פקודות ונהלו תכולה</p>
          </div>
        </div>

        {error ? <div className="fridge-alert error">{error}</div> : null}

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className={`fridge-btn ${mode === 'login' ? 'fridge-btn-primary' : ''}`}
            onClick={() => { setMode('login'); setError(null); }}
          >
            התחברות
          </button>
          <button
            type="button"
            className={`fridge-btn ${mode === 'register' ? 'fridge-btn-primary' : ''}`}
            onClick={() => { setMode('register'); setError(null); }}
          >
            הרשמה
          </button>
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setError(null);
            try {
              if (mode === 'login') {
                await login({ email: email.trim(), password });
                navigate('/devices');
              } else {
                if (!username.trim()) {
                  setError('יש להזין שם משתמש');
                  return;
                }
                await register({
                  email: email.trim(),
                  password,
                  role: 'END_USER',
                  username: username.trim(),
                  avatar: 'user.png',
                });
                await login({ email: email.trim(), password });
                navigate('/devices');
              }
            } catch (err) {
              setError(err?.data?.message || err.message || 'הפעולה נכשלה');
            }
          }}
        >
          {mode === 'register' ? (
            <div className="fridge-field">
              <label htmlFor="username">שם</label>
              <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="השם שלך" />
            </div>
          ) : null}

          <div className="fridge-field">
            <label htmlFor="email">אימייל</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>

          <div className="fridge-field">
            <label htmlFor="password">סיסמה</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="סיסמה חזקה" />
          </div>

          <button type="submit" className="fridge-btn fridge-btn-primary" disabled={disabled} style={{ width: '100%' }}>
            {mode === 'login' ? 'כניסה למערכת' : 'יצירת חשבון'}
          </button>
        </form>

        <div className="fridge-demo-hint">
          <b>לניסוי עם נתוני הדמו:</b>
          <br />
          אימייל: initializer@afeka.ac.il
          <br />
          סיסמה: Admin123!
        </div>
      </div>
    </div>
  );
}
