import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import InlineAlert from '../components/InlineAlert';
import JsonTextarea from '../components/JsonTextarea';
import { useAuth } from '../context/AuthContext';
import * as ambientApi from '../lib/ambientApi';

export default function ObjectsPage({ canOperator }) {
  const { user } = useAuth();
  const canWrite = !!canOperator;

  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  // Create form state
  const [cType, setCType] = useState('');
  const [cAlias, setCAlias] = useState('');
  const [cStatus, setCStatus] = useState('');
  const [cActive, setCActive] = useState(true);
  const [cLocation, setCLocation] = useState(undefined);
  const [cDetails, setCDetails] = useState(undefined);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(null);

  async function reload() {
    setError(null);
    setLoading(true);
    try {
      const data = await ambientApi.getAllObjects();
      setObjects(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load objects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => reload(), 0);
    return () => clearTimeout(id);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return objects;
    return objects.filter((o) => {
      const haystack = `${o.alias || ''} ${o.type || ''} ${o.status || ''} ${o.id?.objectId || ''}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [objects, query]);

  return (
    <div style={{ maxWidth: 1040, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 18 }}>
        <div>
          <h2 style={{ margin: '6px 0 4px' }}>Objects</h2>
          <p style={{ marginTop: 0, color: '#6b7280' }}>
            Create and manage domain objects and their relationships.
          </p>
        </div>
        {canWrite ? (
          <button
            type="button"
            onClick={() => {
              setCreateOpen(true);
              setCreateError(null);
              setCreateSuccess(null);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              border: '1px solid #e5e7eb',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            Create object
          </button>
        ) : (
          <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 700 }}>Read-only mode</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 12, margin: '14px 0 12px' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by alias, type, status, or id…"
          style={{ flex: 1, padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
        />
        <button
          type="button"
          onClick={reload}
          style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid #e5e7eb',
            background: '#fff',
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          Refresh
        </button>
      </div>

      {error ? <InlineAlert type="error" title="Failed" message={error} /> : null}

      {loading ? (
        <div style={{ color: '#6b7280' }}>Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {filtered.map((o) => (
            <Link
              key={o.id?.objectId}
              to={`/objects/${encodeURIComponent(o.id?.objectId || '')}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: 16,
                  padding: 14,
                  background: '#fff',
                  height: '100%',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                  <div style={{ fontWeight: 900 }}>{o.alias}</div>
                  <div style={{ color: '#6b7280', fontSize: 12 }}>{o.type}</div>
                </div>
                <div style={{ marginTop: 10, color: '#111827', fontSize: 13 }}>
                  <div>
                    <b>Status:</b> {o.status || '—'}
                  </div>
                  <div>
                    <b>Active:</b> {o.active ? 'Yes' : 'No'}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: 8 }}>
                    <b>ID:</b> {o.id?.objectId}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', color: '#6b7280' }}>No objects found.</div>
          ) : null}
        </div>
      )}

      {createOpen && canWrite ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 18,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
        >
          <div
            style={{
              width: 'min(920px, 100%)',
              background: '#fff',
              borderRadius: 18,
              padding: 18,
              border: '1px solid #e5e7eb',
              maxHeight: '85vh',
              overflow: 'auto',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 950, fontSize: 18 }}>Create new object</div>
                <div style={{ color: '#6b7280', fontSize: 13 }}>Fields `location` and `objectDetails` are JSON maps.</div>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                style={{ padding: '8px 12px', borderRadius: 12, cursor: 'pointer', border: '1px solid #e5e7eb', background: '#fff' }}
              >
                Close
              </button>
            </div>

            {createError ? <InlineAlert type="error" title="Create failed" message={createError} /> : null}
            {createSuccess ? <InlineAlert type="success" title="Created" message={createSuccess} /> : null}

            <form
              style={{ marginTop: 14 }}
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateError(null);
                setCreateSuccess(null);
                try {
                  const created = await ambientApi.createObject({
                    type: cType.trim(),
                    alias: cAlias.trim(),
                    status: cStatus.trim() || undefined,
                    active: !!cActive,
                    location: cLocation,
                    objectDetails: cDetails,
                    createdBy: {
                      userId: {
                        email: user.userId.email,
                        systemID: user.userId.systemID,
                      },
                    },
                  });
                  setCreateSuccess(`Created "${created.alias}"`);
                  setCreateOpen(false);
                  // reset form
                  setCType('');
                  setCAlias('');
                  setCStatus('');
                  setCActive(true);
                  setCLocation(undefined);
                  setCDetails(undefined);
                  await reload();
                } catch (err) {
                  setCreateError(err?.data?.message || err.message || 'Create failed');
                }
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Type</div>
                  <input
                    value={cType}
                    onChange={(e) => setCType(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                    placeholder="SENSOR / SMART_PLUG / …"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Alias</div>
                  <input
                    value={cAlias}
                    onChange={(e) => setCAlias(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                    placeholder="Human readable name"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Status</div>
                  <input
                    value={cStatus}
                    onChange={(e) => setCStatus(e.target.value)}
                    style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                    placeholder="e.g., AVAILABLE / ON"
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Active</div>
                  <select
                    value={cActive ? 'true' : 'false'}
                    onChange={(e) => setCActive(e.target.value === 'true')}
                    style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>

              <JsonTextarea
                label="Location (JSON map)"
                value={cLocation}
                onChange={setCLocation}
              />
              <JsonTextarea
                label="Object details (JSON map)"
                value={cDetails}
                onChange={setCDetails}
              />

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
                  fontWeight: 900,
                  marginTop: 6,
                }}
              >
                Create object
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

