import { Link, NavLink } from "react-router-dom";

const navLinks = [
  { to: "/", label: "Home", exact: true },
  { to: "/about", label: "About" },
  { to: "/buy-credits", label: "Buy Credits" },
  { to: "/non-performing-domains", label: "Non-Performing Domains" },
  { to: "/contact", label: "Contact" },
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
          <Link className="brand" to="/">
            <img src="/logo.png" alt="Linkdexing" />
          </Link>

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
              {navLinks.map(({ to, label, exact }) => (
                <li className="nav-item" key={to}>
                  <NavLink
                    to={to}
                    exact={exact}
                    className="nav-link"
                    activeClassName="is-active"
                  >
                    {label}
                  </NavLink>
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
