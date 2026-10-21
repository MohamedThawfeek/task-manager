import { Link } from "react-router-dom";
import { FormikProvider } from "formik";
import { Check, Eye, EyeOff, LockKeyhole, Mail, Phone } from "lucide-react";
import { Logo } from "../components/common";
import {
  FormikCheckbox,
  FormikError,
  FormikInput,
} from "../components/formik/FormikFields";
import useAuthPage from "../hooks/auth/useAuthPage";

const content = {
  login: {
    heading: "Welcome Back",
    subheading: "Sign in to your account",
    hero: (
      <>
        Organize your work
        <br />
        Get things done
      </>
    ),
    points: [
      "Design homepage UI",
      "Develop authentication",
      "Review tasks",
      "Project launch",
    ],
  },
  register: {
    heading: "Create an Account",
    subheading: "Join and start managing your tasks",
    hero: (
      <>
        Start your productivity
        <br />
        journey today
      </>
    ),
    points: ["Plan projects", "Manage tasks", "Collaborate together"],
  },
  forgot: {
    heading: "Reset Your Password",
    subheading:
      "Enter your email address and we’ll send you a link to reset your password.",
    hero: "Secure password recovery",
    points: ["Secure password reset"],
  },
  reset: {
    heading: "Create New Password",
    subheading: "Choose a secure password for your TaskFlow account.",
    hero: "Secure password recovery",
    points: ["Create a new password", "Return to your account"],
  },
};

export function AuthPage({ mode }) {
  const copy = content[mode];
  const {
    formik,
    loading,
    resetToken,
    showPassword,
    setShowPassword,
  } = useAuthPage(mode);
  return (
    <FormikProvider value={formik}>
      <main className="min-h-screen bg-[#f5f7fd] p-3 sm:p-8">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1460px] overflow-hidden rounded-[25px] bg-white shadow-[0_18px_55px_rgba(30,43,77,.08)] lg:grid-cols-2">
        <section className="flex items-start justify-center px-6 py-12 sm:px-12 lg:py-16">
          <div className="w-full max-w-[560px]">
            <div className="mx-auto w-fit">
              <Logo />
            </div>
            <div className="mt-11 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {copy.heading}
              </h1>
              <p className="mx-auto mt-5 max-w-xl leading-6 text-[#8997b2]">
                {copy.subheading}
              </p>
            </div>
            {mode === "reset" && !resetToken && (
              <div className="mt-8 rounded-xl border border-[#ffd5dd] bg-[#fff2f5] px-4 py-3 text-sm text-[#d92f52]">
                This password-reset link is invalid because its token is
                missing. Request a new link from the forgot-password page.
              </div>
            )}
            <form onSubmit={formik.handleSubmit} className="mt-14 space-y-5" noValidate>
              {mode === "register" && (
                <div>
                  <label className="label">Full Name</label>
                  <FormikInput name="name" placeholder="John Doe" />
                  <FormikError name="name" />
                </div>
              )}
              {mode !== "reset" && (
                <div>
                  <label className="label">Email address</label>
                  <div className="relative">
                    <FormikInput
                      name="email"
                      type="email"
                      autoComplete="email"
                      className="pr-10"
                      placeholder="you@example.com"
                    />
                    <Mail
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a2acc0]"
                      size={17}
                    />
                  </div>
                  <FormikError name="email" />
                </div>
              )}
              {mode === "register" && (
                <div>
                  <label className="label">Phone number</label>
                  <div className="relative">
                    <FormikInput
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      className="pr-10"
                      placeholder="+1 555 0123"
                    />
                    <Phone
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a2acc0]"
                      size={17}
                    />
                  </div>
                  <FormikError name="phone" />
                </div>
              )}
              {mode !== "forgot" && (
                <>
                  <div>
                    <div className="flex justify-between">
                      <label className="label">
                        {mode === "reset" ? "New Password" : "Password"}
                      </label>
                      {mode === "login" && (
                        <Link
                          to="/forgot-password"
                          className="text-sm font-semibold text-primary"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <FormikInput
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        className="pr-10"
                        placeholder={
                          mode === "login"
                            ? "Enter your password"
                            : "Create a strong password"
                        }
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b97ae]"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    <FormikError name="password" />
                  </div>
                  {(mode === "register" || mode === "reset") && (
                    <div>
                      <label className="label">Confirm Password</label>
                      <FormikInput
                        name="confirm"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Confirm your password"
                      />
                      <FormikError name="confirm" />
                    </div>
                  )}
                  {mode === "login" && (
                    <label className="flex items-center gap-2 text-sm">
                      <FormikCheckbox name="remember" className="accent-primary" />
                      Remember me
                    </label>
                  )}
                </>
              )}
              <button
                disabled={loading || (mode === "reset" && !resetToken)}
                className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign In"
                    : mode === "register"
                      ? "Create Account"
                      : mode === "reset"
                        ? "Reset Password"
                        : "Send Reset Link"}
              </button>
            </form>
            {mode === "login" || mode === "register" ? (
              <p className="mt-5 text-center text-sm">
                {mode === "login" ? (
                  <>
                    Don’t have an account?{" "}
                    <Link className="text-primary" to="/register">
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link className="text-primary" to="/login">
                      Sign in
                    </Link>
                  </>
                )}
              </p>
            ) : (
              <p className="mt-5 text-center">
                <Link
                  to={
                    mode === "reset" && !resetToken
                      ? "/forgot-password"
                      : "/login"
                  }
                  className="text-primary"
                >
                  {mode === "reset" && !resetToken
                    ? "Request a new reset link"
                    : "Back to login"}
                </Link>
              </p>
            )}
          </div>
        </section>
        <section className="auth-gradient relative hidden overflow-hidden p-14 text-center text-white lg:block">
          <h2 className="mt-7 text-4xl font-extrabold leading-tight">
            {copy.hero}
          </h2>
          <p className="mt-5 leading-7 text-white/85">
            Manage projects, tasks and teams
            <br />
            in one place.
          </p>
          <div className="mx-auto mt-20 grid h-[120px] w-[120px] place-items-center rounded-[30px] bg-white/15">
            {mode === "forgot" ? (
              <Mail size={52} />
            ) : mode === "reset" ? (
              <LockKeyhole size={52} />
            ) : mode === "register" ? (
              <span className="text-6xl">☑</span>
            ) : (
              <Check size={60} />
            )}
          </div>
          <div className="mx-auto mt-6 w-[410px] rotate-[-5deg] rounded-[16px] bg-[#f9faff] p-8 text-left text-[#6572ad] shadow-xl">
            {copy.points.map((p) => (
              <p key={p} className="mb-5 flex items-center gap-3 last:mb-0">
                {mode === "forgot" || mode === "reset" ? (
                  <LockKeyhole size={16} />
                ) : (
                  <span>✓</span>
                )}
                {p}
              </p>
            ))}
          </div>
          {mode === "login" && (
            <div className="mt-5 text-4xl">👩🏻‍💻 &nbsp; 👨🏽‍💻</div>
          )}
        </section>
        </div>
      </main>
    </FormikProvider>
  );
}
