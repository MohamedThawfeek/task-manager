import {
  CircleUserRound,
  LockKeyhole,
  Moon,
  Palette,
  ShieldCheck,
  Sun,
} from "lucide-react";
import { Avatar, PageHeader } from "../components/common";
import useSettings from "../hooks/settings/useSettings";

const tabs = [
  { name: "Profile", icon: CircleUserRound },
  { name: "Appearance", icon: Palette },
  { name: "Security", icon: LockKeyhole },
];

function FieldError({ form, name }) {
  if (!form.touched[name] || !form.errors[name]) return null;
  return <p className="error-text">{form.errors[name]}</p>;
}

export default function SettingsPage() {
  const {
    profile,
    theme,
    tab,
    setTab,
    showPasswords,
    setShowPasswords,
    profileForm,
    passwordForm,
    updatePhoto,
    changeTheme,
  } = useSettings();
  const initials =
    profile.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Manage your account and preferences"
      />
      <section className="card grid min-h-[445px] gap-8 p-5 sm:p-6 lg:grid-cols-[240px_1fr]">
        <nav className="space-y-1">
          {tabs.map(({ name, icon: Icon }) => (
            <button
              className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left ${tab === name ? "bg-[#eceaff] font-semibold text-primary" : "text-[#71809d] hover:bg-[#f5f6fa]"}`}
              key={name}
              onClick={() => setTab(name)}
            >
              <Icon size={16} />
              {name}
            </button>
          ))}
        </nav>

        <div>
          {tab === "Profile" && (
            <form onSubmit={profileForm.handleSubmit} noValidate>
              <h2 className="text-xl font-bold">Profile Information</h2>
              <div className="mt-5 flex items-center gap-6">
                {profile.avatar && profile.avatar.startsWith("data:image/") ? (
                  <img
                    src={profile.avatar}
                    className="h-24 w-24 rounded-full object-cover"
                    alt=""
                  />
                ) : (
                  <Avatar
                    member={{
                      name: profile.name,
                      avatar: profile.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join(""),
                    }}
                    size={96}
                  />
                )}

                <label className="primary-btn">
                  Change Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={updatePhoto}
                  />
                </label>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="label" htmlFor="name">
                    Full Name
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={profileForm.values.name}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    className={`field ${profileForm.touched.name && profileForm.errors.name ? "field-error" : ""}`}
                  />
                  <FieldError form={profileForm} name="name" />
                </div>
                <div>
                  <label className="label" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      value={profileForm.values.email}
                      readOnly
                      aria-readonly="true"
                      title="Email address cannot be changed"
                      className="field cursor-not-allowed bg-[#f3f5f9] pr-11 text-[#78859f]"
                    />
                    <LockKeyhole
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b97ae]"
                      size={17}
                    />
                  </div>
                  <p className="mt-1.5 text-xs text-muted">
                    Email address cannot be changed.
                  </p>
                </div>
                <div>
                  <label className="label" htmlFor="jobTitle">
                    Job Title
                  </label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    value={profileForm.values.jobTitle}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    className={`field ${profileForm.touched.jobTitle && profileForm.errors.jobTitle ? "field-error" : ""}`}
                  />
                  <FieldError form={profileForm} name="jobTitle" />
                </div>
                <div>
                  <label className="label" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={profileForm.values.phone}
                    onChange={profileForm.handleChange}
                    onBlur={profileForm.handleBlur}
                    className={`field ${profileForm.touched.phone && profileForm.errors.phone ? "field-error" : ""}`}
                  />
                  <FieldError form={profileForm} name="phone" />
                </div>
              </div>
              <button
                disabled={profileForm.isSubmitting}
                className="primary-btn mt-6"
              >
                {profileForm.isSubmitting ? "Saving…" : "Save Changes"}
              </button>
            </form>
          )}

          {tab === "Appearance" && (
            <div>
              <h2 className="text-xl font-bold">Appearance</h2>
              <p className="mt-2 text-muted">
                Personalize how TaskFlow looks on this device.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <button
                  onClick={() => changeTheme("light")}
                  className={`rounded-xl border-2 p-6 text-left ${theme === "light" ? "border-primary bg-[#f7f6ff]" : "border-[#e2e7f1]"}`}
                >
                  <Sun className="mb-3 text-[#f6a91b]" />
                  <strong>Light mode</strong>
                  <p className="mt-1 text-sm text-muted">
                    Bright and clean for daytime.
                  </p>
                </button>
                <button
                  onClick={() => changeTheme("dark")}
                  className={`rounded-xl border-2 p-6 text-left ${theme === "dark" ? "border-primary bg-[#242b44]" : "border-[#e2e7f1]"}`}
                >
                  <Moon className="mb-3 text-primary" />
                  <strong>Dark mode</strong>
                  <p className="mt-1 text-sm text-muted">
                    Easy on the eyes after dark.
                  </p>
                </button>
              </div>
            </div>
          )}

          {tab === "Security" && (
            <SecurityPanel
              form={passwordForm}
              show={showPasswords}
              setShow={setShowPasswords}
            />
          )}
        </div>
      </section>
    </>
  );
}

function SecurityPanel({ form, show, setShow }) {
  return (
    <form onSubmit={form.handleSubmit} noValidate>
      <h2 className="text-xl font-bold">Security</h2>
      <p className="mt-2 text-muted">Update your TaskFlow account password.</p>
      <div className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="label" htmlFor="newPassword">
            New password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type={show ? "text" : "password"}
            value={form.values.newPassword}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            autoComplete="new-password"
            className={`field ${form.touched.newPassword && form.errors.newPassword ? "field-error" : ""}`}
          />
          <FieldError form={form} name="newPassword" />
        </div>
        <div>
          <label className="label" htmlFor="confirmPassword">
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={show ? "text" : "password"}
            value={form.values.confirmPassword}
            onChange={form.handleChange}
            onBlur={form.handleBlur}
            autoComplete="new-password"
            className={`field ${form.touched.confirmPassword && form.errors.confirmPassword ? "field-error" : ""}`}
          />
          <FieldError form={form} name="confirmPassword" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={show}
            onChange={() => setShow(!show)}
            type="checkbox"
          />
          Show passwords
        </label>
        <button
          disabled={form.isSubmitting}
          className="primary-btn disabled:opacity-60"
        >
          <ShieldCheck size={17} />
          {form.isSubmitting ? "Updating…" : "Update Password"}
        </button>
      </div>
    </form>
  );
}
