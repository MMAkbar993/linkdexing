import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { paymentUrl } from '../api/endpoints';

const PAGE_SIZE = 100;
const num = (n) => (n ?? 0).toLocaleString('en-US');

const STATUSES = ['completed', 'pending', 'failed', 'refunded'];

const money = (amount, currency) =>
  (amount ?? 0).toLocaleString('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  });

const dateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

const statusClass = (status) =>
  status === 'completed' ? '' : status === 'pending' ? 'warn' : 'bad';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchPayments = useCallback(async (s, p) => {
    setLoading(true);
    try {
      const { payments, total } = (
        await privateApi.get(paymentUrl, {
          params: { ...(s ? { status: s } : {}), page: p, limit: PAGE_SIZE },
        })
      ).data;
      setPayments(payments);
      setTotal(total);
      setStatus(s);
      setPage(p);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Something went wrong, please try again later'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments('', 1);
  }, [fetchPayments]);

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Payments</h1>
          <p>{num(total)} transaction(s)</p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <div className="toolbar">
            <div className="field">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(e) => fetchPayments(e.target.value, 1)}
                disabled={loading}
              >
                <option value="">All</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table-x">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">User</th>
                <th scope="col">Transaction ID</th>
                <th scope="col" className="num">
                  Credits
                </th>
                <th scope="col" className="num">
                  Amount
                </th>
                <th scope="col">Method</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    {loading ? 'Loading…' : 'No payments found.'}
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td className="muted">{dateTime(p.createdAt)}</td>
                    <td className="muted">{p.userEmail}</td>
                    <td className="muted" style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {p.paypalCaptureId || p.paypalOrderId}
                    </td>
                    <td className="num">
                      {num(p.credits)}
                      {p.bonusCredits ? ` +${num(p.bonusCredits)}` : ''}
                    </td>
                    <td className="num">{money(p.amount, p.currency)}</td>
                    <td className="muted">{p.paymentMethod}</td>
                    <td>
                      <span
                        className={`badge-x ${statusClass(p.paymentStatus)}`}
                      >
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-head" style={{ borderTop: '1px solid var(--line)', borderBottom: 0 }}>
          <span className="muted fine">
            {total === 0
              ? 'No results'
              : `Showing ${num(rangeStart)}–${num(rangeEnd)} of ${num(total)}`}
          </span>
          <div className="tools">
            <button
              type="button"
              className="btn-x ghost sm"
              onClick={() => fetchPayments(status, page - 1)}
              disabled={loading || page <= 1}
            >
              Previous
            </button>
            <span className="muted fine">
              Page {num(page)} of {num(lastPage)}
            </span>
            <button
              type="button"
              className="btn-x ghost sm"
              onClick={() => fetchPayments(status, page + 1)}
              disabled={loading || page >= lastPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
