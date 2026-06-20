import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as ambientApi from '../lib/ambientApi';
import { markProductStatus, statusClass, statusLabel } from '../lib/fridgeHelpers';
import { ui } from '../strings/he';

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updating, setUpdating] = useState(false);

  const reload = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [obj, pars] = await Promise.all([
        ambientApi.getObject({ objectId: productId }),
        ambientApi.getParents({ childObjectId: productId }),
      ]);
      setProduct(obj);
      setParents(Array.isArray(pars) ? pars : []);
    } catch (err) {
      setError(err?.data?.message || err.message || ui.product.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    const id = setTimeout(() => reload(), 0);
    return () => clearTimeout(id);
  }, [reload]);

  async function setStatus(status) {
    setUpdating(true);
    setError(null);
    setSuccess(null);
    try {
      await markProductStatus({ objectId: productId, status });
      setSuccess(status === 'CONSUMED' ? ui.product.markedConsumed : ui.product.markedAvailable);
      await reload();
    } catch (err) {
      setError(err?.data?.message || err.message || ui.product.updateFailed);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="fridge-empty">{ui.product.loading}</div>;
  if (!product) return <div className="fridge-empty">{ui.product.notFound}</div>;

  return (
    <>
      <Link to="/devices" className="fridge-btn" style={{ display: 'inline-block', marginBottom: 16 }}>
        {ui.product.backToDevices}
      </Link>

      {error ? <div className="fridge-alert error">{error}</div> : null}
      {success ? <div className="fridge-alert success">{success}</div> : null}

      <div className="fridge-form">
        <div className="fridge-product-header">
          <div>
            <h2 style={{ margin: '0 0 8px' }}>{product.alias}</h2>
            <span className={`status-pill ${statusClass(product.status)}`}>{statusLabel(product.status)}</span>
          </div>
        </div>

        {parents.length > 0 ? (
          <p style={{ color: 'var(--fridge-muted)' }}>
            {ui.product.locatedIn}: {parents.map((p) => p.alias).join(', ')}
          </p>
        ) : null}

        <div className="fridge-product-actions">
          {product.status !== 'CONSUMED' ? (
            <button
              type="button"
              className="fridge-btn"
              disabled={updating}
              onClick={() => setStatus('CONSUMED')}
            >
              {ui.product.markConsumed}
            </button>
          ) : (
            <button
              type="button"
              className="fridge-btn fridge-btn-primary"
              disabled={updating}
              onClick={() => setStatus('AVAILABLE')}
            >
              {ui.product.markAvailable}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
