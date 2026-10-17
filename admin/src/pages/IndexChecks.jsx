import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { indexCheckUrl } from '../api/endpoints';

const PAGE_SIZE = 100;
const num = (n) => (n ?? 0).toLocaleString('en-US');

const STATUSES = ['pending', 'completed', 'failed'];

const SOURCE_LABELS = {
  archive: 'Links archive',
  standalone: 'Pasted / CSV',
};

const RESULT_LABELS = {
  indexed: { label: 'Indexed', cls: '' },
  not_indexed: { label: 'Not indexed', cls: 'bad' },
  pending: { label: 'Checking', cls: 'warn' },
  unmatched: { label: 'Could not verify', cls: 'warn' },
};

const dateTime = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

const statusClass = (status) =>
  status === 'completed' ? '' : status === 'pending' ? 'warn' : 'bad';

const customerLabel = (batch) =>
  batch.user ? batch.user.email : '(deleted user)';

function BatchModal({ batchId, onClose }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    privateApi
      .get(`${indexCheckUrl}/admin/batches/${batchId}`)
      .then((res) => {
        if (!cancelled) setData(res.data);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not load this check');
        onClose();
      });
    return () => {
      cancelled = true;
    };
  }, [batchId, onClose]);

  const batch = data?.batch;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-x wide" onClick={(e) => e.stopPropagation()}>
        {!batch ? (
          <p className="muted">Loading…</p>
        ) : (
          <>
            <h3>{customerLabel(batch)}</h3>
            <p className="modal-sub">
              {dateTime(batch.createdAt)} · {SOURCE_LABELS[batch.source] || batch.source}{' '}
              · {num(batch.totalUrls)} URL(s) · {num(batch.indexedCount)} indexed ·{' '}
              {num(batch.notIndexedCount)} not indexed · {num(batch.creditsCharged)} credits
            </p>

            {batch.errorMessage && (
              <p className="modal-sub" style={{ color: 'var(--red)' }}>
                {batch.errorMessage}
              </p>
            )}

            <div className="modal-scroll">
              <table className="table-x">
                <thead>
                  <tr>
                    <th scope="col">URL</th>
                    <th scope="col">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {data.checks.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="empty">
                        No URLs recorded for this check.
                      </td>
                    </tr>
                  ) : (
                    data.checks.map((c) => {
                      const r = RESULT_LABELS[c.result] || { label: c.result, cls: '' };
                      return (
                        <tr key={c._id}>
                          <td style={{ wordBreak: 'break-all' }}>{c.url}</td>
                          <td>
                            <span className={`badge-x ${r.cls}`}>{r.label}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="actions">
          <button type="button" className="btn-x ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const IndexChecks = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [openId, setOpenId] = useState(null);

  // Lets fetchBatches(page) keep the current filters without threading them
  // through every pagination button.
  const filtersRef = useRef({ status, query });
  filtersRef.current = { status, query };

  const fetchBatches = useCallback(async (p, overrides = {}) => {
    const { status: s, query: q } = { ...filtersRef.current, ...overrides };
    setLoading(true);
    try {
      const res = await privateApi.get(`${indexCheckUrl}/admin/batches`, {
        params: {
          page: p,
          limit: PAGE_SIZE,
          ...(s ? { status: s } : {}),
          ...(q ? { q } : {}),
        },
      });
      setBatches(res.data.batches);
      setTotal(res.data.total);
      setPage(p);
      setStatus(s);
      setQuery(q);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Something went wrong, please try again later'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatches(1);
  }, [fetchBatches]);

  const closeModal = useCallback(() => setOpenId(null), []);

  const onSearch = (e) => {
    e.preventDefault();
    fetchBatches(1, { query: searchInput.trim() });
  };

  const clearSearch = () => {
    setSearchInput('');
    fetchBatches(1, { query: '' });
  };

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Index checks</h1>
          <p>
            {query
              ? `${num(total)} check(s) by customers matching “${query}”`
              : `${num(total)} check(s), newest first`}
          </p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <form className="search-x" onSubmit={onSearch}>
            <input
              className="form-control"
              type="search"
              placeholder="Search by customer email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="btn-x solid" disabled={loading}>
              Search
            </button>
            {query && (
              <button
                type="button"
                className="btn-x ghost"
                onClick={clearSearch}
                disabled={loading}
              >
                Clear
              </button>
            )}
          </form>
          <select
            className="form-select"
            aria-label="Filter by status"
            value={status}
            onChange={(e) => fetchBatches(1, { status: e.target.value })}
            disabled={loading}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrap">
          <table className="table-x">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Customer</th>
                <th scope="col">Source</th>
                <th scope="col" className="num">
                  URLs
                </th>
                <th scope="col" className="num">
                  Indexed
                </th>
                <th scope="col" className="num">
                  Not indexed
                </th>
                <th scope="col" className="num">
                  Credits
                </th>
                <th scope="col">Status</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={9} className="empty">
                    {loading ? 'Loading…' : 'No index checks found.'}
                  </td>
                </tr>
              ) : (
                batches.map((b) => (
                  <tr key={b._id}>
                    <td className="muted">{dateTime(b.createdAt)}</td>
                    <td>{customerLabel(b)}</td>
                    <td className="muted">{SOURCE_LABELS[b.source] || b.source}</td>
                    <td className="num">{num(b.totalUrls)}</td>
                    <td className="num">{num(b.indexedCount)}</td>
                    <td className="num">{num(b.notIndexedCount)}</td>
                    <td className="num">{num(b.creditsCharged)}</td>
                    <td>
                      <span className={`badge-x ${statusClass(b.status)}`}>
                        {b.status}
                        {b.status === 'pending' && b.pendingCount
                          ? ` · ${num(b.pendingCount)} left`
                          : ''}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn-x ghost sm"
                          onClick={() => setOpenId(b._id)}
                        >
                          View URLs
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className="card-head"
          style={{ borderTop: '1px solid var(--line)', borderBottom: 0 }}
        >
          <span className="muted fine">
            {total === 0
              ? 'No results'
              : `Showing ${num(rangeStart)}–${num(rangeEnd)} of ${num(total)}`}
          </span>
          <div className="tools">
            <button
              type="button"
              className="btn-x ghost sm"
              onClick={() => fetchBatches(1)}
              disabled={loading || page <= 1}
            >
              First
            </button>
            <button
              type="button"
              className="btn-x ghost sm"
              onClick={() => fetchBatches(page - 1)}
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
              onClick={() => fetchBatches(page + 1)}
              disabled={loading || page >= lastPage}
            >
              Next
            </button>
            <button
              type="button"
              className="btn-x ghost sm"
              onClick={() => fetchBatches(lastPage)}
              disabled={loading || page >= lastPage}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {openId && <BatchModal batchId={openId} onClose={closeModal} />}
    </div>
  );
};

export default IndexChecks;
