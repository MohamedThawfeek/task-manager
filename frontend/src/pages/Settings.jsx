import { FormikProvider } from 'formik'
import { CircleUserRound, LockKeyhole, Moon, Palette, ShieldCheck, Sun } from 'lucide-react'
import { PageHeader } from '../components/common'
import { FormikError, FormikInput } from '../components/formik/FormikFields'
import useSettings from '../hooks/settings/useSettings'

const tabs = [
  { name: 'Profile', icon: CircleUserRound },
  { name: 'Appearance', icon: Palette },
  { name: 'Security', icon: LockKeyhole },
]

export default function SettingsPage() {
  const {
    profile,
    theme,
    tab,
    setTab,
    showPasswords,
    setShowPasswords,
    profileFormik,
    passwordFormik,
    updatePhoto,
    changeTheme,
  } = useSettings()

  return <>
    <PageHeader title="Settings" subtitle="Manage your account and preferences" />
    <section className="card grid min-h-[445px] gap-8 p-5 lg:grid-cols-[240px_1fr] sm:p-6">
      <nav className="space-y-1">
        {tabs.map(({ name, icon: Icon }) => <button
          className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left ${tab === name ? 'bg-[#eceaff] font-semibold text-primary' : 'text-[#71809d] hover:bg-[#f5f6fa]'}`}
          key={name}
          onClick={() => setTab(name)}
        >
          <Icon size={16} />{name}
        </button>)}
      </nav>
      <div>
        {tab === 'Profile' && <FormikProvider value={profileFormik}>
          <form onSubmit={profileFormik.handleSubmit} noValidate>
            <h2 className="text-xl font-bold">Profile Information</h2>
            <div className="mt-5 flex items-center gap-6">
              {String(profile.avatar).startsWith('data:')
                ? <img src={profile.avatar} className="h-24 w-24 rounded-full object-cover" alt="Profile" />
                : <span className="grid h-24 w-24 place-items-center rounded-full bg-[#e4e0ff] text-5xl">{profile.avatar}</span>}
              <label className="primary-btn">Change Photo<input type="file" accept="image/*" className="hidden" onChange={updatePhoto} /></label>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="label">Full Name</label>
                <FormikInput name="name" />
                <FormikError name="name" />
              </div>
              <div>
                <label className="label">Email Address</label>
                <div className="relative">
                  <FormikInput name="email" readOnly aria-readonly="true" title="Email address cannot be changed" className="cursor-not-allowed bg-[#f3f5f9] pr-11 text-[#78859f]" />
                  <LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b97ae]" size={17} />
                </div>
                <p className="mt-1.5 text-xs text-muted">Email address cannot be changed.</p>
              </div>
              <div>
                <label className="label">Job Title</label>
                <FormikInput name="jobTitle" />
                <FormikError name="jobTitle" />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <FormikInput name="phone" type="tel" />
                <FormikError name="phone" />
              </div>
            </div>
            <button disabled={profileFormik.isSubmitting} className="primary-btn mt-6">
              {profileFormik.isSubmitting ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </FormikProvider>}
        {tab === 'Appearance' && <div>
          <h2 className="text-xl font-bold">Appearance</h2>
          <p className="mt-2 text-muted">Personalize how TaskFlow looks on this device.</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <button onClick={() => changeTheme('light')} className={`rounded-xl border-2 p-6 text-left ${theme === 'light' ? 'border-primary bg-[#f7f6ff]' : 'border-[#e2e7f1]'}`}>
              <Sun className="mb-3 text-[#f6a91b]" /><strong>Light mode</strong><p className="mt-1 text-sm text-muted">Bright and clean for daytime.</p>
            </button>
            <button onClick={() => changeTheme('dark')} className={`rounded-xl border-2 p-6 text-left ${theme === 'dark' ? 'border-primary bg-[#242b44]' : 'border-[#e2e7f1]'}`}>
              <Moon className="mb-3 text-primary" /><strong>Dark mode</strong><p className="mt-1 text-sm text-muted">Easy on the eyes after dark.</p>
            </button>
          </div>
        </div>}
        {tab === 'Security' && <SecurityPanel
          show={showPasswords}
          setShow={setShowPasswords}
          formik={passwordFormik}
        />}
      </div>
    </section>
  </>
}

function SecurityPanel({ show, setShow, formik }) {
  return <FormikProvider value={formik}>
    <form onSubmit={formik.handleSubmit} noValidate>
      <h2 className="text-xl font-bold">Security</h2>
      <p className="mt-2 text-muted">Update your TaskFlow account password.</p>
      <div className="mt-6 max-w-xl space-y-4">
        <div>
          <label className="label">New password</label>
          <FormikInput name="newPassword" type={show ? 'text' : 'password'} autoComplete="new-password" />
          <FormikError name="newPassword" />
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <FormikInput name="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" />
          <FormikError name="confirmPassword" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input checked={show} onChange={() => setShow(!show)} type="checkbox" />Show passwords
        </label>
        <button disabled={formik.isSubmitting} className="primary-btn disabled:opacity-60">
          <ShieldCheck size={17} />{formik.isSubmitting ? 'Updating…' : 'Update Password'}
        </button>
      </div>
    </form>
  </FormikProvider>
}
