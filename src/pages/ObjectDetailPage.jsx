import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import InlineAlert from '../components/InlineAlert';
import JsonTextarea from '../components/JsonTextarea';
import * as ambientApi from '../lib/ambientApi';

function jsonView(value) {
  if (value === undefined) return '—';
  if (value === null) return 'null';
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function ObjectDetailPage({ canOperator }) {
  const { objectId } = useParams();
  const canWrite = !!canOperator;

  const [object, setObject] = useState(null);
  const [children, setChildren] = useState([]);
  const [parents, setParents] = useState([]);
  const [allObjects, setAllObjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tab, setTab] = useState('details'); // details | edit | relations
  const [editType, setEditType] = useState('');
  const [editAlias, setEditAlias] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [editLocation, setEditLocation] = useState(undefined);
  const [editDetails, setEditDetails] = useState(undefined);

  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  // Relation binding
  const [bindChildId, setBindChildId] = useState('');
  const [bindError, setBindError] = useState(null);
  const [bindSuccess, setBindSuccess] = useState(null);

  const availableChildrenToBind = useMemo(() => {
    const currentId = object?.id?.objectId;
    if (!currentId) return [];
    const childIds = new Set(children.map((c) => c.id?.objectId).filter(Boolean));
    return allObjects
      .filter((o) => o.id?.objectId && o.id.objectId !== currentId)
      .filter((o) => !childIds.has(o.id.objectId));
  }, [allObjects, children, object]);

  const reloadAll = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [obj, kids, pars, objs] = await Promise.all([
        ambientApi.getObject({ objectId }),
        ambientApi.getChildren({ parentObjectId: objectId }),
        ambientApi.getParents({ childObjectId: objectId }),
        ambientApi.getAllObjects(),
      ]);

      setObject(obj);
      setChildren(Array.isArray(kids) ? kids : []);
      setParents(Array.isArray(pars) ? pars : []);
      setAllObjects(Array.isArray(objs) ? objs : []);

      setEditType(obj?.type || '');
      setEditAlias(obj?.alias || '');
      setEditStatus(obj?.status || '');
      setEditActive(!!obj?.active);
      setEditLocation(obj?.location);
      setEditDetails(obj?.objectDetails);
    } catch (err) {
      setError(err?.data?.message || err.message || 'Failed to load object details');
    } finally {
      setLoading(false);
    }
  }, [objectId]);

  useEffect(() => {
    const id = setTimeout(() => reloadAll(), 0);
    return () => clearTimeout(id);
  }, [reloadAll]);

  const tabs = canWrite
    ? [
        { id: 'details', label: 'Details' },
        { id: 'edit', label: 'Edit' },
        { id: 'relations', label: 'Relations' },
      ]
    : [
        { id: 'details', label: 'Details' },
        { id: 'relations', label: 'Relations' },
      ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: '6px 0 4px' }}>Object</h2>
          <p style={{ marginTop: 0, color: '#6b7280' }}>
            View, update, and manage parent/child relationships.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => reloadAll()}
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
      </div>

      {error ? <InlineAlert type="error" title="Failed" message={error} /> : null}

      {loading || !object ? (
        <div style={{ color: '#6b7280' }}>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTab(t.id);
                      setEditError(null);
                      setEditSuccess(null);
                      setBindError(null);
                      setBindSuccess(null);
                    }}
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      border: '1px solid #e5e7eb',
                      background: tab === t.id ? '#111827' : '#fff',
                      color: tab === t.id ? '#fff' : '#111827',
                      cursor: 'pointer',
                      fontWeight: 900,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
          </div>

          {tab === 'details' ? (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
                <div style={{ fontWeight: 950, fontSize: 18 }}>{object.alias}</div>
                <div style={{ color: '#6b7280', marginTop: 4 }}>
                  Type: <b style={{ color: '#111827' }}>{object.type}</b>
                </div>
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  <div>
                    <b>Status:</b> {object.status || '—'}
                  </div>
                  <div>
                    <b>Active:</b> {object.active ? 'Yes' : 'No'}
                  </div>
                  <div style={{ marginTop: 8, color: '#6b7280' }}>
                    <b>ID:</b> {object.id?.objectId}
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: '#6b7280' }}>
                  <b>Created by:</b> {object.createdBy?.userId?.email}
                </div>
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
                <div style={{ fontWeight: 950, marginBottom: 8 }}>Location</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12, color: '#374151' }}>
                  {jsonView(object.location)}
                </pre>
                <div style={{ height: 12 }} />
                <div style={{ fontWeight: 950, marginBottom: 8 }}>Object details</div>
                <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: 12, color: '#374151' }}>
                  {jsonView(object.objectDetails)}
                </pre>
              </div>
            </div>
          ) : null}

          {canWrite && tab === 'edit' ? (
            <div style={{ marginTop: 14, border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
              {editError ? <InlineAlert type="error" title="Update failed" message={editError} /> : null}
              {editSuccess ? <InlineAlert type="success" title="Updated" message={editSuccess} /> : null}

              <form
                style={{ marginTop: 12 }}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditError(null);
                  setEditSuccess(null);

                  try {
                    if (!editType.trim() || !editAlias.trim()) {
                      setEditError('Type and alias are required.');
                      return;
                    }

                    await ambientApi.updateObject({
                      objectId: object.id.objectId,
                      payload: {
                        type: editType.trim(),
                        alias: editAlias.trim(),
                        status: editStatus.trim() || undefined,
                        active: !!editActive,
                        location: editLocation,
                        objectDetails: editDetails,
                      },
                    });

                    setEditSuccess('Object updated successfully');
                    await reloadAll();
                  } catch (err) {
                    setEditError(err?.data?.message || err.message || 'Update failed');
                  }
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Type (mutable)</div>
                    <input
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                      style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Alias (mutable)</div>
                    <input
                      value={editAlias}
                      onChange={(e) => setEditAlias(e.target.value)}
                      style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Status</div>
                    <input
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                    />
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, marginBottom: 6 }}>Active</div>
                    <select
                      value={editActive ? 'true' : 'false'}
                      onChange={(e) => setEditActive(e.target.value === 'true')}
                      style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>

                <JsonTextarea label="Location (JSON map)" value={editLocation} onChange={setEditLocation} />
                <JsonTextarea label="Object details (JSON map)" value={editDetails} onChange={setEditDetails} />

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
          ) : null}

          {tab === 'relations' ? (
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
                <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 10 }}>Children</div>
                {children.length === 0 ? <div style={{ color: '#6b7280' }}>No children bound.</div> : null}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {children.map((c) => (
                    <Link
                      key={c.id?.objectId}
                      to={`/objects/${encodeURIComponent(c.id?.objectId)}`}
                      style={{ textDecoration: 'none', border: '1px solid #f3f4f6', padding: 10, borderRadius: 12 }}
                    >
                      <div style={{ fontWeight: 900 }}>{c.alias}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>{c.type}</div>
                    </Link>
                  ))}
                </div>

                <div style={{ height: 14 }} />
                <div style={{ fontWeight: 950, fontSize: 14, marginBottom: 10 }}>Bind new child</div>
                {canWrite ? (
                  <>
                    {bindError ? <InlineAlert type="error" title="Binding failed" message={bindError} /> : null}
                    {bindSuccess ? <InlineAlert type="success" title="Bound" message={bindSuccess} /> : null}
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setBindError(null);
                        setBindSuccess(null);
                        try {
                          if (!bindChildId) {
                            setBindError('Select a child object.');
                            return;
                          }
                          await ambientApi.bindChild({
                            parentObjectId: object.id.objectId,
                            childObjectId: bindChildId,
                          });
                          setBindSuccess('Child bound successfully');
                          setBindChildId('');
                          await reloadAll();
                        } catch (err) {
                          setBindError(err?.data?.message || err.message || 'Binding failed');
                        }
                      }}
                    >
                      <select
                        value={bindChildId}
                        onChange={(e) => setBindChildId(e.target.value)}
                        style={{ width: '100%', padding: 10, borderRadius: 12, border: '1px solid #e5e7eb' }}
                      >
                        <option value="">Select a child…</option>
                        {availableChildrenToBind.map((o) => (
                          <option key={o.id?.objectId} value={o.id?.objectId}>
                            {o.alias} ({o.type})
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        disabled={!bindChildId}
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: 12,
                          border: 'none',
                          background: !bindChildId ? '#9ca3af' : '#111827',
                          color: '#fff',
                          cursor: !bindChildId ? 'not-allowed' : 'pointer',
                          fontWeight: 950,
                          marginTop: 10,
                        }}
                      >
                        Bind child
                      </button>
                    </form>
                  </>
                ) : (
                  <div style={{ color: '#6b7280', fontSize: 13, fontWeight: 700 }}>
                    Read-only: binding requires OPERATOR/ADMIN role.
                  </div>
                )}
              </div>

              <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, background: '#fff' }}>
                <div style={{ fontWeight: 950, fontSize: 16, marginBottom: 10 }}>Parents</div>
                {parents.length === 0 ? <div style={{ color: '#6b7280' }}>No parents found.</div> : null}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {parents.map((p) => (
                    <Link
                      key={p.id?.objectId}
                      to={`/objects/${encodeURIComponent(p.id?.objectId)}`}
                      style={{ textDecoration: 'none', border: '1px solid #f3f4f6', padding: 10, borderRadius: 12 }}
                    >
                      <div style={{ fontWeight: 900 }}>{p.alias}</div>
                      <div style={{ color: '#6b7280', fontSize: 12 }}>{p.type}</div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

