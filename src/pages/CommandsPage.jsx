import { useEffect, useMemo, useState } from 'react';
import InlineAlert from '../components/InlineAlert';
import JsonTextarea from '../components/JsonTextarea';
import { useAuth } from '../context/AuthContext';
import * as ambientApi from '../lib/ambientApi';

function safeFirst(arr) {
  return Array.isArray(arr) ? arr[0] : null;
}

export default function CommandsPage({ canAdmin }) {
  const { user } = useAuth();

  const [objects, setObjects] = useState([]);
  const [objectsError, setObjectsError] = useState(null);
  const [loadingObjects, setLoadingObjects] = useState(true);

  const [targetObjectId, setTargetObjectId] = useState('');
  const [command, setCommand] = useState('TURN_ON');
  const [commandAttributes, setCommandAttributes] = useState({ priority: 'high' });

  const [invokeError, setInvokeError] = useState(null);
  const [invokeResult, setInvokeResult] = useState(null);
  const [invoking, setInvoking] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const target = useMemo(
    () => objects.find((o) => o.id?.objectId === targetObjectId) || null,
    [objects, targetObjectId]
  );

  async function loadObjects() {
    setObjectsError(null);
    setLoadingObjects(true);
    try {
      const data = await ambientApi.getAllObjects();
      setObjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setObjectsError(err?.data?.message || err.message || 'Failed to load objects');
    } finally {
      setLoadingObjects(false);
    }
  }

  async function loadHistory() {
    setHistoryError(null);
    setLoadingHistory(true);
    try {
      const data = await ambientApi.adminExportCommands();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistoryError(err?.data?.message || err.message || 'Failed to load command history');
    } finally {
      setLoadingHistory(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => loadObjects(), 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!canAdmin) return;
    const id = setTimeout(() => loadHistory(), 0);
    return () => clearTimeout(id);
  }, [canAdmin]);

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <h2 style={{ margin: '6px 0 4px' }}>Commands</h2>
      <p style={{ marginTop: 0, color: '#6b7280' }}>
        Execute domain commands against a target object.
      </p>

      {objectsError ? <InlineAlert type="error" title="Failed to load objects" message={objectsError} /> : null}

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff', marginTop: 14 }}>
        <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 10 }}>Invoke command</div>

        {loadingObjects ? <div style={{ color: '#6b7280' }}>Loading…</div> : null}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Target object</div>
            <select
              value={targetObjectId}
              onChange={(e) => setTargetObjectId(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
            >
              <option value="">Select object…</option>
              {objects.map((o) => (
                <option key={o.id?.objectId} value={o.id?.objectId}>
                  {o.alias} ({o.type})
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Command</div>
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
              placeholder="TURN_ON, TURN_OFF, OPEN_DOOR…"
            />
          </div>
        </div>

        <JsonTextarea
          label="Command attributes (JSON map)"
          value={commandAttributes}
          onChange={setCommandAttributes}
        />

        <button
          type="button"
          disabled={!targetObjectId || !command.trim() || invoking}
          onClick={async () => {
            setInvokeError(null);
            setInvokeResult(null);
            if (!targetObjectId) return;

            setInvoking(true);
            try {
              const cmdBoundary = {
                command: command.trim(),
                targetObject: {
                  id: {
                    systemID: user.userId.systemID,
                    objectId: targetObjectId,
                  },
                },
                invokedBy: {
                  userId: {
                    email: user.userId.email,
                    systemID: user.userId.systemID,
                  },
                },
                commandAttributes: commandAttributes ?? undefined,
              };

              const res = await ambientApi.invokeCommand({ commandBoundary: cmdBoundary });
              const first = safeFirst(res);
              setInvokeResult(first);
            } catch (err) {
              setInvokeError(err?.data?.message || err.message || 'Command invocation failed');
            } finally {
              setInvoking(false);
            }
          }}
          style={{
            width: '100%',
            padding: '12px 14px',
            borderRadius: 12,
            border: 'none',
            background: !targetObjectId || !command.trim() ? '#9ca3af' : '#111827',
            color: '#fff',
            cursor: !targetObjectId || !command.trim() ? 'not-allowed' : 'pointer',
            fontWeight: 950,
          }}
        >
          {invoking ? 'Invoking…' : 'Invoke'}
        </button>

        {invokeError ? <div style={{ marginTop: 12 }}><InlineAlert type="error" title="Failed" message={invokeError} /></div> : null}
        {invokeResult ? (
          <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 16, padding: 12, background: '#f9fafb' }}>
            <div style={{ fontWeight: 950, marginBottom: 6 }}>Result</div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(invokeResult, null, 2)}</pre>
          </div>
        ) : null}

        {target ? (
          <div style={{ marginTop: 12, color: '#6b7280', fontSize: 13 }}>
            Target: <b style={{ color: '#111827' }}>{target.alias}</b> ({target.type})
          </div>
        ) : null}
      </div>

      {canAdmin ? (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 950, fontSize: 16 }}>Command history (Admin export)</div>
              <div style={{ color: '#6b7280', fontSize: 13 }}>Saved invocations across the system.</div>
            </div>
            <button
              type="button"
              onClick={loadHistory}
              style={{ padding: '10px 14px', borderRadius: 12, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 900 }}
            >
              Refresh
            </button>
          </div>

          {historyError ? <InlineAlert type="error" title="Failed" message={historyError} /> : null}
          {loadingHistory ? <div style={{ color: '#6b7280', marginTop: 12 }}>Loading…</div> : null}

          {!loadingHistory && !historyError ? (
            <div style={{ marginTop: 12, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left' }}>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Command</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Target</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Invoked by</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Timestamp</th>
                    <th style={{ padding: 10, borderBottom: '1px solid #e5e7eb' }}>Attributes</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id?.commandId} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 10, fontWeight: 800 }}>{h.command}</td>
                      <td style={{ padding: 10, color: '#374151' }}>
                        {h.targetObject?.id?.objectId} <span style={{ color: '#6b7280' }}>({h.targetObject?.id?.systemID})</span>
                      </td>
                      <td style={{ padding: 10 }}>{h.invokedBy?.userId?.email}</td>
                      <td style={{ padding: 10, color: '#6b7280' }}>{h.invocationTimestamp || '—'}</td>
                      <td style={{ padding: 10 }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(h.commandAttributes || {}, null, 2)}</pre>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: 12, color: '#6b7280' }}>
                        No command history yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

