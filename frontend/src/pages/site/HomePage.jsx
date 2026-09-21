import { Link } from "react-router-dom";
import { Icon } from "../../components/Icon";
import {
  company,
  pricing,
  packages,
  faqs,
  reviews,
} from "../../content/site";

const money = (n) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });
const num = (n) => n.toLocaleString("en-US");

const stats = [
  { value: "1,000+", label: "Clients since January 2022" },
  { value: "1M+", label: "Links indexed" },
  { value: "Up to 90%", label: "Indexing rate" },
  { value: `${pricing.maxDripfeedDays} days`, label: "Longest drip-feed window" },
];

const reasons = [
  {
    icon: "pen",
    title: "100% manual work",
    body: "There is no shortcut in our method. A dedicated team of eight people handles every submission by hand. It is slower than a script, and that is exactly why it is safe and why it works.",
  },
  {
    icon: "trending",
    title: "High indexing rate",
    body: "Beta testing showed indexing rates as high as 86%, and many clients report every one of their links indexed. Results depend on the links themselves and are never guaranteed, but our method consistently produces some of the best rates available.",
  },
  {
    icon: "slash",
    title: "No monthly subscription",
    body: "You buy link credits and use them at your own pace. There is nothing to cancel, and credits do not expire until you have used them all.",
  },
  {
    icon: "award",
    title: "Ten years behind it",
    body: `Linkdexing is backed by the ${company.parent} team, which has been running some of the most popular SEO and backlink services for the last ten years.`,
  },
];

const advantages = [
  {
    icon: "refresh",
    title: "Re-index",
    body: "Bring back links and pages that Google has previously dropped from its index.",
  },
  {
    icon: "droplet",
    title: "Drip feed",
    body: `Spread a submission over anything from one to ${pricing.maxDripfeedDays} days so it looks natural.`,
  },
  {
    icon: "layers",
    title: "Bulk orders",
    body: "Large batches are handled without fuss. Paste them in and you're done.",
  },
  {
    icon: "zap",
    title: "Fast results",
    body: "You can start seeing links picked up as soon as one day after submission.",
  },
];

const compare = [
  [
    "Pricing model",
    "No monthly subscription. Pay only for what you use.",
    "Monthly subscription. Pay every month whether you use it or not.",
  ],
  ["Indexing rate", "Up to 90%", "Typically under 10%"],
  [
    "Credit validity",
    "Credits never expire until fully used",
    "Credits expire with the monthly plan",
  ],
  ["Method", "100% manual work", "Automated tricks that can harm your links"],
  [
    "Re-indexing",
    "Can re-index pages that were previously de-indexed",
    "Cannot re-index de-indexed pages",
  ],
  ["Speed", "Most links index within a week", "Slow, if at all"],
];

export default function HomePage() {
  const smallest = packages[0];
  const largest = packages[packages.length - 1];
  const maxBonus = Math.max(...packages.map((p) => p.bonusPct || 0));

  return (
    <>
      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow">Backlink indexing service</p>
            <h1 className="display display-xl">
              Backlinks are worthless until Google indexes them.
            </h1>
            <p className="lede">
              You put real work and money into building links. If they never
              get indexed, they count for nothing. Linkdexing gets them
              discovered using a fully manual process, with indexing rates as
              high as 90%.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn-solid btn-lg">
                Sign up and get {pricing.freeCredits} free credits
                <Icon name="arrow" size={18} />
              </Link>
              <a href="#pricing" className="btn-ghost btn-lg">
                See pricing
              </a>
            </div>
            <p className="hero-note">
              No subscription. Credits never expire. Support replies within 24
              working hours.
            </p>
          </div>

          <aside className="hero-card" aria-label="Pricing at a glance">
            <p className="eyebrow">Simple pricing</p>
            <div className="price">
              ${pricing.perCreditUsd.toFixed(2)}
              <small>per link</small>
            </div>
            <ul>
              <li>
                <Icon name="check" size={18} />
                <span>1 credit = 1 link submission</span>
              </li>
              <li>
                <Icon name="check" size={18} />
                <span>
                  Packages from {num(smallest.credits)} to{" "}
                  {num(largest.credits)} links
                </span>
              </li>
              <li>
                <Icon name="check" size={18} />
                <span>Credits stay valid until you use them</span>
              </li>
              <li>
                <Icon name="check" size={18} />
                <span>
                  Drip-feed any order over 1 to {pricing.maxDripfeedDays} days
                </span>
              </li>
            </ul>
          </aside>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="stats">
            {stats.map((s) => (
              <div className="stat" key={s.label}>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="why">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Why Linkdexing</p>
            <h2 className="display display-lg">
              Most indexers stopped working years ago. Ours didn't.
            </h2>
            <p className="lede">
              Popular indexing tools rely on automated tricks that Google
              learned to ignore. We do the work by hand, which is slower, safer
              and far more effective.
            </p>
          </div>
          <div className="feature-list">
            {reasons.map((r) => (
              <div className="feature" key={r.title}>
                <div className="ico">
                  <Icon name={r.icon} />
                </div>
                <div>
                  <h3>{r.title}</h3>
                  <p>{r.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">What you get</p>
            <h2 className="display display-lg">
              Built for people who submit links every week.
            </h2>
          </div>
          <div className="tiles">
            {advantages.map((a) => (
              <div className="tile" key={a.title}>
                <div className="ico">
                  <Icon name={a.icon} size={24} />
                </div>
                <h3>{a.title}</h3>
                <p>{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="pricing">
        <div className="wrap price-band">
          <div>
            <p className="eyebrow">Pricing</p>
            <div className="price-big">
              {Math.round(pricing.perCreditUsd * 100)}
              <sup>¢</sup>
            </div>
            <p className="price-eq">
              per link. 1 credit = 1 link submission = $
              {pricing.perCreditUsd.toFixed(2)} (₹{pricing.perCreditInr})
            </p>
          </div>
          <div>
            <ul className="price-points">
              <li>
                <Icon name="check" size={18} />
                <span>
                  No monthly subscription. Buy credits when you need them.
                </span>
              </li>
              <li>
                <Icon name="check" size={18} />
                <span>Credits do not expire until fully used.</span>
              </li>
              <li>
                <Icon name="check" size={18} />
                <span>
                  Packages from {num(smallest.credits)} links (
                  {money(smallest.price)}) to {num(largest.credits)} links (
                  {money(largest.price)}), with up to {maxBonus}% bonus credits
                  on larger packs.
                </span>
              </li>
              <li>
                <Icon name="check" size={18} />
                <span>
                  New accounts get {pricing.freeCredits} free credits to test
                  the service.
                </span>
              </li>
            </ul>
            <div className="price-actions">
              <Link to="/buy-credits" className="btn-solid">
                View packages
              </Link>
              <Link to="/register" className="btn-ghost">
                Start with {pricing.freeCredits} free credits
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">What people say</p>
            <h2 className="display display-lg">
              Over ten thousand SEOs and agencies have used Linkdexing.
            </h2>
          </div>
          <div className="reviews">
            {reviews.map((r) => (
              <article className="review" key={r.quote}>
                <blockquote>{r.quote}</blockquote>
                <footer>
                  <b>{r.who}</b>
                  {r.where}
                </footer>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Linkdexing vs cheap indexers</p>
            <h2 className="display display-lg">
              Cheap indexing is expensive when nothing gets indexed.
            </h2>
          </div>
          <div className="compare-wrap">
            <table className="compare">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">Linkdexing</th>
                  <th scope="col">Cheap indexers</th>
                </tr>
              </thead>
              <tbody>
                {compare.map(([feature, us, them]) => (
                  <tr key={feature}>
                    <td>{feature}</td>
                    <td className="us">{us}</td>
                    <td className="them">{them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="muted fine" style={{ marginTop: 16 }}>
            Never submit links that give a low indexing rate. Check them on the{" "}
            <Link to="/non-performing-domains">non-performing domains</Link>{" "}
            list first.
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div className="wrap">
          <div className="section-head">
            <p className="eyebrow">Questions</p>
            <h2 className="display display-lg">Before you sign up</h2>
          </div>
          <div className="faq">
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-tight">
        <div className="wrap">
          <div className="cta-band">
            <div>
              <h2 className="display display-md">
                Try it on {pricing.freeCredits} links, free.
              </h2>
              <p>
                Sign up, get {pricing.freeCredits} credits, and see the results
                for yourself.
              </p>
            </div>
            <Link to="/register" className="btn-solid btn-lg">
              Create your account
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
