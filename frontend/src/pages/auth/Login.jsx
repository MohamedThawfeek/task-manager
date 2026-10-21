import { Check, Eye, EyeOff, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "../../components/common";
import useLogin from "../../hooks/auth/login";

export default function LoginPage() {
  const {
    handleBlur,
    handleChange,
    values,
    handleSubmit,
    touched,
    errors,
    setFieldValue,
    loading,
    showPassword,
    setShowPassword,
  } = useLogin();

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="min-h-screen bg-[#f5f7fd] p-3 sm:p-8"
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-365 overflow-hidden rounded-[25px] bg-white shadow-[0_18px_55px_rgba(30,43,77,.08)] lg:grid-cols-2">
        <section className="flex items-start justify-center px-6 py-12 sm:px-12 lg:py-16">
          <div className="w-full max-w-140">
            <div className="mx-auto w-fit">
              <Logo />
            </div>

            <div className="mt-11 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Welcome Back
              </h1>
              <p className="mt-5 leading-6 text-[#8997b2]">
                Sign in to your account
              </p>
            </div>

            <div className="mt-14 space-y-5">
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

              <div>
                <div className="flex justify-between gap-4">
                  <label className="label" htmlFor="password">
                    Password
                  </label>
                  <Link
                    className="text-sm font-semibold text-primary"
                    to="/forgot-password"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete="current-password"
                    className={`field pr-10 ${touched.password && errors.password ? "field-error" : ""}`}
                    placeholder="Enter your password"
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

              <label className="flex items-center gap-2 text-sm">
                <input
                  name="remember"
                  type="checkbox"
                  checked={values.remember}
                  onChange={(event) =>
                    setFieldValue("remember", event.target.checked)
                  }
                  className="accent-primary"
                />
                Remember me
              </label>

              <button
                type="submit"
                disabled={loading}
                className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Please wait…" : "Sign In"}
              </button>
            </div>
          </div>
        </section>

        <section className="auth-gradient relative hidden overflow-hidden p-14 text-center text-white lg:block">
          <h2 className="mt-7 text-4xl font-extrabold leading-tight">
            Organize your work
            <br />
            Get things done
          </h2>
          <p className="mt-5 leading-7 text-white/85">
            Manage projects, tasks and teams
            <br />
            in one place.
          </p>
          <div className="mx-auto mt-20 grid h-[120px] w-[120px] place-items-center rounded-[30px] bg-white/15">
            <Check aria-hidden="true" size={60} />
          </div>
          <div className="mx-auto mt-6 w-[410px] rotate-[-5deg] rounded-[16px] bg-[#f9faff] p-8 text-left text-[#6572ad] shadow-xl">
            {[
              "Manage projects",
              "Track tasks",
              "Collaborate with your team",
            ].map((point) => (
              <p key={point} className="mb-5 flex items-center gap-3 last:mb-0">
                <span aria-hidden="true">✓</span>
                {point}
              </p>
            ))}
          </div>
          <div className="mt-5 text-4xl" aria-hidden="true">
            👩🏻‍💻 &nbsp; 👨🏽‍💻
          </div>
        </section>
      </div>
    </form>
  );
}
