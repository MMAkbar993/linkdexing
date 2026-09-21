import { Link, NavLink } from 'react-router-dom';

const Header = ({ loggedIn, setLoggedIn }) => {
  const handleLogout = () => {
    localStorage.removeItem('linkdexing_admin_token');
    setLoggedIn(false);
  };

  return (
    <header className="admin-bar">
      <div className="wrap">
        <Link to="/" className="admin-brand">
          <img src="/logo.png" alt="Linkdexing" />
          <span>Admin</span>
        </Link>

        {loggedIn && (
          <>
            <nav className="admin-nav" aria-label="Admin">
              <NavLink to="/dashboard" activeClassName="is-active">
                Process links
              </NavLink>
              <NavLink to="/users" activeClassName="is-active">
                Users
              </NavLink>
              <NavLink to="/payments" activeClassName="is-active">
                Payments
              </NavLink>
              <NavLink to="/submissions" activeClassName="is-active">
                Submissions
              </NavLink>
              <NavLink to="/coupons" activeClassName="is-active">
                Coupons
              </NavLink>
              <NavLink to="/settings" activeClassName="is-active">
                Settings
              </NavLink>
            </nav>
            <div className="spacer" />
            <button type="button" className="btn-bar" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
