import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { orderUrl } from '../api/endpoints';

const num = (n) => (n ?? 0).toLocaleString('en-US');

// YYYY-MM-DD for today, matching what an <input type="date"> gives back -
// and what the backend expects (UTC day boundaries).
const todayIso = () => new Date().toISOString().slice(0, 10);

const dateLabel = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const Submissions = () => {
  const [date, setDate] = useState(todayIso());
  const [submissions, setSubmissions] = useState([]);
  const [totalLinks, setTotalLinks] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchDay = useCallback(async (d) => {
    setLoading(true);
    try {
      const res = (await privateApi.get(`${orderUrl}/by-date/${d}`)).data;
      setSubmissions(res.submissions);
      setTotalLinks(res.totalLinks);
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
    fetchDay(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shift = (days) => {
    const d = new Date(`${date}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    const next = d.toISOString().slice(0, 10);
    setDate(next);
    fetchDay(next);
  };

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Submissions</h1>
          <p>Who submitted links, how many, and over how many drip-feed days.</p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <div className="toolbar">
            <div className="field">
              <label htmlFor="date">Date</label>
              <input
                id="date"
                type="date"
                className="form-control"
                value={date}
                max={todayIso()}
                onChange={(e) => {
                  setDate(e.target.value);
                  fetchDay(e.target.value);
                }}
                disabled={loading}
              />
            </div>
          </div>
          <div className="tools">
            <button
              type="button"
              className="btn-x ghost sm"
              onClick={() => shift(-1)}
              disabled={loading}
            >
              ← Previous day
            </button>
            <button
              type="button"
              className="btn-x ghost sm"
              onClick={() => shift(1)}
              disabled={loading || date >= todayIso()}
            >
              Next day →
            </button>
          </div>
        </div>

        <div className="card-body-x" style={{ paddingBottom: 0 }}>
          <p className="muted fine" style={{ margin: '0 0 4px' }}>
            {dateLabel(date)} (UTC)
          </p>
          <p style={{ margin: '0 0 16px', fontSize: 15 }}>
            {submissions.length === 0
              ? loading
                ? 'Loading…'
                : 'No submissions this day.'
              : `${num(submissions.length)} submission(s), ${num(totalLinks)} links total`}
          </p>
        </div>

        <div className="table-wrap">
          <table className="table-x">
            <thead>
              <tr>
                <th scope="col">User</th>
                <th scope="col" className="num">
                  Links
                </th>
                <th scope="col" className="num">
                  Drip-feed
                </th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty">
                    {loading ? 'Loading…' : 'No submissions this day.'}
                  </td>
                </tr>
              ) : (
                submissions.map((s) => (
                  <tr key={s.orderId}>
                    <td>
                      {s.user ? (
                        <>
                          {s.user.name}
                          <br />
                          <span className="muted fine">{s.user.email}</span>
                        </>
                      ) : (
                        <span className="muted">Deleted user</span>
                      )}
                    </td>
                    <td className="num">{num(s.linkCount)}</td>
                    <td className="num">
                      {s.dripfeed} day{s.dripfeed === 1 ? '' : 's'}
                    </td>
                    <td>
                      {s.isProcessed ? (
                        <span className="badge-x">Processed</span>
                      ) : (
                        <span className="badge-x warn">Pending</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Submissions;
