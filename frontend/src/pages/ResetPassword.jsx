import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { publicApi } from "../api";
import { authUrl } from "../api/endpoints";
import AuthCard, { AuthSubmit } from "../components/site/AuthCard";
import { PASSWORD_MIN } from "../utils/validation";

const ResetPasswordPage = ({ history, location }) => {
  // id and token arrive in the reset link's query string
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const token = params.get("token");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const watchNewPassword = watch("newPassword");

  const onSubmit = async ({ newPassword }) => {
    setLoading(true);
    try {
      await publicApi.post(`${authUrl}/reset-password`, {
        newPassword,
        id,
        token,
      });
      toast.success("Password changed. Please log in to continue.");
      history.push("/login");
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
      title="Choose a new password."
      foot={
        <>
          Changed your mind? <Link to="/login">Back to log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="field">
          <label htmlFor="newPassword">New password</label>
          <input
            id="newPassword"
            type="password"
            className="form-control"
            autoComplete="new-password"
            disabled={loading}
            {...register("newPassword", {
              required: "Enter a new password.",
              minLength: {
                value: PASSWORD_MIN,
                message: `Password must be at least ${PASSWORD_MIN} characters.`,
              },
            })}
          />
          {errors?.newPassword && (
            <span className="error">{errors.newPassword.message}</span>
          )}
        </div>

        <div className="field">
          <label htmlFor="newPasswordConfirm">Confirm new password</label>
          <input
            id="newPasswordConfirm"
            type="password"
            className="form-control"
            autoComplete="new-password"
            disabled={loading}
            {...register("newPasswordConfirm", {
              validate: (value) =>
                value === watchNewPassword || "The passwords do not match.",
            })}
          />
          {errors?.newPasswordConfirm && (
            <span className="error">{errors.newPasswordConfirm.message}</span>
          )}
        </div>

        <AuthSubmit loading={loading} busy="Saving…">
          Set new password
        </AuthSubmit>
      </form>
    </AuthCard>
  );
};

export default ResetPasswordPage;
