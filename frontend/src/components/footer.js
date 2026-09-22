import { Link } from "react-router-dom";
import { company, mainSite } from "../content/site";

// `href` = a page on the main WordPress site; `to` = a page inside this app.
const columns = [
  {
    title: "Service",
    links: [
      { href: mainSite.home, label: "Home" },
      { to: "/buy-credits", label: "Buy Credits" },
      { to: "/non-performing-domains", label: "Non-Performing Domains" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: mainSite.about, label: "About" },
      { href: mainSite.contact, label: "Contact" },
      { href: mainSite.privacy, label: "Privacy Policy" },
      { href: mainSite.terms, label: "Terms of Service" },
      { href: mainSite.refund, label: "Refund & Cancellation" },
    ],
  },
  {
    title: "Account",
    links: [
      { to: "/login", label: "Log in" },
      { to: "/register", label: "Register" },
      { to: "/dashboard", label: "Dashboard" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="footer-brand">
            <img src="/logo.png" alt="Linkdexing" />
            <p>
              Manual backlink indexing for SEO professionals, agencies and link
              builders. No subscriptions, and credits never expire.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <a href={l.href}>{l.label}</a>
                    ) : (
                      <Link to={l.to}>{l.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="footer-meta">
          <span>
            &copy; {year} {company.name}
          </span>
          <span>GSTIN {company.gstin}</span>
          <a href={`mailto:${company.supportEmail}`}>{company.supportEmail}</a>
        </div>
      </div>
    </footer>
  );
}
