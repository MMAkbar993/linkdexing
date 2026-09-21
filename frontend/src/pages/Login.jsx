import { useCallback, useEffect, useState } from "react";
import { GoogleReCaptcha, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { publicApi } from "../api";
import { authUrl, captchaUrl } from "../api/endpoints";
import AuthCard, { AuthSubmit } from "../components/site/AuthCard";
import { pricing } from "../content/site";
import { EMAIL_PATTERN } from "../utils/validation";

export default function LoginPage({ setRefresh }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleReCaptchaVerify = useCallback(async (token) => {
    try {
      const res = await publicApi.post(captchaUrl, { token });
      setVerified(Boolean(res.data.ok));
    } catch (err) {
      setVerified(false);
    }
  }, []);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      if (!verified) {
        toast.error("Captcha not verified");
        return;
      }

      const res = await publicApi.post(`${authUrl}/login`, values);
      localStorage.setItem("jxidwrtdy", res.data.token);
      setRefresh(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Something went wrong, please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!executeRecaptcha) return;
    executeRecaptcha();
  }, [executeRecaptcha]);

  return (
    <AuthCard
      eyebrow="Log in"
      title="Welcome back."
      lede="Log in to submit links and check on your archive."
      foot={
        <>
          New to Linkdexing? <Link to="/register">Create an account</Link> and
          get {pricing.freeCredits} free credits.
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="form-control"
            autoComplete="email"
            disabled={loading}
            {...register("email", { required: true, pattern: EMAIL_PATTERN })}
          />
          {errors?.email && (
            <span className="error">Enter a valid email address.</span>
          )}
        </div>

        <div className="field">
          <div className="label-row">
            <label htmlFor="password">Password</label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <input
            id="password"
            type="password"
            className="form-control"
            autoComplete="current-password"
            disabled={loading}
            {...register("password", { required: true })}
          />
          {errors?.password && (
            <span className="error">Enter your password.</span>
          )}
        </div>

        <GoogleReCaptcha onVerify={handleReCaptchaVerify} />

        <AuthSubmit loading={loading} busy="Logging in…">
          Log in
        </AuthSubmit>
      </form>
    </AuthCard>
  );
}
