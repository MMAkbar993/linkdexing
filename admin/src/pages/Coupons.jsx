import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { couponUrl } from '../api/endpoints';

const num = (n) => (n ?? 0).toLocaleString('en-US');

const emptyForm = {
  code: '',
  discountType: 'percent',
  discountValue: '',
  expiresAt: '',
  maxRedemptions: '',
  perUserLimit: '1',
};

const discountLabel = (c) =>
  c.discountType === 'percent' ? `${c.discountValue}% off` : `$${c.discountValue} off`;

const dateLabel = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await privateApi.get(couponUrl);
      setCoupons(res.data.coupons || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load coupons');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const updateField = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();

    const discountValue = Number(form.discountValue);
    if (!form.code.trim()) {
      toast.error('Enter a coupon code.');
      return;
    }
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      toast.error('Enter a discount amount greater than 0.');
      return;
    }
    if (form.discountType === 'percent' && discountValue > 100) {
      toast.error("A percent discount can't exceed 100.");
      return;
    }

    setCreating(true);
    try {
      await privateApi.post(couponUrl, {
        code: form.code.trim(),
        discountType: form.discountType,
        discountValue,
        expiresAt: form.expiresAt || undefined,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : undefined,
        perUserLimit: form.perUserLimit === '' ? undefined : Number(form.perUserLimit),
      });
      toast.success('Coupon created');
      setForm(emptyForm);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create coupon');
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (coupon) => {
    setBusyId(coupon._id);
    try {
      await privateApi.patch(`${couponUrl}/${coupon._id}`, { isActive: !coupon.isActive });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update coupon');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Delete coupon "${coupon.code}"? This can't be undone.`)) return;
    setBusyId(coupon._id);
    try {
      await privateApi.delete(`${couponUrl}/${coupon._id}`);
      toast.success('Coupon deleted');
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete coupon');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Coupons</h1>
          <p>Discount codes buyers can apply on the buy-credits page.</p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <h2>New coupon</h2>
        </div>
        <div className="card-body-x">
          <form className="form-x" onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div className="field">
                <label htmlFor="code">Code</label>
                <input
                  id="code"
                  className="form-control"
                  placeholder="e.g. WELCOME10"
                  value={form.code}
                  onChange={updateField('code')}
                  disabled={creating}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="field">
                <label htmlFor="discountType">Discount type</label>
                <select
                  id="discountType"
                  className="form-select"
                  value={form.discountType}
                  onChange={updateField('discountType')}
                  disabled={creating}
                >
                  <option value="percent">Percent off</option>
                  <option value="flat">Flat amount off (USD)</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="discountValue">
                  {form.discountType === 'percent' ? 'Percent off' : 'Amount off ($)'}
                </label>
                <input
                  id="discountValue"
                  type="number"
                  step={form.discountType === 'percent' ? '1' : '0.01'}
                  min="0"
                  className="form-control"
                  value={form.discountValue}
                  onChange={updateField('discountValue')}
                  disabled={creating}
                />
              </div>

              <div className="field">
                <label htmlFor="expiresAt">Expires (optional)</label>
                <input
                  id="expiresAt"
                  type="date"
                  className="form-control"
                  value={form.expiresAt}
                  onChange={updateField('expiresAt')}
                  disabled={creating}
                />
              </div>

              <div className="field">
                <label htmlFor="maxRedemptions">Total use limit (optional)</label>
                <input
                  id="maxRedemptions"
                  type="number"
                  min="1"
                  step="1"
                  className="form-control"
                  placeholder="Unlimited"
                  value={form.maxRedemptions}
                  onChange={updateField('maxRedemptions')}
                  disabled={creating}
                />
              </div>

              <div className="field">
                <label htmlFor="perUserLimit">Uses per customer</label>
                <input
                  id="perUserLimit"
                  type="number"
                  min="0"
                  step="1"
                  className="form-control"
                  placeholder="1"
                  value={form.perUserLimit}
                  onChange={updateField('perUserLimit')}
                  disabled={creating}
                />
                <p className="hint">0 = unlimited uses per customer.</p>
              </div>
            </div>

            <button type="submit" className="btn-x solid" disabled={creating} style={{ marginTop: 8 }}>
              {creating ? 'Creating…' : 'Create coupon'}
            </button>
          </form>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <h2>{num(coupons.length)} coupon(s)</h2>
        </div>

        <div className="table-wrap">
          <table className="table-x">
            <thead>
              <tr>
                <th scope="col">Code</th>
                <th scope="col">Discount</th>
                <th scope="col">Status</th>
                <th scope="col" className="num">
                  Redemptions
                </th>
                <th scope="col">Per customer</th>
                <th scope="col">Expires</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    {loading ? 'Loading…' : 'No coupons yet.'}
                  </td>
                </tr>
              ) : (
                coupons.map((c) => {
                  const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                  const exhausted = c.maxRedemptions && c.redemptionCount >= c.maxRedemptions;
                  return (
                    <tr key={c._id}>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{c.code}</td>
                      <td className="muted">{discountLabel(c)}</td>
                      <td>
                        {!c.isActive ? (
                          <span className="badge-x bad">Inactive</span>
                        ) : expired ? (
                          <span className="badge-x bad">Expired</span>
                        ) : exhausted ? (
                          <span className="badge-x warn">Used up</span>
                        ) : (
                          <span className="badge-x">Active</span>
                        )}
                      </td>
                      <td className="num">
                        {num(c.redemptionCount)}
                        {c.maxRedemptions ? ` / ${num(c.maxRedemptions)}` : ''}
                      </td>
                      <td className="muted">{c.perUserLimit > 0 ? num(c.perUserLimit) : 'Unlimited'}</td>
                      <td className="muted">{dateLabel(c.expiresAt)}</td>
                      <td>
                        <div className="actions">
                          <button
                            type="button"
                            className="btn-x ghost sm"
                            onClick={() => toggleActive(c)}
                            disabled={busyId === c._id}
                          >
                            {c.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="btn-x danger sm"
                            onClick={() => handleDelete(c)}
                            disabled={busyId === c._id || c.redemptionCount > 0}
                            title={
                              c.redemptionCount > 0
                                ? "Already used - deactivate it instead of deleting"
                                : undefined
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
