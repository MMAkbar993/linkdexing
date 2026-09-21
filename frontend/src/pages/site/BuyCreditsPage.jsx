import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import PageIntro from "../../components/site/PageIntro";
import { Icon } from "../../components/Icon";
import { privateApi } from "../../api";
import { authUrl, paymentUrl, couponUrl } from "../../api/endpoints";
import { checkout, packages, pricing } from "../../content/site";

const money = (n) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });
const num = (n) => n.toLocaleString("en-US");

const TX_LABELS = {
  purchase: "Purchase",
  link_submission: "Links submitted",
  admin_adjustment: "Manual adjustment",
  refund: "Refund",
  index_check: "Index check",
  api_usage: "API usage",
  legacy_import: "Balance carried over",
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const PAYPAL_CLIENT_ID = process.env.REACT_APP_PAYPAL_CLIENT_ID;

// Loaded once and reused across mounts (e.g. navigating away and back).
let paypalSdkPromise = null;
function loadPayPalSdk() {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalSdkPromise) return paypalSdkPromise;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID
    )}&currency=USD&intent=capture`;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Failed to load the PayPal SDK"));
    document.body.appendChild(script);
  });

  return paypalSdkPromise;
}

export default function BuyCreditsPage({ user }) {
  const [selected, setSelected] = useState(packages[2].credits);
  const [balance, setBalance] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [sdkState, setSdkState] = useState("loading"); // loading | ready | failed
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(null); // { credits, balance }

  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState("idle"); // idle | checking | applied | error
  const [couponError, setCouponError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, originalPrice, discountAmount, finalPrice }

  const mountRef = useRef(null);
  const buttonsRef = useRef(null);
  // createOrder is called from inside the PayPal SDK's own closure, created
  // once below - it reads the selection through this ref so switching
  // packages doesn't require tearing down and re-rendering the buttons.
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  // Same reason: read the currently-applied coupon (if any) at the moment
  // PayPal calls createOrder, without needing to recreate the buttons.
  const appliedCouponRef = useRef(appliedCoupon);
  appliedCouponRef.current = appliedCoupon;

  const pack = useMemo(
    () => packages.find((p) => p.credits === selected),
    [selected]
  );
  const totalCredits = pack.credits + (pack.bonus || 0);

  // A coupon's discount was computed against the previously-selected
  // package's price - switching packages invalidates it, so it has to be
  // re-applied rather than silently carried over at the wrong amount.
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponStatus("idle");
    setCouponError("");
  }, [selected]);

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponStatus("checking");
    setCouponError("");
    try {
      const res = await privateApi.post(`${couponUrl}/validate`, {
        code: couponInput.trim(),
        credits: selected,
      });
      setAppliedCoupon(res.data);
      setCouponStatus("applied");
    } catch (err) {
      setAppliedCoupon(null);
      setCouponStatus("error");
      setCouponError(err.response?.data?.message || "Could not apply this coupon.");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponStatus("idle");
    setCouponError("");
    setCouponInput("");
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    privateApi
      .get(`${authUrl}/credits`)
      .then((res) => {
        if (cancelled) return;
        setBalance(res.data.balance);
        setTransactions(res.data.transactions || []);
      })
      .catch(() => {
        // Non-fatal - the balance pill and history just stay hidden.
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (!PAYPAL_CLIENT_ID) {
      setSdkState("failed");
      return;
    }

    let cancelled = false;

    loadPayPalSdk()
      .then((paypal) => {
        if (cancelled || !mountRef.current) return;

        const buttons = paypal.Buttons({
          style: { layout: "horizontal", height: 45, tagline: false },

          createOrder: async () => {
            setProcessing(true);
            try {
              const res = await privateApi.post(`${paymentUrl}/create-order`, {
                credits: selectedRef.current,
                couponCode: appliedCouponRef.current?.code,
              });
              return res.data.paypalOrderId;
            } catch (err) {
              toast.error(
                err.response?.data?.message || "Could not start checkout."
              );
              throw err;
            } finally {
              setProcessing(false);
            }
          },

          onApprove: async (data) => {
            setProcessing(true);
            try {
              const res = await privateApi.post(
                `${paymentUrl}/capture-order`,
                { paypalOrderId: data.orderID }
              );
              const finished = packages.find(
                (p) => p.credits === selectedRef.current
              );
              setBalance(res.data.balance);
              setCompleted({
                credits: finished.credits + (finished.bonus || 0),
                balance: res.data.balance,
              });
              toast.success("Payment complete — credits added.");

              // Refresh history so the purchase just made shows up right
              // away, without needing a reload.
              privateApi
                .get(`${authUrl}/credits`)
                .then((r) => setTransactions(r.data.transactions || []))
                .catch(() => {});
            } catch (err) {
              toast.error(
                err.response?.data?.message ||
                  "Payment approved but we couldn't confirm it. Contact support with your PayPal receipt."
              );
            } finally {
              setProcessing(false);
            }
          },

          onCancel: () => toast.info("Checkout cancelled."),

          onError: (err) => {
            console.error(err);
            toast.error("PayPal checkout hit an error. Please try again.");
          },
        });

        buttonsRef.current = buttons;
        buttons.render(mountRef.current);
        setSdkState("ready");
      })
      .catch(() => setSdkState("failed"));

    return () => {
      cancelled = true;
      buttonsRef.current?.close?.().catch(() => {});
    };
    // Buttons are created once for the session; createOrder always reads the
    // current selection via selectedRef, so `selected` isn't a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (completed) {
    return (
      <section className="section">
        <div className="wrap">
          <div className="purchase-success">
            <div className="ico">
              <Icon name="check" size={28} />
            </div>
            <h1 className="display display-md">
              {num(completed.credits)} credits added.
            </h1>
            <p className="lede" style={{ margin: "12px auto 28px" }}>
              Your new balance is {num(completed.balance)} credits.
            </p>
            <Link to="/dashboard" className="btn-solid btn-lg">
              Go to your dashboard
            </Link>
          </div>
          <CreditHistory transactions={transactions} />
        </div>
      </section>
    );
  }

  return (
    <>
      <PageIntro
        eyebrow="Buy credits"
        title="Buy link credits."
        lede={`1 credit = 1 link submission, at $${pricing.perCreditUsd.toFixed(
          2
        )} per link. Pick a package, pay through PayPal, and the credits are added to your account instantly. They never expire.`}
      />

      <section className="section-tight">
        <div className="wrap">
          {checkout.indiaUrl && (
            <div className="notice">
              Paying from India?{" "}
              <Link to={checkout.indiaUrl}>
                Buy credits with UPI, net banking, cards or wallets
              </Link>{" "}
              instead of PayPal.
            </div>
          )}

          {user && balance !== null && (
            <div className="balance-pill">
              Current balance: <b>{num(balance)} credits</b>
            </div>
          )}

          <div className="checkout">
            <div
              className="packages"
              role="radiogroup"
              aria-label="Choose a package"
            >
              {packages.map((p) => {
                const active = p.credits === selected;
                return (
                  <button
                    type="button"
                    key={p.credits}
                    role="radio"
                    aria-checked={active}
                    className={`package${active ? " is-selected" : ""}`}
                    onClick={() => setSelected(p.credits)}
                    disabled={processing}
                  >
                    <span className="radio" aria-hidden="true" />
                    <span>
                      <b>
                        {num(p.credits)} links credit
                        {p.bonus && (
                          <span className="bonus">+{p.bonusPct}% free</span>
                        )}
                      </b>
                      <small>
                        Submit up to {num(p.credits)} links
                        {p.bonus
                          ? `, plus ${num(p.bonus)} extra credits free.`
                          : "."}
                      </small>
                    </span>
                    <span className="amt">{money(p.price)}</span>
                  </button>
                );
              })}
            </div>

            <aside className="summary">
              <h3>Your order</h3>

              {user ? (
                <p className="buyer">
                  Buying as <b>{user.email}</b>
                </p>
              ) : (
                <div className="notice">
                  <Link to="/login">Log in</Link> or{" "}
                  <Link to="/register">create an account</Link> to buy
                  credits.
                </div>
              )}

              <div className="lines">
                <div className="line">
                  <span>{num(pack.credits)} links credit</span>
                  <span>{money(pack.price)}</span>
                </div>
                {pack.bonus && (
                  <div className="line">
                    <span>Bonus credits</span>
                    <span>+{num(pack.bonus)}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="line">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-{money(appliedCoupon.discountAmount)}</span>
                  </div>
                )}
                <div className="line total">
                  <span>Total</span>
                  <span>
                    {money(appliedCoupon ? appliedCoupon.finalPrice : pack.price)}
                  </span>
                </div>
              </div>

              {user && (
                <div className="field">
                  <label htmlFor="coupon">Coupon code</label>
                  {appliedCoupon ? (
                    <div className="coupon">
                      <input
                        id="coupon"
                        className="form-control"
                        value={appliedCoupon.code}
                        disabled
                        readOnly
                      />
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={removeCoupon}
                        disabled={processing}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="coupon">
                      <input
                        id="coupon"
                        className="form-control"
                        placeholder="Enter code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={processing || couponStatus === "checking"}
                      />
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={applyCoupon}
                        disabled={
                          processing || couponStatus === "checking" || !couponInput.trim()
                        }
                      >
                        {couponStatus === "checking" ? "Checking…" : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponStatus === "error" && (
                    <p className="coupon-msg">{couponError}</p>
                  )}
                  {couponStatus === "applied" && (
                    <p className="coupon-msg ok">
                      Coupon applied — you saved {money(appliedCoupon.discountAmount)}.
                    </p>
                  )}
                </div>
              )}

              {user && (
                <>
                  <div
                    ref={mountRef}
                    className={`paypal-mount${
                      sdkState !== "ready" ? " is-loading" : ""
                    }`}
                  >
                    {sdkState === "loading" && "Loading payment options…"}
                    {sdkState === "failed" && (
                      <span className="error">
                        Couldn't load PayPal checkout. Refresh the page to
                        try again.
                      </span>
                    )}
                  </div>
                  <p className="muted fine" style={{ marginTop: 14 }}>
                    Payments are processed by PayPal. {num(totalCredits)}{" "}
                    credits are added to your account the moment the payment
                    clears.
                  </p>
                </>
              )}
            </aside>
          </div>

          {user && <CreditHistory transactions={transactions} />}
        </div>
      </section>
    </>
  );
}

// Recent credit activity: purchases, links submitted, and any manual
// adjustments made by an admin — everything that has touched the balance.
function CreditHistory({ transactions }) {
  return (
    <div style={{ marginTop: 40 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
        Recent activity
      </h3>
      {transactions.length === 0 ? (
        <p className="muted fine">
          Nothing yet — your purchases and link submissions will show up
          here.
        </p>
      ) : (
        <div className="table-wrap">
          <table className="compare" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Activity</th>
                <th scope="col" style={{ textAlign: "right" }}>
                  Change
                </th>
                <th scope="col" style={{ textAlign: "right" }}>
                  Balance after
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t._id}>
                  <td>{formatDate(t.createdAt)}</td>
                  <td>{TX_LABELS[t.type] || t.type}</td>
                  <td
                    style={{
                      textAlign: "right",
                      color: t.amount > 0 ? "var(--green-2)" : "var(--ink-2)",
                    }}
                  >
                    {t.amount > 0 ? "+" : ""}
                    {num(t.amount)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {num(t.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
