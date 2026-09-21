import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { privateApi } from "../api";
import { authUrl } from "../api/endpoints";
import Sidebar from "../components/Sidebar";

// After login, change password
const ChangePasswordPage = ({ user }) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
    watch,
  } = useForm();

  const [loading, setLoading] = useState(false);

  // constantly watches the current value of new password (confirm new password)
  const watchNewPassword = watch("newPassword");

  const onSubmit = async ({ newPassword, oldPassword }) => {
    setLoading(true);
    try {
      // change-password
      await privateApi.post(`${authUrl}/change-password`, {
        newPassword,
        oldPassword,
      });

      toast.success("Password changed successfully");
    } catch (err) {
      toast.error(
        err.response?.data.message ||
          "Something went wrong, Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container mt-2'>
      <div className='row'>
        <div className='col-sm-12 col-md-9'>
          <h2>Change Password</h2>
          <div className='card p-3'>
            <form className='form-control-sm' onSubmit={handleSubmit(onSubmit)}>
              <div className='mb-3'>
                <div className='mb-3'>
                  <label htmlFor='oldPassword' className='form-label'>
                    Old Password
                  </label>
                  <input
                    type='password'
                    disabled={loading}
                    className='form-control'
                    id='oldPassword'
                    aria-describedby='old password'
                    {...register("oldPassword", {
                      required: true,
                    })}
                  />

                  {errors?.oldPassword && (
                    <span className='text-danger'>
                      Old password is required
                    </span>
                  )}
                </div>
              </div>
              <div className='mb-3'>
                <label htmlFor='newPassword' className='form-label'>
                  New Password
                </label>
                <input
                  type='password'
                  disabled={loading}
                  className='form-control'
                  id='newPassword'
                  aria-describedby='new password'
                  {...register("newPassword", {
                    required: "New password is required",
                    pattern: {
                      value: /^.{5,}$/,
                      message: "Password is too short",
                    },
                  })}
                />

                {errors?.newPassword && (
                  <span className='text-danger'>
                    {errors.newPassword.message}
                  </span>
                )}
              </div>

              <div className='mb-3'>
                <label htmlFor='newPasswordConfirm' className='form-label'>
                  Confirm New Password
                </label>
                <input
                  type='password'
                  disabled={loading}
                  className='form-control'
                  id='newPasswordConfirm'
                  aria-describedby='confirm new password'
                  {...register("newPasswordConfirm", {
                    required: "Confirm New password is required",
                    validate: (value) =>
                      value === watchNewPassword ||
                      "The passwords do not match",
                  })}
                />

                {errors?.newPasswordConfirm && (
                  <span className='text-danger'>
                    {errors.newPasswordConfirm.message}
                  </span>
                )}
              </div>

              <div>
                <button
                  type='submit'
                  className='btn btn-primary btn-lg'
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className='spinner-border spinner-border-sm'
                        role='status'
                        aria-hidden='true'
                      />
                      <span className='ml-1'>Loading...</span>
                    </>
                  ) : (
                    "Change Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <Sidebar />
      </div>
    </div>
  );
};

export default ChangePasswordPage;
