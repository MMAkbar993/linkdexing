import { useEffect, useState } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { privateApi } from "../api";
import { devApiUrl } from "../api/endpoints";
import Sidebar from "../components/Sidebar";

const num = (n) => (n ?? 0).toLocaleString("en-US");

// The base URL a developer actually calls - same origin this app talks to,
// with the API's own path appended.
const API_BASE =
  (process.env.REACT_APP_BASE_URL || "https://api.linkdexing.com") +
  "/api/v1/dev/api";

function CodeBlock({ children }) {
  return (
    <pre
      className="p-3 rounded"
      style={{
        background: "#16202b",
        color: "#e5e8eb",
        fontSize: "0.82rem",
        overflowX: "auto",
        whiteSpace: "pre",
      }}
    >
      <code>{children}</code>
    </pre>
  );
}

const ENDPOINTS = [
  {
    method: "GET",
    path: "/me",
    summary: "Confirm your key works and see which account it belongs to.",
    curl: `curl ${API_BASE}/me \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "ok": true,
  "user": { "name": "Jane Doe", "email": "jane@agency.com" },
  "key": { "prefix": "lkdx_live_9a138450…", "createdAt": "2026-01-01T00:00:00.000Z" }
}`,
  },
  {
    method: "POST",
    path: "/submit",
    summary: "Submit URLs for indexing. Costs 1 credit per URL.",
    body: `{
  "urls": ["https://example.com/page-1", "https://example.com/page-2"],
  "dripfeed": 5
}`,
    curl: `curl -X POST ${API_BASE}/submit \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"urls":["https://example.com/page-1"],"dripfeed":5}'`,
    response: `{
  "ok": true,
  "submissionId": "6aa8454a2f4aee66d48f8903",
  "linksSubmitted": 1,
  "dripfeed": 5,
  "createdAt": "2026-01-01T00:00:00.000Z"
}`,
    note: `"dripfeed" is required, 1–30. A "priority" field is accepted for
      forward compatibility but has no effect yet.`,
  },
  {
    method: "GET",
    path: "/submissions/:id",
    summary: "Status of one submission, and each link's index status.",
    curl: `curl ${API_BASE}/submissions/6aa8454a2f4aee66d48f8903 \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "ok": true,
  "submissionId": "6aa8454a2f4aee66d48f8903",
  "dripfeed": 5,
  "isProcessed": false,
  "links": [
    { "url": "https://example.com/page-1", "processed": false, "indexStatus": "not_checked" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/archive",
    summary: "Every submission on your account, newest first. Paginated.",
    curl: `curl "${API_BASE}/archive?page=1&limit=50" \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "ok": true, "page": 1, "limit": 50, "total": 3,
  "submissions": [
    { "submissionId": "...", "dripfeed": 5, "isProcessed": false, "linkCount": 12 }
  ]
}`,
  },
  {
    method: "GET",
    path: "/credits",
    summary: "Current credit balance.",
    curl: `curl ${API_BASE}/credits \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{ "ok": true, "balance": 842.5 }`,
  },
  {
    method: "POST",
    path: "/index-check",
    summary: "Check whether any URL is indexed by Google. Costs 0.1 credit per URL by default.",
    body: `{ "urls": ["https://example.com/page-1"] }`,
    curl: `curl -X POST ${API_BASE}/index-check \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"urls":["https://example.com/page-1"]}'`,
    response: `{
  "ok": true,
  "batchId": "6aa845512f4aee66d48f8926",
  "totalUrls": 1,
  "creditsCharged": 0.1,
  "status": "pending"
}`,
    note: `Checking is asynchronous - poll GET /index-check/:batchId below for results.`,
  },
  {
    method: "GET",
    path: "/index-check/:id",
    summary: "Results of a check started with POST /index-check.",
    curl: `curl ${API_BASE}/index-check/6aa845512f4aee66d48f8926 \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "ok": true,
  "batchId": "6aa845512f4aee66d48f8926",
  "status": "completed",
  "totalUrls": 1,
  "indexed": 1,
  "notIndexed": 0,
  "pending": 0,
  "results": [
    { "url": "https://example.com/page-1", "result": "indexed" }
  ]
}`,
  },
  {
    method: "GET",
    path: "/usage",
    summary: "Requests and credits used over the last 30 days.",
    curl: `curl ${API_BASE}/usage \\\n  -H "Authorization: Bearer YOUR_API_KEY"`,
    response: `{
  "ok": true,
  "requestsLast30Days": 214,
  "creditsUsedLast30Days": 340,
  "creditsRemaining": 842.5
}`,
  },
];

const SNIPPETS = {
  curl: `curl -X POST ${API_BASE}/submit \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"urls":["https://example.com/page-1"],"dripfeed":5}'`,
  node: `const res = await fetch("${API_BASE}/submit", {
  method: "POST",
  headers: {
    Authorization: "Bearer YOUR_API_KEY",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ urls: ["https://example.com/page-1"], dripfeed: 5 }),
});
const data = await res.json();`,
  python: `import requests

res = requests.post(
    "${API_BASE}/submit",
    headers={"Authorization": "Bearer YOUR_API_KEY"},
    json={"urls": ["https://example.com/page-1"], "dripfeed": 5},
)
data = res.json()`,
  php: `<?php
$ch = curl_init("${API_BASE}/submit");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Authorization: Bearer YOUR_API_KEY",
        "Content-Type: application/json",
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "urls" => ["https://example.com/page-1"],
        "dripfeed" => 5,
    ]),
]);
$data = json_decode(curl_exec($ch), true);`,
};

export default function DeveloperApiPage() {
  const [keyInfo, setKeyInfo] = useState(null); // { keyPrefix, createdAt, lastUsedAt } | null
  const [newKey, setNewKey] = useState(null); // the raw key, shown exactly once
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [lang, setLang] = useState("curl");

  const load = async () => {
    try {
      const [keyRes, usageRes] = await Promise.all([
        privateApi.get(`${devApiUrl}/keys`),
        privateApi.get(`${devApiUrl}/usage`),
      ]);
      setKeyInfo(keyRes.data.key);
      setUsage(usageRes.data);
    } catch (err) {
      toast.error("Could not load your API details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = async () => {
    const verb = keyInfo ? "Regenerate" : "Generate";
    if (
      keyInfo &&
      !window.confirm(
        "This immediately revokes your current key - anything using it will stop working. Continue?"
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await privateApi.post(`${devApiUrl}/keys/generate`);
      setNewKey(res.data.key);
      toast.success(`${verb}d your API key.`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not generate a key.");
    } finally {
      setBusy(false);
    }
  };

  const revoke = async () => {
    if (!window.confirm("Revoke your API key? Anything using it will stop working immediately.")) {
      return;
    }
    setBusy(true);
    try {
      await privateApi.delete(`${devApiUrl}/keys`);
      setKeyInfo(null);
      setNewKey(null);
      toast.success("API key revoked.");
    } catch (err) {
      toast.error("Could not revoke the key.");
    } finally {
      setBusy(false);
    }
  };

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    toast.info("Copied.");
  };

  return (
    <div className="container mt-2" style={{ minHeight: "80vh" }}>
      <div className="row">
        <div className="col-sm-12 col-md-9">
          <h2 className="mt-4">Developer API</h2>
          <p className="text-muted">
            Automate submissions and index checks from your own systems.
          </p>

          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Your API key</h5>

              {loading ? (
                <p className="text-muted mb-0">Loading…</p>
              ) : (
                <>
                  {newKey && (
                    <div className="alert alert-success">
                      <strong>Copy this now — it won't be shown again.</strong>
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <code style={{ wordBreak: "break-all" }}>{newKey}</code>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success ms-2"
                          onClick={() => copy(newKey)}
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}

                  {keyInfo ? (
                    <>
                      <p className="mb-1">
                        Active key: <code>{keyInfo.keyPrefix}</code>
                      </p>
                      <p className="text-muted small mb-3">
                        Created {moment(keyInfo.createdAt).format("DD MMM YYYY")}
                        {keyInfo.lastUsedAt &&
                          ` · last used ${moment(keyInfo.lastUsedAt).fromNow()}`}
                      </p>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm me-2"
                        onClick={generate}
                        disabled={busy}
                      >
                        Regenerate
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={revoke}
                        disabled={busy}
                      >
                        Revoke
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-muted">
                        You don't have an API key yet.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={generate}
                        disabled={busy}
                      >
                        {busy ? "Generating…" : "Generate API key"}
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {usage && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Usage (last 30 days)</h5>
                <div className="row text-center">
                  <div className="col-4">
                    <div style={{ fontSize: "1.6rem", fontWeight: 600 }}>
                      {num(usage.requestsLast30Days)}
                    </div>
                    <div className="text-muted small">API requests</div>
                  </div>
                  <div className="col-4">
                    <div style={{ fontSize: "1.6rem", fontWeight: 600 }}>
                      {num(usage.creditsUsedLast30Days)}
                    </div>
                    <div className="text-muted small">Credits used</div>
                  </div>
                  <div className="col-4">
                    <div style={{ fontSize: "1.6rem", fontWeight: 600 }}>
                      {num(usage.creditBalance)}
                    </div>
                    <div className="text-muted small">Credits remaining</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Documentation</h5>

              <p>
                Base URL: <code>{API_BASE}</code>
              </p>
              <p>
                Authenticate every request with your key, either as a Bearer
                token or an API key header:
              </p>
              <ul>
                <li>
                  <code>Authorization: Bearer YOUR_API_KEY</code>
                </li>
                <li>
                  <code>X-API-Key: YOUR_API_KEY</code>
                </li>
              </ul>
              <p className="text-muted small">
                Rate limits and error format: every response is JSON with an{" "}
                <code>ok</code> boolean. A missing or invalid key returns{" "}
                <code>401</code>. Exceeding your rate limit returns{" "}
                <code>429</code> with the current limit in the message.
                Limits are set by Linkdexing and may change.
              </p>

              <h6 className="mt-4 mb-2">Quick start</h6>
              <div className="btn-group mb-2" role="group">
                {Object.keys(SNIPPETS).map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn btn-sm ${
                      lang === key ? "btn-primary" : "btn-outline-secondary"
                    }`}
                    onClick={() => setLang(key)}
                  >
                    {key === "curl" ? "cURL" : key[0].toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
              <CodeBlock>{SNIPPETS[lang]}</CodeBlock>

              <h6 className="mt-4 mb-3">Endpoints</h6>
              {ENDPOINTS.map((ep) => (
                <div key={ep.path} className="mb-4 pb-3 border-bottom">
                  <p className="mb-1">
                    <span className="badge bg-secondary me-2">{ep.method}</span>
                    <code>{ep.path}</code>
                  </p>
                  <p className="text-muted small mb-2">{ep.summary}</p>
                  {ep.body && (
                    <>
                      <div className="text-muted small mb-1">Request body</div>
                      <CodeBlock>{ep.body}</CodeBlock>
                    </>
                  )}
                  <div className="text-muted small mb-1 mt-2">Example</div>
                  <CodeBlock>{ep.curl}</CodeBlock>
                  <div className="text-muted small mb-1 mt-2">Response</div>
                  <CodeBlock>{ep.response}</CodeBlock>
                  {ep.note && <p className="text-muted small mt-2">{ep.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
