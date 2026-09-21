import { useCallback, useEffect, useRef, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { privateApi } from "../api";
import { indexCheckUrl } from "../api/endpoints";
import { parseUrlsFromText, readCsvFile } from "../utils/csv";
import Sidebar from "../components/Sidebar";

const num = (n) => (n ?? 0).toLocaleString("en-US");

// Batches sit at "pending" while IndexChecker.link works through them, so
// the list refreshes itself while anything is still running.
const REFRESH_MS = 30000;

export default function IndexCheckerPage() {
  const [text, setText] = useState("");
  const [batches, setBatches] = useState([]);
  const [costPerCheck, setCostPerCheck] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [openBatch, setOpenBatch] = useState(null);
  const [openChecks, setOpenChecks] = useState([]);
  const fileRef = useRef(null);

  const parsed = parseUrlsFromText(text);
  const urlCount = parsed.urls.length;
  const estimatedCost =
    costPerCheck === null
      ? null
      : Math.round(urlCount * costPerCheck * 100) / 100;

  const fetchBatches = useCallback(async () => {
    try {
      const res = await privateApi.get(`${indexCheckUrl}/mine`);
      setBatches(res.data.batches);
    } catch (err) {
      // Non-fatal — the form still works without the history list.
    }
  }, []);

  useEffect(() => {
    privateApi
      .get(`${indexCheckUrl}/estimate?count=0`)
      .then((res) => setCostPerCheck(res.data.costPerIndexCheck))
      .catch(() => {});
    fetchBatches();
  }, [fetchBatches]);

  // Keep polling while any batch is still being processed.
  useEffect(() => {
    if (!batches.some((b) => b.status === "pending")) return undefined;
    const id = setInterval(fetchBatches, REFRESH_MS);
    return () => clearInterval(id);
  }, [batches, fetchBatches]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await readCsvFile(file);
      if (result.urls.length === 0) {
        toast.error("No valid URLs found in that file.");
        return;
      }
      setText((prev) =>
        prev.trim() ? `${prev.trim()}\n${result.urls.join("\n")}` : result.urls.join("\n")
      );
      toast.success(
        `Loaded ${num(result.urls.length)} URL(s)${
          result.skipped ? `, skipped ${num(result.skipped)} non-URL row(s)` : ""
        }`
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (urlCount === 0) {
      toast.error("Add at least one URL to check.");
      return;
    }

    setSubmitting(true);
    try {
      await privateApi.post(`${indexCheckUrl}/standalone`, { urls: parsed.urls });
      toast.success(
        `Checking ${num(urlCount)} URL(s). Results appear below as they come in.`
      );
      setText("");
      fetchBatches();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not start the index check."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const viewBatch = async (batch) => {
    if (openBatch === batch._id) {
      setOpenBatch(null);
      setOpenChecks([]);
      return;
    }
    try {
      const res = await privateApi.get(`${indexCheckUrl}/${batch._id}`);
      setOpenBatch(batch._id);
      setOpenChecks(res.data.checks);
    } catch (err) {
      toast.error("Could not load those results.");
    }
  };

  return (
    <div className='container mt-2' style={{ minHeight: "80vh" }}>
      <div className='row'>
        <div className='col-sm-12 col-md-9'>
          <h2 className='mt-4'>Index Checker</h2>
          <p className='text-muted'>
            Check whether any URL is indexed by Google — not just links you
            submitted here.
            {costPerCheck !== null && (
              <>
                {" "}
                Costs {costPerCheck} credit per URL
                {costPerCheck > 0 && ` (${Math.round(1 / costPerCheck)} checks per credit)`}.
              </>
            )}
          </p>

          <div className='card mb-4'>
            <div className='card-body'>
              <form onSubmit={onSubmit}>
                <div className='mb-3'>
                  <label className='form-label'>
                    Paste URLs — one per line
                  </label>
                  <textarea
                    className='form-control'
                    rows={10}
                    value={text}
                    disabled={submitting}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={"https://example.com/page-1\nhttps://example.com/page-2"}
                  />
                </div>

                <div className='d-flex align-items-center flex-wrap gap-2 mb-3'>
                  <input
                    ref={fileRef}
                    type='file'
                    accept='.csv,.txt'
                    onChange={handleFile}
                    style={{ display: "none" }}
                  />
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    onClick={() => fileRef.current?.click()}
                    disabled={submitting}
                  >
                    Upload CSV
                  </button>
                  <span className='text-muted ms-2'>
                    {num(urlCount)} URL(s)
                    {parsed.duplicates > 0 &&
                      ` · ${num(parsed.duplicates)} duplicate(s) removed`}
                    {estimatedCost !== null && urlCount > 0 && (
                      <> · costs {estimatedCost} credit(s)</>
                    )}
                  </span>
                </div>

                <button
                  type='submit'
                  className='btn btn-primary btn-lg'
                  disabled={submitting || urlCount === 0}
                >
                  {submitting ? "Starting check…" : "Check indexing"}
                </button>
              </form>
            </div>
          </div>

          <h4>Your checks</h4>
          {batches.length === 0 ? (
            <p className='text-muted'>No index checks yet.</p>
          ) : (
            <table className='table table-hover'>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>URLs</th>
                  <th>Indexed</th>
                  <th>Not indexed</th>
                  <th>% Indexed</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b._id}>
                    <td>{moment(b.createdAt).format("DD-MM-YY HH:mm")}</td>
                    <td>
                      {b.source === "archive" ? "Link Archive" : "Standalone"}
                    </td>
                    <td>{num(b.totalUrls)}</td>
                    <td>{num(b.indexedCount)}</td>
                    <td>{num(b.notIndexedCount)}</td>
                    <td>
                      {b.totalUrls > 0
                        ? `${Math.round((b.indexedCount / b.totalUrls) * 100)}%`
                        : "—"}
                    </td>
                    <td>
                      {b.status === "completed" && (
                        <span className='badge bg-success'>Done</span>
                      )}
                      {b.status === "pending" && (
                        <span className='badge bg-warning text-dark'>
                          Checking… ({num(b.pendingCount)} left)
                        </span>
                      )}
                      {b.status === "failed" && (
                        <span
                          className='badge bg-danger'
                          title={b.errorMessage || ""}
                        >
                          Failed
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        type='button'
                        className='btn btn-sm btn-outline-primary'
                        onClick={() => viewBatch(b)}
                      >
                        {openBatch === b._id ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {openBatch && (
            <div className='card mb-4'>
              <div className='card-body'>
                <h5>Results</h5>
                <table className='table table-sm'>
                  <tbody>
                    {openChecks.map((c) => (
                      <tr key={c._id}>
                        <td style={{ wordBreak: "break-all" }}>{c.url}</td>
                        <td style={{ width: 140 }}>
                          {c.result === "indexed" && (
                            <span className='badge bg-success'>Indexed</span>
                          )}
                          {c.result === "not_indexed" && (
                            <span className='badge bg-secondary'>
                              Not indexed
                            </span>
                          )}
                          {c.result === "pending" && (
                            <span className='badge bg-warning text-dark'>
                              Checking…
                            </span>
                          )}
                          {c.result === "unmatched" && (
                            <span
                              className='badge bg-secondary'
                              title="IndexChecker.link couldn't confirm a result for this exact URL."
                            >
                              Could not verify
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
