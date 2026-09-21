import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useState, useEffect } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import { privateApi } from "./api";
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/Verification";
import LinksArchivePage from "./pages/LinksArchive";
import IndexCheckerPage from "./pages/IndexCheckerPage";
import DeveloperApiPage from "./pages/DeveloperApiPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ResetPasswordPage from "./pages/ResetPassword";
import OrderLinks from "./pages/OrderPage";
import HomePage from "./pages/site/HomePage";
import AboutPage from "./pages/site/AboutPage";
import ContactPage from "./pages/site/ContactPage";
import BuyCreditsPage from "./pages/site/BuyCreditsPage";
import NonPerformingDomainsPage from "./pages/site/NonPerformingDomainsPage";
import { authUrl } from "./api/endpoints";
import Header from "./components/header";
import Footer from "./components/footer";

const PublicRoute = ({ user, setRefresh, component: Component, ...props }) => {
  if (user) {
    if (user.verified) {
      return <Redirect to='/dashboard' />;
    } else {
      return <Redirect to='/verification' />;
    }
  }

  return (
    <Route
      {...props}
      render={(routeProps) => (
        <Component {...routeProps} user={user} setRefresh={setRefresh} />
      )}
    />
  );
};

const PrivateRoute = ({ user, setRefresh, component: Component, ...props }) => {
  if (!user) {
    return <Redirect to='/login' />;
  }

  if (!user.verified) {
    return <Redirect to='/verification' />;
  }

  return (
    <Route
      {...props}
      render={(routeProps) => (
        <Component {...routeProps} user={user} setRefresh={setRefresh} />
      )}
    />
  );
};

const VerificationRoute = ({
  user,
  setRefresh,
  component: Component,
  ...props
}) => {
  if (!user) {
    return <Redirect to='/login' />;
  }

  if (!user.verified) {
    return (
      <Route
        {...props}
        path='/verification'
        render={(routeProps) => (
          <Component {...routeProps} user={user} setRefresh={setRefresh} />
        )}
      />
    );
  }

  return <Redirect to='/dashboard' />;
};

// Marketing pages: visible to everyone, logged in or not.
const SiteRoute = ({ user, component: Component, ...props }) => (
  <Route
    {...props}
    render={(routeProps) => <Component {...routeProps} user={user} />}
  />
);

const getUser = ({ user, verified }) => ({ ...user, verified });

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await privateApi.get(`${authUrl}/isAuthenticated`);
        if (res.data.ok) {
          setUser(getUser(res.data));
          setLoading(false);
        } else {
          if (res.data.user) {
            setUser(getUser(res.data));
          }

          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
        setUser(null);
      }
    };
    if (refresh) {
      fetchUser();
      setRefresh(false);
    }
  }, [refresh]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
    >
      <BrowserRouter>
        <div className='site'>
          <Header user={user} setRefresh={setRefresh} />
          <main className='site-main'>
            <Switch>
              <PrivateRoute
                path='/order/:id'
                component={OrderLinks}
                user={user}
                setRefresh={setRefresh}
              />
              <PublicRoute
                path='/reset-password'
                component={ResetPasswordPage}
                user={user}
                setRefresh={setRefresh}
              />
              <PrivateRoute
                path='/change-password'
                component={ChangePasswordPage}
                user={user}
                setRefresh={setRefresh}
              />
              <PrivateRoute
                path='/dashboard'
                component={DashboardPage}
                user={user}
                setRefresh={setRefresh}
              />
              <PublicRoute
                path='/forgot-password'
                component={ForgotPasswordPage}
                user={user}
                setRefresh={setRefresh}
              />
              <PrivateRoute
                path='/links-archive'
                component={LinksArchivePage}
                user={user}
                setRefresh={setRefresh}
              />
              <PrivateRoute
                path='/index-checker'
                component={IndexCheckerPage}
                user={user}
                setRefresh={setRefresh}
              />
              <PrivateRoute
                path='/developer-api'
                component={DeveloperApiPage}
                user={user}
                setRefresh={setRefresh}
              />
              <VerificationRoute
                path='/verification'
                component={VerificationPage}
                user={user}
                setRefresh={setRefresh}
              />
              <PublicRoute
                path='/register'
                component={RegisterPage}
                user={user}
                setRefresh={setRefresh}
              />
              <PublicRoute
                path='/login'
                component={Login}
                user={user}
                setRefresh={setRefresh}
              />

              <SiteRoute path='/about' exact component={AboutPage} user={user} />
              <SiteRoute path='/contact' exact component={ContactPage} user={user} />
              <SiteRoute
                path='/buy-credits'
                exact
                component={BuyCreditsPage}
                user={user}
              />
              <SiteRoute
                path='/non-performing-domains'
                exact
                component={NonPerformingDomainsPage}
                user={user}
              />
              <SiteRoute path='/' exact component={HomePage} user={user} />

              <Redirect to='/' />
            </Switch>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </GoogleReCaptchaProvider>
  );
};

export default App;
