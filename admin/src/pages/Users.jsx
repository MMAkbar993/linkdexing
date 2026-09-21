import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { userUrl } from '../api/endpoints';
import { Icon } from '../components/Icon';

// Rows at or above this many submitted links are highlighted.
const HEAVY_USER_LINKS = 10000;
const PAGE_SIZE = 200;
const num = (n) => (n ?? 0).toLocaleString('en-US');

// "Add credits" modal — also handles deducting, via a negative amount, for
// correcting a mistaken add.
function AddCreditsModal({ user, onClose, onDone }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { amount: '', reason: '' } });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async ({ amount, reason }) => {
    setSubmitting(true);
    try {
      const res = await privateApi.post(`${userUrl}/credits/adjust/${user._id}`, {
        amount: Number(amount),
        reason: reason || undefined,
      });
      toast.success(
        `${user.name}'s balance is now ${num(res.data.balance)} credits`
      );
      onDone();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update credits');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-x" onClick={(e) => e.stopPropagation()}>
        <h3>Add credits</h3>
        <p className="modal-sub">
          {user.name} — currently {num(user.creditBalance)} credits
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="field">
            <label htmlFor="amount">Amount</label>
            <input
              id="amount"
              type="number"
              className="form-control"
              placeholder="e.g. 200"
              autoFocus
              disabled={submitting}
              {...register('amount', {
                required: true,
                validate: (v) => Number.isInteger(Number(v)) && Number(v) !== 0,
              })}
            />
            {errors?.amount && (
              <span className="error">Enter a whole number, not zero.</span>
            )}
            <p className="hint">
              Use a negative number (e.g. -50) to correct a mistaken add.
            </p>
          </div>

          <div className="field">
            <label htmlFor="reason">Reason (optional)</label>
            <input
              id="reason"
              type="text"
              className="form-control"
              placeholder="e.g. PayPal payment received manually"
              disabled={submitting}
              {...register('reason')}
            />
          </div>

          <div className="actions">
            <button
              type="button"
              className="btn-x ghost"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button type="submit" className="btn-x solid" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const Users = () => {
  const { register, handleSubmit, reset } = useForm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [creditsTarget, setCreditsTarget] = useState(null);

  const fetchUsers = useCallback(async (q, p) => {
    setLoading(true);
    try {
      const { users, total } = (
        await privateApi.get(`${userUrl}/search`, {
          params: { ...(q ? { q } : {}), page: p, limit: PAGE_SIZE },
        })
      ).data;
      setUsers(users);
      setTotal(total);
      setQuery(q || '');
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
    fetchUsers(undefined, 1);
  }, [fetchUsers]);

  const onSearch = ({ search }) => fetchUsers(search.trim(), 1);

  const handleViewAll = () => {
    reset({ search: '' });
    fetchUsers(undefined, 1);
  };

  const handleRestrict = async (user) => {
    const option = !user.isRestrict;
    try {
      await privateApi.post(`${userUrl}/restrict/${user._id}`, { option });
      toast.success(option ? 'User restricted' : 'Restriction removed');
      fetchUsers(query, page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update user');
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Delete ${user.name} (${user.email})? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await privateApi.delete(`${userUrl}/delete/${user.email}`);
      toast.success('User deleted');
      fetchUsers(query, page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not delete user');
    }
  };

  const lastPage = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>
            {query
              ? `${num(total)} result(s) for “${query}”`
              : `${num(total)} accounts`}
          </p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <form className="search-x" onSubmit={handleSubmit(onSearch)}>
            <input
              className="form-control"
              type="search"
              placeholder="Search by name or email"
              {...register('search', { required: true })}
            />
            <button type="submit" className="btn-x solid" disabled={loading}>
              <Icon name="search" />
              Search
            </button>
            <button
              type="button"
              className="btn-x ghost"
              onClick={handleViewAll}
              disabled={loading}
            >
              View all
            </button>
          </form>
        </div>

        <div className="table-wrap">
          <table className="table-x">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col" className="num">
                  Links purchased
                </th>
                <th scope="col" className="num">
                  Links used
                </th>
                <th scope="col" className="num">
                  Balance
                </th>
                <th scope="col">Status</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty">
                    {loading ? 'Loading…' : 'No users found.'}
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className={
                      user.totalLinks >= HEAVY_USER_LINKS ? 'is-heavy' : undefined
                    }
                  >
                    <td>{user.name}</td>
                    <td className="muted">{user.email}</td>
                    <td className="num">{num(user.creditsPurchased)}</td>
                    <td className="num">{num(user.totalLinks)}</td>
                    <td className="num">{num(user.creditBalance)}</td>
                    <td>
                      {user.isRestrict ? (
                        <span className="badge-x warn">Restricted</span>
                      ) : (
                        <span className="badge-x">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button
                          type="button"
                          className="btn-x solid sm"
                          onClick={() => setCreditsTarget(user)}
                        >
                          Add credits
                        </button>
                        <button
                          type="button"
                          className="btn-x ghost sm"
                          onClick={() => handleRestrict(user)}
                        >
                          {user.isRestrict ? 'Unrestrict' : 'Restrict'}
                        </button>
                        <button
                          type="button"
                          className="btn-x danger sm"
                          onClick={() => handleDelete(user)}
                        >
                          Delete
                        </button>
                      </div>
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
              onClick={() => fetchUsers(query, page - 1)}
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
              onClick={() => fetchUsers(query, page + 1)}
              disabled={loading || page >= lastPage}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <p className="muted fine" style={{ marginTop: 12 }}>
        Highlighted rows have submitted {num(HEAVY_USER_LINKS)} or more links.
      </p>

      {creditsTarget && (
        <AddCreditsModal
          user={creditsTarget}
          onClose={() => setCreditsTarget(null)}
          onDone={() => {
            setCreditsTarget(null);
            fetchUsers(query, page);
          }}
        />
      )}
    </div>
  );
};

export default Users;
