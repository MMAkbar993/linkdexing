import React, { useCallback, useEffect, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { privateApi } from '../api';
import { orderUrl } from '../api/endpoints';
import { Icon } from '../components/Icon';

const DRIPFEED_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const num = (n) => n.toLocaleString('en-US');

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [links, setLinks] = useState([]);
  const [dripfeed, setDripfeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const fetchOrders = useCallback(async (day) => {
    setLoading(true);
    try {
      const { orders } = (await privateApi.get(`${orderUrl}/dripfeed/${day}`))
        .data;
      setOrders(orders);
      setLinks(orders.map((order) => order.links.split('\n')).flat());
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Something went wrong, please try again later.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(dripfeed);
  }, [dripfeed, fetchOrders]);

  const handleProcess = async () => {
    const orderIds = orders.map((order) => order._id);
    if (orderIds.length === 0) {
      return toast.info('No links to process');
    }
    if (
      !window.confirm(
        `Mark ${num(orderIds.length)} order(s) with ${num(
          links.length
        )} links as processed?`
      )
    ) {
      return;
    }

    setProcessing(true);
    try {
      await privateApi.post(`${orderUrl}/process`, { orderIds });
      setLinks([]);
      setOrders([]);
      toast.success('Links processed');
    } catch (err) {
      toast.error(
        err.response?.data?.err ||
          err.response?.data?.message ||
          'Something went wrong, please try again later.'
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="wrap">
      <div className="page-head">
        <div>
          <h1>Process links</h1>
          <p>
            Pick a drip-feed day, copy the pending links, then mark the orders
            as processed.
          </p>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-x">
          <b>{num(orders.length)}</b>
          <span>Pending orders</span>
        </div>
        <div className="stat-x">
          <b>{num(links.length)}</b>
          <span>Links to submit</span>
        </div>
        <div className="stat-x">
          <b>{dripfeed}</b>
          <span>Drip-feed day</span>
        </div>
      </div>

      <div className="card-x">
        <div className="card-head">
          <div className="toolbar">
            <div className="field">
              <label htmlFor="dripfeed">Drip-feed day</label>
              <select
                id="dripfeed"
                className="form-select"
                value={dripfeed}
                onChange={(e) => setDripfeed(Number(e.target.value))}
                disabled={loading}
              >
                {DRIPFEED_DAYS.map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="tools">
            <button
              type="button"
              className="btn-x ghost"
              onClick={() => fetchOrders(dripfeed)}
              disabled={loading}
            >
              <Icon name="refresh" />
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <CopyToClipboard
              text={links.join('\n')}
              onCopy={() => toast.info(`${num(links.length)} links copied`)}
            >
              <button
                type="button"
                className="btn-x ghost"
                disabled={links.length === 0}
              >
                <Icon name="copy" />
                Copy links
              </button>
            </CopyToClipboard>
            <button
              type="button"
              className="btn-x solid"
              onClick={handleProcess}
              disabled={processing || orders.length === 0}
            >
              <Icon name="check" />
              {processing ? 'Processing…' : 'Mark processed'}
            </button>
          </div>
        </div>

        <div className="card-body-x">
          <div className="links-box">
            {links.length === 0 ? (
              <div className="empty">
                {loading
                  ? 'Loading…'
                  : `No pending links for drip-feed day ${dripfeed}.`}
              </div>
            ) : (
              React.Children.toArray(
                links.map((link) => <div className="ln">{link}</div>)
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
