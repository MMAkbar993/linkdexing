import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import { useEffect, useState } from 'react';
import { privateApi } from './api';
import { authUrl } from './api/endpoints';
import { toast } from 'react-toastify';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import Users from './pages/Users';
import Payments from './pages/Payments';
import Submissions from './pages/Submissions';
import Coupons from './pages/Coupons';
import Settings from './pages/Settings';

const PublicRoute = ({
  loggedIn,
  setLoggedIn,
  component: Component,
  ...props
}) => {
  if (loggedIn) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Route {...props} render={() => <Component setLoggedIn={setLoggedIn} />} />
  );
};

const PrivateRoute = ({ loggedIn, component: Component, ...props }) => {
  if (!loggedIn) {
    return <Redirect to="/" />;
  }

  return <Route {...props} component={Component} />;
};

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { ok } = (await privateApi.get(`${authUrl}/me`)).data;
        setLoggedIn(Boolean(ok));
      } catch (err) {
        const message = err.response?.data?.error || err.response?.data?.message;
        if (message) toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="wrap muted" style={{ padding: 32 }}>Loading…</div>;
  }

  return (
    <BrowserRouter>
      <div className="admin">
        <Header setLoggedIn={setLoggedIn} loggedIn={loggedIn} />
        <main className="admin-main">
          <Switch>
            <PrivateRoute path="/users" component={Users} loggedIn={loggedIn} />
            <PrivateRoute
              path="/payments"
              component={Payments}
              loggedIn={loggedIn}
            />
            <PrivateRoute
              path="/submissions"
              component={Submissions}
              loggedIn={loggedIn}
            />
            <PrivateRoute
              path="/coupons"
              component={Coupons}
              loggedIn={loggedIn}
            />
            <PrivateRoute
              path="/settings"
              component={Settings}
              loggedIn={loggedIn}
            />
            <PrivateRoute
              path="/dashboard"
              component={Dashboard}
              loggedIn={loggedIn}
            />
            <PublicRoute
              path="/login"
              component={Login}
              setLoggedIn={setLoggedIn}
              loggedIn={loggedIn}
            />
            <PublicRoute
              path="/"
              exact
              component={Login}
              setLoggedIn={setLoggedIn}
              loggedIn={loggedIn}
            />
            <Redirect to="/" />
          </Switch>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
