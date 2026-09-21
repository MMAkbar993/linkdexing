import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { privateApi } from "../api";
import { indexCheckUrl, orderUrl } from "../api/endpoints";

import Sidebar from "../components/Sidebar";

const num = (n) => (n ?? 0).toLocaleString("en-US");
const REFRESH_MS = 30000;

// Links-Archive
export default function LinksArchivePage() {
  const [orders, setOrders] = useState([]);
  // orderId -> the most recent index-check batch for that order
  const [checks, setChecks] = useState({});
  const [costPerCheck, setCostPerCheck] = useState(null);
  const [busyOrderId, setBusyOrderId] = useState(null);

  const fetchChecks = useCallback(async (orderList) => {
    const entries = await Promise.all(
      orderList.map(async (order) => {
        try {
          const res = await privateApi.get(
            `${indexCheckUrl}/for-order/${order._id}`
          );
          return [order._id, res.data.batch];
        } catch (err) {
          return [order._id, null];
        }
      })
    );
    setChecks(Object.fromEntries(entries));
  }, []);

  const fetchData = useCallback(async () => {
    // Get Order History for user
    const { orders } = (await privateApi.get(orderUrl)).data;

    orders.forEach((order) => {
      order.isProcessed = moment(order.createdAt)
        .add({ days: order.dripfeed })
        .isBefore(Date.now());

      order.linkCount = (order.links || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean).length;
      order.createdAtLabel = moment(order.createdAt).format("DD-MM-yy");
    });

    setOrders(orders);
    fetchChecks(orders);
  }, [fetchChecks]);

  useEffect(() => {
    fetchData();
    privateApi
      .get(`${indexCheckUrl}/estimate?count=0`)
      .then((res) => setCostPerCheck(res.data.costPerIndexCheck))
      .catch(() => {});
  }, [fetchData]);

  // Refresh while any check is still running.
  useEffect(() => {
    const anyPending = Object.values(checks).some(
      (b) => b && b.status === "pending"
    );
    if (!anyPending) return undefined;
    const id = setInterval(() => fetchChecks(orders), REFRESH_MS);
    return () => clearInterval(id);
  }, [checks, orders, fetchChecks]);

  const runCheck = async (order) => {
    const cost =
      costPerCheck === null
        ? null
        : Math.round(order.linkCount * costPerCheck * 100) / 100;

    if (
      !window.confirm(
        `Check the index status of ${num(order.linkCount)} link(s)?` +
          (cost !== null ? ` This will use ${cost} credit(s).` : "")
      )
    ) {
      return;
    }

    setBusyOrderId(order._id);
    try {
      await privateApi.post(`${indexCheckUrl}/order/${order._id}`);
      toast.success("Index check started. Results appear here as they come in.");
      fetchChecks(orders);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not start the index check."
      );
    } finally {
      setBusyOrderId(null);
    }
  };

  const renderIndexStatus = (order) => {
    const batch = checks[order._id];

    if (!batch) return <span className="text-muted">Not checked</span>;

    if (batch.status === "pending") {
      return (
        <span className="badge bg-warning text-dark">
          Checking… ({num(batch.pendingCount)} left)
        </span>
      );
    }

    if (batch.status === "failed") {
      return (
        <span className="badge bg-danger" title={batch.errorMessage || ""}>
          Failed
        </span>
      );
    }

    const pct =
      batch.totalUrls > 0
        ? Math.round((batch.indexedCount / batch.totalUrls) * 100)
        : 0;

    return (
      <span>
        <strong>{pct}%</strong> indexed
        <br />
        <small className="text-muted">
          {num(batch.indexedCount)} of {num(batch.totalUrls)}
        </small>
      </span>
    );
  };

  return (
    <div className="container mt-2">
      <div className="row">
        <div className="col-sm-12 col-md-9">
          <h2>Links Archive</h2>

          <table className="table table-hover table-responsive">
            <thead>
              <tr>
                <th scope="col">Dripfeed</th>
                <th scope="col">Number of links</th>
                <th scope="col">Links</th>
                <th scope="col">Created at</th>
                <th scope="col">Progress</th>
                <th scope="col">Index status</th>
                <th scope="col" />
              </tr>
            </thead>
            <tbody style={{ whiteSpace: "pre-wrap" }}>
              {React.Children.toArray(
                orders.map((order) => (
                  <tr className={order.isProcessed ? "table-success" : null}>
                    <td>{order.dripfeed}</td>
                    <td>{num(order.linkCount)}</td>
                    <td>
                      {order.linkCount > 0 ? (
                        <Link target="_blank" to={`/order/${order._id}`}>
                          View links
                        </Link>
                      ) : (
                        "None"
                      )}
                    </td>
                    <td>{order.createdAtLabel}</td>
                    <td>{order.isProcessed ? "Done" : "Processing"}</td>
                    <td>{renderIndexStatus(order)}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => runCheck(order)}
                        disabled={
                          busyOrderId === order._id ||
                          order.linkCount === 0 ||
                          checks[order._id]?.status === "pending"
                        }
                      >
                        {busyOrderId === order._id
                          ? "Starting…"
                          : checks[order._id]
                          ? "Re-check"
                          : "Check index"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
