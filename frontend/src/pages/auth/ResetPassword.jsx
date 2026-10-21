import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/common";
import useResetPassword from "../../hooks/auth/resetPassword";

export default function ResetPasswordPage() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    loading,
    resetToken,
    showPassword,
    setShowPassword,
  } = useResetPassword();

  return (
      <main className="min-h-screen bg-[#f5f7fd] p-3 sm:p-8">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1460px] overflow-hidden rounded-[25px] bg-white shadow-[0_18px_55px_rgba(30,43,77,.08)] lg:grid-cols-2">
          <section className="flex items-start justify-center px-6 py-12 sm:px-12 lg:py-16">
            <div className="w-full max-w-[560px]">
              <div className="mx-auto w-fit">
                <Logo />
              </div>

              <div className="mt-11 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Create New Password
                </h1>
                <p className="mx-auto mt-5 max-w-xl leading-6 text-[#8997b2]">
                  Choose a secure password for your TaskFlow account.
                </p>
              </div>

              {!resetToken && (
                <div
                  className="mt-8 rounded-xl border border-[#ffd5dd] bg-[#fff2f5] px-4 py-3 text-sm text-[#d92f52]"
                  role="alert"
                >
                  This password-reset link is invalid because its token is
                  missing. Request a new link from the forgot-password page.
                </div>
              )}

              <form
                className="mt-14 space-y-5"
                noValidate
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="label" htmlFor="password">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="new-password"
                      className={`field pr-10 ${touched.password && errors.password ? "field-error" : ""}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b97ae]"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff aria-hidden="true" size={18} />
                      ) : (
                        <Eye aria-hidden="true" size={18} />
                      )}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <p className="error-text">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="confirm">
                    Confirm Password
                  </label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    value={values.confirm}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="new-password"
                    className={`field ${touched.confirm && errors.confirm ? "field-error" : ""}`}
                    placeholder="Confirm your password"
                  />
                  {touched.confirm && errors.confirm && (
                    <p className="error-text">{errors.confirm}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !resetToken}
                  className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Please wait…" : "Reset Password"}
                </button>
              </form>

              <p className="mt-5 text-center">
                <Link
                  className="text-primary"
                  to={resetToken ? "/login" : "/forgot-password"}
                >
                  {resetToken ? "Back to login" : "Request a new reset link"}
                </Link>
              </p>
            </div>
          </section>

          <section className="auth-gradient relative hidden overflow-hidden p-14 text-center text-white lg:block">
            <h2 className="mt-7 text-4xl font-extrabold leading-tight">
              Secure password recovery
            </h2>
            <p className="mt-5 leading-7 text-white/85">
              Manage projects, tasks and teams
              <br />
              in one place.
            </p>
            <div className="mx-auto mt-20 grid h-[120px] w-[120px] place-items-center rounded-[30px] bg-white/15">
              <LockKeyhole aria-hidden="true" size={52} />
            </div>
            <div className="mx-auto mt-6 w-[410px] rotate-[-5deg] rounded-[16px] bg-[#f9faff] p-8 text-left text-[#6572ad] shadow-xl">
              {["Create a new password", "Return to your account"].map(
                (point) => (
                  <p
                    key={point}
                    className="mb-5 flex items-center gap-3 last:mb-0"
                  >
                    <LockKeyhole aria-hidden="true" size={16} />
                    {point}
                  </p>
                ),
              )}
            </div>
          </section>
        </div>
      </main>
  );
}
