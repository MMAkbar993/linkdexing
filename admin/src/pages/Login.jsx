import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { publicApi } from '../api';
import { authUrl } from '../api/endpoints';

const Login = ({ setLoggedIn }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [loading, setLoading] = useState(false);

  const loginSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await publicApi.post(authUrl, values);
      localStorage.setItem('linkdexing_admin_token', response.data.token);
      setLoggedIn(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Something went wrong, please try again later'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-x">
      <div className="login-card">
        <img src="/logo.png" alt="Linkdexing" />
        <h1>Admin sign in</h1>
        <p>Staff access only.</p>

        <form className="form-x" onSubmit={handleSubmit(loginSubmit)} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-control"
              autoComplete="username"
              disabled={loading}
              {...register('email', { required: true })}
            />
            {errors?.email && <span className="error">Enter your email.</span>}
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-control"
              autoComplete="current-password"
              disabled={loading}
              {...register('password', { required: true })}
            />
            {errors?.password && (
              <span className="error">Enter your password.</span>
            )}
          </div>

          <button type="submit" className="btn-x solid block" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border" role="status" aria-hidden="true" />
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
