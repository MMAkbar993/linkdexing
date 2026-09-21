import { useCallback, useEffect, useState } from "react";
import { GoogleReCaptcha, useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { publicApi } from "../api";
import { authUrl, captchaUrl } from "../api/endpoints";
import AuthCard, { AuthSubmit } from "../components/site/AuthCard";
import { pricing } from "../content/site";
import { EMAIL_PATTERN, NAME_MIN, PASSWORD_MIN } from "../utils/validation";

export default function RegisterPage({ setRefresh }) {
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const watchPassword = watch("password");

  const handleRecaptchaVerify = useCallback(async (token) => {
    try {
      const res = await publicApi.post(captchaUrl, { token });
      setVerified(Boolean(res.data.ok));
    } catch (err) {
      setVerified(false);
    }
  }, []);

  // values = { name, email, password, passwordConfirm }
  const onSubmit = async (values) => {
    setLoading(true);

    try {
      if (!verified) {
        toast.error("Captcha not verified");
        return;
      }

      // Create the account
      const { data } = await publicApi.post(authUrl, values);

      toast.success("Registered successfully");

      // Send the verification code
      try {
        await publicApi.post(`${authUrl}/send-otp/${data.user._id}`);
      } catch (err) {}

      // Log the new user in
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
      eyebrow="Create account"
      title="Start with 10 free credits."
      lede={`Enough to test the service on ${pricing.freeCredits} real links. No card needed.`}
      foot={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="form-control"
            autoComplete="name"
            disabled={loading}
            {...register("name", { required: true, minLength: NAME_MIN })}
          />
          {errors?.name && (
            <span className="error">
              Name must be at least {NAME_MIN} characters.
            </span>
          )}
        </div>

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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="form-control"
            autoComplete="new-password"
            disabled={loading}
            {...register("password", {
              required: true,
              minLength: PASSWORD_MIN,
            })}
          />
          {errors?.password && (
            <span className="error">
              Password must be at least {PASSWORD_MIN} characters.
            </span>
          )}
        </div>

        <div className="field">
          <label htmlFor="passwordConfirm">Confirm password</label>
          <input
            id="passwordConfirm"
            type="password"
            className="form-control"
            autoComplete="new-password"
            disabled={loading}
            {...register("passwordConfirm", {
              required: "Confirm your password.",
              validate: (value) =>
                value === watchPassword || "The passwords do not match.",
            })}
          />
          {errors?.passwordConfirm && (
            <span className="error">{errors.passwordConfirm.message}</span>
          )}
        </div>

        <GoogleReCaptcha onVerify={handleRecaptchaVerify} />

        <AuthSubmit loading={loading} busy="Creating your account…">
          Create account
        </AuthSubmit>
      </form>
    </AuthCard>
  );
}
