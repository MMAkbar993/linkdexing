import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { publicApi } from "../api";
import { authUrl } from "../api/endpoints";
import AuthCard, { AuthSubmit } from "../components/site/AuthCard";
import { EMAIL_PATTERN } from "../utils/validation";

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // values = { email }
  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await publicApi.post(`${authUrl}/forgot-password`, values);
      toast.success("Password reset email sent");
      setSent(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong, please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      eyebrow="Reset password"
      title="Forgot your password?"
      lede="Enter the email on your account and we'll send you a link to choose a new one."
      foot={
        <>
          Remembered it? <Link to="/login">Back to log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {sent && (
          <div className="auth-note">
            If that address has an account, a reset link is on its way. Check
            your spam folder if it doesn't arrive in a few minutes.
          </div>
        )}

        <div className="field">
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            className="form-control"
            autoComplete="email"
            disabled={loading}
            {...register("email", {
              required: "Enter your email address.",
              pattern: {
                value: EMAIL_PATTERN,
                message: "Enter a valid email address.",
              },
            })}
          />
          {errors?.email && (
            <span className="error">{errors.email.message}</span>
          )}
        </div>

        <AuthSubmit loading={loading} busy="Sending…">
          Send reset link
        </AuthSubmit>
      </form>
    </AuthCard>
  );
};

export default ForgotPasswordPage;
