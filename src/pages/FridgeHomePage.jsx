import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CommandButton from '../components/CommandButton';
import { useAuth } from '../context/AuthContext';
import { useCommandRunner } from '../hooks/useCommandRunner';
import {
  deviceDescription,
  deviceIcon,
  getAvailableCommands,
  invokeDeviceCommand,
  isContainer,
  loadDevicesDashboard,
  statusClass,
  statusLabel,
} from '../lib/fridgeHelpers';

export default function FridgeHomePage({ canManage }) {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { activeKey, countdown, runCommand } = useCommandRunner();

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await loadDevicesDashboard();
      setDevices(data.devices);
      setProducts(data.products);
    } catch (err) {
      setError(err?.data?.message || err.message || 'לא הצלחנו לטעון את המכשירים');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = setTimeout(() => reload(), 0);
    return () => clearTimeout(id);
  }, [reload]);

  async function handleCommand(device, command) {
    setError(null);
    setSuccess(null);
    try {
      await runCommand(device, command, () => invokeDeviceCommand({ user, device, command }));
      setSuccess(`הפקודה "${command.label}" הופעלה על ${device.alias}`);
    } catch (err) {
      setError(err?.data?.message || err.message || 'הפעלת הפקודה נכשלה');
    }
  }

  const activeDevices = devices.filter((d) => d.active).length;
  const availableProducts = products.filter((p) => p.status === 'AVAILABLE').length;

  return (
    <>
      {error ? <div className="fridge-alert error">{error}</div> : null}
      {success ? <div className="fridge-alert success">{success}</div> : null}

      <section className="fridge-hero">
        <div>
          <h2>הבית החכם שלי</h2>
          <p>
            {loading
              ? 'טוען...'
              : `${activeDevices} מכשירים פעילים, ${availableProducts} פריטים זמינים בתכולה`}
          </p>
        </div>
        <div className="fridge-hero-actions">
          <button type="button" className="fridge-btn" onClick={reload}>
            רענון
          </button>
        </div>
      </section>

      <div className="fridge-section-title">
        <h2>מכשירים ופעולות</h2>
      </div>

      {loading ? (
        <div className="fridge-empty">טוען מכשירים...</div>
      ) : devices.length === 0 ? (
        <div className="fridge-empty">לא נמצאו מכשירים במערכת. ודא שה-backend רץ עם נתוני דמו.</div>
      ) : (
        <div className="fridge-grid">
          {devices.map((device) => (
            <article key={device.id?.objectId} className="fridge-card device-card">
              <div className="device-card-header">
                <span className="device-icon" aria-hidden>{deviceIcon(device)}</span>
                <div>
                  <h3>{device.alias}</h3>
                  <p>{deviceDescription(device)}</p>
                </div>
              </div>

              <div className="device-meta">
                <span className={`status-pill ${statusClass(device.status)}`}>{statusLabel(device.status)}</span>
                {isContainer(device) ? (
                  <span className="device-count">{device.contents?.length || 0} פריטים</span>
                ) : null}
              </div>

              <div className="command-list" aria-label={`פקודות עבור ${device.alias}`}>
                {getAvailableCommands(device).map((command) => (
                  <CommandButton
                    key={command.name}
                    device={device}
                    command={command}
                    activeKey={activeKey}
                    countdown={countdown}
                    onClick={() => handleCommand(device, command)}
                  />
                ))}
              </div>

              <Link
                to={`/devices/${encodeURIComponent(device.id.objectId)}`}
                className="fridge-btn fridge-btn-primary device-details-link"
              >
                פרטי מכשיר ותכולה
              </Link>
            </article>
          ))}
        </div>
      )}

      {!canManage ? (
        <p className="fridge-footnote">משתמש רגיל יכול להפעיל פקודות ולצפות בתכולה. ניהול פריטים זמין למפעילים ומנהלים.</p>
      ) : null}
    </>
  );
}
