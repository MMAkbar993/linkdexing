import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { publicApi } from "../api";
import { authUrl } from "../api/endpoints";
import AuthCard, { AuthSubmit } from "../components/site/AuthCard";

const RESEND_COOLDOWN_MS = 60000;

const VerificationPage = ({ user, setRefresh }) => {
  const [disableResend, setDisableResend] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onOtpSubmit = async ({ otp }) => {
    setLoading(true);
    try {
      await publicApi.post(`${authUrl}/verify-otp/${user._id}`, {
        otp: otp.toString(),
      });
      toast.success("Account verified");
      setRefresh(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.error ||
          "Something went wrong, please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend is re-enabled after a minute
  const handleResend = async () => {
    try {
      setDisableResend(true);
      await publicApi.post(`${authUrl}/send-otp/${user._id}`);
      toast.info("A new code has been sent");
      setTimeout(() => setDisableResend(false), RESEND_COOLDOWN_MS);
    } catch (err) {
      setDisableResend(false);
      toast.error(
        err.response?.data?.message ||
          err.error ||
          "Something went wrong, please try again later."
      );
    }
  };

  return (
    <AuthCard eyebrow="Verify your email" title="Check your inbox.">
      <form className="auth-form" onSubmit={handleSubmit(onOtpSubmit)} noValidate>
        <div className="auth-note">
          We've sent a 6-digit code to{" "}
          <strong>{user?.email || "your email address"}</strong>. It's valid
          for 10 minutes.
        </div>

        <div className="field">
          <label htmlFor="otp">Verification code</label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            className="form-control otp"
            autoComplete="one-time-code"
            placeholder="······"
            disabled={loading}
            {...register("otp", {
              required: "Enter the 6-digit code.",
              pattern: {
                value: /^[0-9]{6}$/,
                message: "The code is 6 digits.",
              },
            })}
          />
          {errors?.otp && <span className="error">{errors.otp.message}</span>}
        </div>

        <AuthSubmit loading={loading} busy="Verifying…">
          Verify account
        </AuthSubmit>

        <button
          type="button"
          className="btn-quiet"
          onClick={handleResend}
          disabled={disableResend}
        >
          {disableResend ? "Code sent. You can resend in a minute." : "Resend code"}
        </button>
      </form>
    </AuthCard>
  );
};

export default VerificationPage;
