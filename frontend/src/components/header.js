import { Link, NavLink } from "react-router-dom";
import { mainSite } from "../content/site";

// `href` = a page on the main WordPress site; `to` = a page inside this app.
const navLinks = [
  { href: mainSite.home, label: "Home" },
  { href: mainSite.about, label: "About" },
  { to: "/buy-credits", label: "Buy Credits" },
  { to: "/non-performing-domains", label: "Non-Performing Domains" },
  { href: mainSite.contact, label: "Contact" },
];

export default function Header({ setRefresh, user }) {
  const onLogout = () => {
    localStorage.removeItem("jxidwrtdy");
    setRefresh(true);
  };

  return (
    <header className="site-header">
      <nav className="navbar navbar-expand-lg site-nav" aria-label="Main">
        <div className="wrap">
          <a className="brand" href={mainSite.home}>
            <img src="/logo.png" alt="Linkdexing" />
          </a>

          <button
            className="nav-toggle d-lg-none"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#siteNav"
            aria-controls="siteNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span />
          </button>

          <div className="collapse navbar-collapse" id="siteNav">
            <ul className="navbar-nav site-nav-links mx-lg-auto">
              {navLinks.map(({ to, href, label }) => (
                <li className="nav-item" key={label}>
                  {href ? (
                    <a href={href} className="nav-link">
                      {label}
                    </a>
                  ) : (
                    <NavLink to={to} className="nav-link" activeClassName="is-active">
                      {label}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>

            <div className="site-nav-actions">
              {user ? (
                <>
                  <span className="nav-user">{user.name}</span>
                  <Link to="/dashboard" className="btn-ghost">
                    Dashboard
                  </Link>
                  <button type="button" className="btn-quiet" onClick={onLogout}>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-quiet">
                    Log in
                  </Link>
                  <Link to="/register" className="btn-solid">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
