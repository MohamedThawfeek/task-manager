import { LockKeyhole, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/common";
import useForgotPassword from "../../hooks/auth/forgot";

export default function ForgotPasswordPage() {
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    loading,
  } = useForgotPassword();

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
                  Reset Your Password
                </h1>
                <p className="mx-auto mt-5 max-w-xl leading-6 text-[#8997b2]">
                  Enter your email address and we’ll send you a link to reset
                  your password.
                </p>
              </div>

              <form
                className="mt-14 space-y-5"
                noValidate
                onSubmit={handleSubmit}
              >
                <div>
                  <label className="label" htmlFor="email">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      autoComplete="email"
                      className={`field pr-10 ${touched.email && errors.email ? "field-error" : ""}`}
                      placeholder="Enter your email address"
                    />
                    <Mail
                      aria-hidden="true"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a2acc0]"
                      size={17}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="error-text">{errors.email}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Please wait…" : "Send Reset Link"}
                </button>
              </form>

              <p className="mt-5 text-center">
                <Link className="text-primary" to="/login">
                  Back to login
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
              <Mail aria-hidden="true" size={52} />
            </div>
            <div className="mx-auto mt-6 w-[410px] rotate-[-5deg] rounded-[16px] bg-[#f9faff] p-8 text-left text-[#6572ad] shadow-xl">
              <p className="flex items-center gap-3">
                <LockKeyhole aria-hidden="true" size={16} />
                Secure password reset
              </p>
            </div>
          </section>
        </div>
      </main>
  );
}
