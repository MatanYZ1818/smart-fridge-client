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
import { ui } from '../strings/he';

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
      setError(err?.data?.message || err.message || ui.home.loadFailed);
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
      setSuccess(ui.home.commandSuccess(command.label, device.alias));
    } catch (err) {
      setError(err?.data?.message || err.message || ui.home.commandFailed);
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
          <h2>{ui.home.title}</h2>
          <p>
            {loading
              ? ui.home.loading
              : ui.home.statsSummary(activeDevices, availableProducts)}
          </p>
        </div>
        <div className="fridge-hero-actions">
          <button type="button" className="fridge-btn" onClick={reload}>
            {ui.home.refresh}
          </button>
        </div>
      </section>

      <div className="fridge-section-title">
        <h2>{ui.home.devicesSection}</h2>
      </div>

      {loading ? (
        <div className="fridge-empty">{ui.home.loadingDevices}</div>
      ) : devices.length === 0 ? (
        <div className="fridge-empty">{ui.home.noDevices}</div>
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
                  <span className="device-count">{ui.home.itemCount(device.contents?.length || 0)}</span>
                ) : null}
              </div>

              <div className="command-list" aria-label={ui.home.commandsForDevice(device.alias)}>
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
                {ui.home.deviceDetailsLink}
              </Link>
            </article>
          ))}
        </div>
      )}

      {!canManage ? (
        <p className="fridge-footnote">{ui.home.footnote}</p>
      ) : null}
    </>
  );
}
