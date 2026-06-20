import { useCallback, useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import CommandButton from '../components/CommandButton';
import { useAuth } from '../context/AuthContext';
import { useCommandRunner } from '../hooks/useCommandRunner';
import {
  addItemToDevice,
  deviceDescription,
  deviceIcon,
  getAvailableCommands,
  getDeviceDetails,
  invokeDeviceCommand,
  isContainer,
  markProductStatus,
  statusClass,
  statusLabel,
} from '../lib/fridgeHelpers';

export default function DevicePage() {
  const { deviceId } = useParams();
  const { canManage } = useOutletContext();
  const { user } = useAuth();

  const [device, setDevice] = useState(null);
  const [contents, setContents] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { activeKey, countdown, runCommand } = useCommandRunner();
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [newItemName, setNewItemName] = useState('');
  const [adding, setAdding] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const data = await getDeviceDetails({ objectId: deviceId });
      setDevice(data.device);
      setContents(data.contents);
      setParents(data.parents);
    } catch (err) {
      setError(err?.data?.message || err.message || 'לא הצלחנו לטעון את המכשיר');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    const id = setTimeout(() => reload(), 0);
    return () => clearTimeout(id);
  }, [reload]);

  async function handleCommand(command) {
    if (!device) return;
    setError(null);
    setSuccess(null);
    try {
      await runCommand(device, command, () => invokeDeviceCommand({ user, device, command }));
      setSuccess(`הפקודה "${command.label}" הופעלה בהצלחה`);
    } catch (err) {
      setError(err?.data?.message || err.message || 'הפעלת הפקודה נכשלה');
    }
  }

  async function setItemStatus(item, status) {
    setUpdatingItemId(item.id.objectId);
    setError(null);
    setSuccess(null);
    try {
      await markProductStatus({ objectId: item.id.objectId, status });
      setSuccess(`הפריט "${item.alias}" עודכן`);
      await reload();
    } catch (err) {
      setError(err?.data?.message || err.message || 'עדכון הפריט נכשל');
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function addItem(e) {
    e.preventDefault();
    if (!device || !newItemName.trim()) return;
    setAdding(true);
    setError(null);
    setSuccess(null);
    try {
      await addItemToDevice({ user, device, alias: newItemName.trim() });
      setSuccess(`"${newItemName.trim()}" נוסף לתכולה`);
      setNewItemName('');
      await reload();
    } catch (err) {
      setError(err?.data?.message || err.message || 'הוספת הפריט נכשלה');
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <div className="fridge-empty">טוען מכשיר...</div>;
  if (!device) return <div className="fridge-empty">המכשיר לא נמצא</div>;

  return (
    <>
      <Link to="/devices" className="fridge-btn" style={{ display: 'inline-block', marginBottom: 16 }}>
        חזרה למכשירים
      </Link>

      {error ? <div className="fridge-alert error">{error}</div> : null}
      {success ? <div className="fridge-alert success">{success}</div> : null}

      <section className="fridge-form device-detail">
        <div className="device-card-header">
          <span className="device-icon large" aria-hidden>{deviceIcon(device)}</span>
          <div>
            <h2 style={{ margin: '0 0 8px' }}>{device.alias}</h2>
            <p>{deviceDescription(device)}</p>
            <span className={`status-pill ${statusClass(device.status)}`}>{statusLabel(device.status)}</span>
          </div>
        </div>

        {parents.length > 0 ? (
          <p className="device-location">נמצא בתוך: {parents.map((p) => p.alias).join(', ')}</p>
        ) : null}

        <div className="fridge-section-title inner">
          <h2>פקודות זמינות</h2>
        </div>
        <div className="command-list expanded">
          {getAvailableCommands(device).map((command) => (
            <CommandButton
              key={command.name}
              device={device}
              command={command}
              activeKey={activeKey}
              countdown={countdown}
              onClick={() => handleCommand(command)}
            />
          ))}
        </div>
      </section>

      {isContainer(device) ? (
        <section className="fridge-form device-contents">
          <div className="fridge-section-title inner">
            <h2>תכולה</h2>
          </div>

          {contents.length === 0 ? (
            <div className="fridge-empty compact">אין כרגע פריטים בתוך המכשיר.</div>
          ) : (
            <div className="content-list">
              {contents.map((item) => (
                <div key={item.id.objectId} className="content-row">
                  <div>
                    <strong>{item.alias}</strong>
                    <span className={`status-pill ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>
                  </div>
                  <div className="content-actions">
                    {item.status !== 'CONSUMED' ? (
                      <button
                        type="button"
                        className="fridge-btn"
                        disabled={updatingItemId === item.id.objectId}
                        onClick={() => setItemStatus(item, 'CONSUMED')}
                      >
                        סמן כנגמר
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="fridge-btn fridge-btn-primary"
                        disabled={updatingItemId === item.id.objectId}
                        onClick={() => setItemStatus(item, 'AVAILABLE')}
                      >
                        החזר לזמין
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {canManage ? (
            <form className="add-item-form" onSubmit={addItem}>
              <div className="fridge-field">
                <label htmlFor="new-item-name">הוספת פריט לתכולה</label>
                <input
                  id="new-item-name"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="לדוגמה: חלב, קפסולות קפה, ירקות"
                />
              </div>
              <button type="submit" className="fridge-btn fridge-btn-primary" disabled={adding || !newItemName.trim()}>
                {adding ? 'מוסיף...' : 'הוסף פריט'}
              </button>
            </form>
          ) : null}
        </section>
      ) : null}
    </>
  );
}
