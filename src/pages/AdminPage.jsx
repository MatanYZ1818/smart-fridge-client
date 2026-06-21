import { useEffect, useState } from 'react';
import InlineAlert from '../components/InlineAlert';
import * as ambientApi from '../lib/ambientApi';

export default function AdminPage({ canAdmin }) {
  const [users, setUsers] = useState([]);
  const [commands, setCommands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  async function reload() {
    setError(null);
    setLoading(true);
    try {
      const [u, c] = await Promise.all([
        ambientApi.adminExportUsers(),
        ambientApi.adminExportCommands(),
      ]);
      setUsers(Array.isArray(u) ? u : []);
      setCommands(Array.isArray(c) ? c : []);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load admin exports');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!canAdmin) return;
    const id = setTimeout(() => reload(), 0);
    return () => clearTimeout(id);
  }, [canAdmin]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h2 style={{ margin: '6px 0 4px' }}>Admin</h2>
      <p style={{ marginTop: 0, color: '#6b7280' }}>
        Export data and run destructive reset actions.
      </p>

      {error ? <InlineAlert type="error" title="Failed" message={error} /> : null}
      {actionError ? <InlineAlert type="error" title="Action failed" message={actionError} /> : null}
      {actionSuccess ? <InlineAlert type="success" title="Action completed" message={actionSuccess} /> : null}

      {loading ? <div style={{ color: '#6b7280' }}>Loading…</div> : null}

      {!loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
            <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 10 }}>Users export</div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Email</th>
                  <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Role</th>
                  <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Username</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.userId?.email} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: 10 }}>{u.userId?.email}</td>
                    <td style={{ padding: 10, color: '#374151', fontWeight: 800 }}>{u.role}</td>
                    <td style={{ padding: 10 }}>{u.username}</td>
                  </tr>
                ))}
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ padding: 12, color: '#6b7280' }}>
                      No users.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
            <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 10 }}>Reset actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                onClick={async () => {
                  setActionError(null);
                  setActionSuccess(null);
                  if (!confirm('Delete all users? This is destructive.')) return;
                  try {
                    await ambientApi.adminDeleteAllUsers();
                    setActionSuccess('All users deleted');
                    await reload();
                  } catch (err) {
                    setActionError(err?.data?.message || err.message || 'Failed deleting users');
                  }
                }}
                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 900 }}
              >
                Delete all users
              </button>

              <button
                type="button"
                onClick={async () => {
                  setActionError(null);
                  setActionSuccess(null);
                  if (!confirm('Delete all objects? This is destructive.')) return;
                  try {
                    await ambientApi.adminDeleteAllObjects();
                    setActionSuccess('All objects deleted');
                    await reload();
                  } catch (err) {
                    setActionError(err?.data?.message || err.message || 'Failed deleting objects');
                  }
                }}
                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 900 }}
              >
                Delete all objects
              </button>

              <button
                type="button"
                onClick={async () => {
                  setActionError(null);
                  setActionSuccess(null);
                  if (!confirm('Delete all commands history? This is destructive.')) return;
                  try {
                    await ambientApi.adminDeleteAllCommands();
                    setActionSuccess('All commands deleted');
                    await reload();
                  } catch (err) {
                    setActionError(err?.data?.message || err.message || 'Failed deleting commands');
                  }
                }}
                style={{ padding: '12px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 900 }}
              >
                Delete all commands
              </button>
            </div>

            <div style={{ marginTop: 14, color: '#6b7280', fontSize: 13 }}>
              Tip: Use this in dev/test scenarios only.
            </div>
          </div>

          <div style={{ gridColumn: '1 / -1', border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
            <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 10 }}>Commands export</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Command</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Target</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Invoked by</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Timestamp</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Status/Message</th>
                  </tr>
                </thead>
                <tbody>
                  {commands.map((c) => (
                    <tr key={c.id?.commandId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 10, fontWeight: 900 }}>{c.command}</td>
                      <td style={{ padding: 10, color: '#374151' }}>
                        {c.targetObject?.id?.objectId} <span style={{ color: '#6b7280' }}>({c.targetObject?.id?.systemID})</span>
                      </td>
                      <td style={{ padding: 10 }}>{c.invokedBy?.userId?.email}</td>
                      <td style={{ padding: 10, color: '#6b7280' }}>{c.invocationTimestamp || '—'}</td>
                      <td style={{ padding: 10 }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>
                          {JSON.stringify(
                            {
                              status: c.commandAttributes?.status,
                              message: c.commandAttributes?.message,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </td>
                    </tr>
                  ))}
                  {commands.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 12, color: '#6b7280' }}>
                        No commands.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

