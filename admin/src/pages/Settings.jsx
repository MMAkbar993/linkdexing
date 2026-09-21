import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { authUrl } from '../api/endpoints';

const Settings = () => {
  const [costPerIndexCheck, setCostPerIndexCheck] = useState('');
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState('');
  const [rateLimitPerDay, setRateLimitPerDay] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(false);
  const [savingApi, setSavingApi] = useState(false);

  useEffect(() => {
    privateApi
      .get(`${authUrl}/settings`)
      .then((res) => {
        setCostPerIndexCheck(String(res.data.settings.costPerIndexCheck));
        setRateLimitPerMinute(String(res.data.settings.apiRateLimitPerMinute));
        setRateLimitPerDay(String(res.data.settings.apiRateLimitPerDay));
      })
      .catch((err) =>
        toast.error(err.response?.data?.message || 'Could not load settings')
      )
      .finally(() => setLoading(false));
  }, []);

  const saveIndexCost = async (e) => {
    e.preventDefault();
    const value = Number(costPerIndexCheck);

    if (!Number.isFinite(value) || value < 0) {
      toast.error('Enter a non-negative number.');
      return;
    }

    setSavingIndex(true);
    try {
      const res = await privateApi.post(`${authUrl}/settings`, {
        costPerIndexCheck: value,
      });
      setCostPerIndexCheck(String(res.data.settings.costPerIndexCheck));
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save settings');
    } finally {
      setSavingIndex(false);
    }
  };

  const saveRateLimits = async (e) => {
    e.preventDefault();
    const perMinute = Number(rateLimitPerMinute);
    const perDay = Number(rateLimitPerDay);

    if (!Number.isInteger(perMinute) || perMinute < 1) {
      toast.error('Per-minute limit must be a whole number, at least 1.');
      return;
    }
    if (!Number.isInteger(perDay) || perDay < 1) {
      toast.error('Per-day limit must be a whole number, at least 1.');
      return;
    }

    setSavingApi(true);
    try {
      const res = await privateApi.post(`${authUrl}/settings`, {
        apiRateLimitPerMinute: perMinute,
        apiRateLimitPerDay: perDay,
      });
      setRateLimitPerMinute(String(res.data.settings.apiRateLimitPerMinute));
      setRateLimitPerDay(String(res.data.settings.apiRateLimitPerDay));
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save settings');
    } finally {
      setSavingApi(false);
    }
  };

  const perCredit =
    Number(costPerIndexCheck) > 0
      ? Math.round(1 / Number(costPerIndexCheck))
      : null;

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p>Pricing and other adjustable values.</p>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <h2>Index checker</h2>
        </div>
        <div className="card-body-x">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <form className="form-x" onSubmit={saveIndexCost}>
              <div className="field" style={{ maxWidth: 280 }}>
                <label htmlFor="cost">Credits per URL checked</label>
                <input
                  id="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  value={costPerIndexCheck}
                  onChange={(e) => setCostPerIndexCheck(e.target.value)}
                  disabled={savingIndex}
                />
                <p className="hint">
                  {perCredit
                    ? `${perCredit} URL check(s) per credit.`
                    : 'Set to 0 to make index checks free.'}
                </p>
              </div>

              <button type="submit" className="btn-x solid" disabled={savingIndex}>
                {savingIndex ? 'Saving…' : 'Save'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <h2>Developer API rate limits</h2>
        </div>
        <div className="card-body-x">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <form className="form-x" onSubmit={saveRateLimits}>
              <div className="field" style={{ maxWidth: 280 }}>
                <label htmlFor="perMinute">Requests per minute, per key</label>
                <input
                  id="perMinute"
                  type="number"
                  step="1"
                  min="1"
                  className="form-control"
                  value={rateLimitPerMinute}
                  onChange={(e) => setRateLimitPerMinute(e.target.value)}
                  disabled={savingApi}
                />
              </div>

              <div className="field" style={{ maxWidth: 280 }}>
                <label htmlFor="perDay">Requests per day, per key</label>
                <input
                  id="perDay"
                  type="number"
                  step="1"
                  min="1"
                  className="form-control"
                  value={rateLimitPerDay}
                  onChange={(e) => setRateLimitPerDay(e.target.value)}
                  disabled={savingApi}
                />
                <p className="hint">
                  Applies to every API key individually - one developer
                  hitting their limit doesn't affect anyone else's.
                </p>
              </div>

              <button type="submit" className="btn-x solid" disabled={savingApi}>
                {savingApi ? 'Saving…' : 'Save'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
