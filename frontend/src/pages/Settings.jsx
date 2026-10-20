import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { CircleUserRound, LockKeyhole, Moon, Palette, ShieldCheck, Sun } from 'lucide-react'
import { PageHeader } from '../components/common'
import { updateProfile } from '../features/workspaceSlice'
import { syncUser } from '../features/authSlice'
import { setTheme } from '../features/uiSlice'

const tabs = [{ name: 'Profile', icon: CircleUserRound }, { name: 'Appearance', icon: Palette }, { name: 'Security', icon: LockKeyhole }]
export default function SettingsPage() {
  const dispatch = useDispatch(); const profile = useSelector((s) => s.workspace.profile); const theme = useSelector((s) => s.ui.theme); const [tab, setTab] = useState('Profile'); const { register, handleSubmit } = useForm({ defaultValues: profile })
  const save = (data) => { const nextProfile = { ...data, email: profile.email }; dispatch(updateProfile(nextProfile)); dispatch(syncUser({ name: nextProfile.name, email: profile.email, jobTitle: nextProfile.jobTitle })); toast.success('Profile changes saved') }
  const photo = (event) => { const file = event.target.files[0]; if (!file || file.size > 1_500_000) return toast.error('Choose an image smaller than 1.5 MB'); const reader = new FileReader(); reader.onload = () => { dispatch(updateProfile({ avatar: reader.result })); toast.success('Profile photo updated') }; reader.readAsDataURL(file) }
  return <><PageHeader title="Settings" subtitle="Manage your account and preferences" /><section className="card grid min-h-[445px] gap-8 p-5 lg:grid-cols-[240px_1fr] sm:p-6"><nav className="space-y-1">{tabs.map(({ name, icon: Icon }) => <button className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left ${tab === name ? 'bg-[#eceaff] font-semibold text-primary' : 'text-[#71809d] hover:bg-[#f5f6fa]'}`} key={name} onClick={() => setTab(name)}><Icon size={16} />{name}</button>)}</nav><div>
      {tab === 'Profile' && <form onSubmit={handleSubmit(save)}><h2 className="text-xl font-bold">Profile Information</h2><div className="mt-5 flex items-center gap-6">{String(profile.avatar).startsWith('data:') ? <img src={profile.avatar} className="h-24 w-24 rounded-full object-cover" alt="Profile" /> : <span className="grid h-24 w-24 place-items-center rounded-full bg-[#e4e0ff] text-5xl">{profile.avatar}</span>}<label className="primary-btn">Change Photo<input type="file" accept="image/*" className="hidden" onChange={photo} /></label></div><div className="mt-5 grid gap-5 md:grid-cols-2"><div><label className="label">Full Name</label><input className="field" {...register('name')} /></div><div><label className="label">Email Address</label><div className="relative"><input readOnly aria-readonly="true" title="Email address cannot be changed" className="field cursor-not-allowed bg-[#f3f5f9] pr-11 text-[#78859f]" {...register('email')} /><LockKeyhole className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b97ae]" size={17} /></div><p className="mt-1.5 text-xs text-muted">Email address cannot be changed.</p></div><div><label className="label">Job Title</label><input className="field" {...register('jobTitle')} /></div><div><label className="label">Phone Number</label><input className="field" {...register('phone')} /></div></div><button className="primary-btn mt-6">Save Changes</button></form>}
      {tab === 'Appearance' && <div><h2 className="text-xl font-bold">Appearance</h2><p className="mt-2 text-muted">Personalize how TaskFlow looks on this device.</p><div className="mt-6 grid gap-4 sm:grid-cols-2"><button onClick={() => dispatch(setTheme('light'))} className={`rounded-xl border-2 p-6 text-left ${theme === 'light' ? 'border-primary bg-[#f7f6ff]' : 'border-[#e2e7f1]'}`}><Sun className="mb-3 text-[#f6a91b]" /><strong>Light mode</strong><p className="mt-1 text-sm text-muted">Bright and clean for daytime.</p></button><button onClick={() => dispatch(setTheme('dark'))} className={`rounded-xl border-2 p-6 text-left ${theme === 'dark' ? 'border-primary bg-[#242b44]' : 'border-[#e2e7f1]'}`}><Moon className="mb-3 text-primary" /><strong>Dark mode</strong><p className="mt-1 text-sm text-muted">Easy on the eyes after dark.</p></button></div></div>}
      {tab === 'Security' && <SecurityPanel />}
    </div></section></>
}

function SecurityPanel() {
  const [show, setShow] = useState(false)
  return <div><h2 className="text-xl font-bold">Security</h2><p className="mt-2 text-muted">Update your local demo password and session settings.</p><div className="mt-6 max-w-xl space-y-4"><div><label className="label">Current password</label><input type={show ? 'text' : 'password'} className="field" /></div><div><label className="label">New password</label><input type={show ? 'text' : 'password'} className="field" /></div><label className="flex items-center gap-2 text-sm"><input checked={show} onChange={() => setShow(!show)} type="checkbox" />Show passwords</label><button onClick={() => toast.success('Password updated for this local session')} className="primary-btn"><ShieldCheck size={17} />Update Password</button></div></div>
}
