import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PageIntro from "../../components/site/PageIntro";
import { indiaPackages } from "../../content/site";

const inr = (n) =>
  n.toLocaleString("en-IN", { style: "currency", currency: "INR" });
const num = (n) => n.toLocaleString("en-IN");

// Razorpay's hosted Payment Button. Their script renders the button next to
// itself, so it has to be inserted as a real <script> element - one added via
// JSX or innerHTML never executes.
function RazorpayButton({ buttonId }) {
  const formRef = useRef(null);

  useEffect(() => {
    const form = formRef.current;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/payment-button.js";
    script.setAttribute("data-payment_button_id", buttonId);
    script.async = true;
    form.appendChild(script);

    return () => {
      form.innerHTML = "";
    };
  }, [buttonId]);

  return <form ref={formRef} />;
}

export default function BuyCreditsIndiaPage() {
  return (
    <>
      <PageIntro
        eyebrow="Buy credits · India"
        title="Buy link credits in INR."
        lede="Pay with UPI, net banking, cards or wallets through Razorpay. Prices include 18% GST."
      />

      <section className="section-tight">
        <div className="wrap">
          <div className="notice">
            Pay with the same email address you use for your Linkdexing
            account, so the credits reach the right account. Not in India?{" "}
            <Link to="/buy-credits">Pay with PayPal instead</Link>.
          </div>

          <div className="table-wrap">
            <table className="compare" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th scope="col">Package</th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Subtotal
                  </th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    GST (18%)
                  </th>
                  <th scope="col" style={{ textAlign: "right" }}>
                    Total
                  </th>
                  <th scope="col" />
                </tr>
              </thead>
              <tbody>
                {indiaPackages.map((p) => (
                  <tr key={p.credits}>
                    <td>
                      <b>{num(p.credits)} credits</b>
                      {p.bonusPct && (
                        <span className="muted"> · {p.bonusPct}% extra free</span>
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>{inr(p.subtotal)}</td>
                    <td style={{ textAlign: "right" }}>{inr(p.gst)}</td>
                    <td style={{ textAlign: "right" }}>
                      <b>{inr(p.total)}</b>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <RazorpayButton buttonId={p.buttonId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
