import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Check, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import { Logo } from '../components/common'
import { login, register } from '../features/authSlice'
import { useState } from 'react'

const loginSchema = z.object({ email: z.email('Enter a valid email'), password: z.string().min(6, 'Password must be at least 6 characters'), remember: z.boolean().optional() })
const registerSchema = z.object({ name: z.string().min(2, 'Enter your full name'), email: z.email('Enter a valid email'), password: z.string().min(8, 'Use at least 8 characters'), confirm: z.string() }).refine((data) => data.password === data.confirm, { message: 'Passwords do not match', path: ['confirm'] })
const forgotSchema = z.object({ email: z.email('Enter a valid email') })
const FieldError = ({ errors, name }) => errors[name] ? <p className="error-text">{errors[name].message}</p> : null

const content = {
  login: { heading: 'Welcome Back', subheading: 'Sign in to your account', hero: <>Organize your work<br />Get things done</>, points: ['Design homepage UI', 'Develop authentication', 'Review tasks', 'Project launch'] },
  register: { heading: 'Create an Account', subheading: 'Join and start managing your tasks', hero: <>Start your productivity<br />journey today</>, points: ['Plan projects', 'Manage tasks', 'Collaborate together'] },
  forgot: { heading: 'Reset Your Password', subheading: 'Enter your email address and we’ll send you a link to reset your password.', hero: 'Secure password recovery', points: ['Secure password reset'] },
}

export function AuthPage({ mode }) {
  const copy = content[mode]; const dispatch = useDispatch(); const navigate = useNavigate(); const loading = useSelector((s) => s.auth.loading); const token = useSelector((s) => s.auth.token)
  const [showPassword, setShowPassword] = useState(false)
  const schema = mode === 'register' ? registerSchema : mode === 'forgot' ? forgotSchema : loginSchema
  const { register: field, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: mode === 'login' ? { email: 'sarah@company.com', password: 'password', remember: true } : {} })
  useEffect(() => { if (token && mode !== 'forgot') navigate('/dashboard', { replace: true }) }, [token, mode, navigate])
  const submit = async (values) => {
    if (mode === 'forgot') { await new Promise((r) => setTimeout(r, 500)); toast.success(`Reset link prepared for ${values.email}`); navigate('/login'); return }
    const action = mode === 'register' ? register(values) : login(values)
    const result = await dispatch(action)
    if (result.meta.requestStatus === 'fulfilled') toast.success(mode === 'register' ? 'Your workspace is ready!' : 'Welcome back, Sarah!')
  }
  return <main className="min-h-screen bg-[#f5f7fd] p-3 sm:p-8">
    <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1460px] overflow-hidden rounded-[25px] bg-white shadow-[0_18px_55px_rgba(30,43,77,.08)] lg:grid-cols-2">
      <section className="flex items-start justify-center px-6 py-12 sm:px-12 lg:py-16">
        <div className="w-full max-w-[560px]">
          <div className="mx-auto w-fit"><Logo /></div>
          <div className="mt-11 text-center"><h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{copy.heading}</h1><p className="mx-auto mt-5 max-w-xl leading-6 text-[#8997b2]">{copy.subheading}</p></div>
          <form onSubmit={handleSubmit(submit)} className="mt-14 space-y-5">
            {mode === 'register' && <div><label className="label">Full Name</label><input className={`field ${errors.name ? 'field-error' : ''}`} placeholder="John Doe" {...field('name')} /><FieldError errors={errors} name="name" /></div>}
            <div><label className="label">Email address</label><div className="relative"><input className={`field pr-10 ${errors.email ? 'field-error' : ''}`} placeholder="you@example.com" {...field('email')} /><Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a2acc0]" size={17} /></div><FieldError errors={errors} name="email" /></div>
            {mode !== 'forgot' && <><div><div className="flex justify-between"><label className="label">Password</label>{mode === 'login' && <Link to="/forgot-password" className="text-sm font-semibold text-primary">Forgot password?</Link>}</div><div className="relative"><input type={showPassword ? 'text' : 'password'} className={`field pr-10 ${errors.password ? 'field-error' : ''}`} placeholder={mode === 'login' ? 'Enter your password' : 'Create a strong password'} {...field('password')} /><button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b97ae]" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div><FieldError errors={errors} name="password" /></div>
            {mode === 'register' && <div><label className="label">Confirm Password</label><input type="password" className={`field ${errors.confirm ? 'field-error' : ''}`} placeholder="Confirm your password" {...field('confirm')} /><FieldError errors={errors} name="confirm" /></div>}
            {mode === 'login' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-primary" {...field('remember')} />Remember me</label>}</>}
            <button disabled={loading} className="primary-btn w-full">{loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : mode === 'register' ? 'Create Account' : 'Send Reset Link'}</button>
          </form>
          {mode !== 'forgot' ? <><div className="my-4 flex items-center gap-3 text-sm"><span className="h-px flex-1 bg-[#e5e9f1]" /><span>Or continue with</span><span className="h-px flex-1 bg-[#e5e9f1]" /></div><div className="grid grid-cols-2 gap-3"><button onClick={() => toast('Google sign-in requires a configured OAuth provider.')} className="secondary-btn">🌐 Google</button><button onClick={() => toast('GitHub sign-in requires a configured OAuth provider.')} className="secondary-btn">◉ GitHub</button></div><p className="mt-4 text-center text-sm">{mode === 'login' ? <>Don’t have an account? <Link className="text-primary" to="/register">Sign up</Link></> : <>Already have an account? <Link className="text-primary" to="/login">Sign in</Link></>}</p></> : <p className="mt-4 text-center"><Link to="/login" className="text-primary">Back to login</Link></p>}
        </div>
      </section>
      <section className="auth-gradient relative hidden overflow-hidden p-14 text-center text-white lg:block">
        <h2 className="mt-7 text-4xl font-extrabold leading-tight">{copy.hero}</h2><p className="mt-5 leading-7 text-white/85">Manage projects, tasks and teams<br />in one place.</p>
        <div className="mx-auto mt-20 grid h-[120px] w-[120px] place-items-center rounded-[30px] bg-white/15">{mode === 'forgot' ? <Mail size={52} /> : mode === 'register' ? <span className="text-6xl">☑</span> : <Check size={60} />}</div>
        <div className="mx-auto mt-6 w-[410px] rotate-[-5deg] rounded-[16px] bg-[#f9faff] p-8 text-left text-[#6572ad] shadow-xl">{copy.points.map((p) => <p key={p} className="mb-5 flex items-center gap-3 last:mb-0">{mode === 'forgot' ? <LockKeyhole size={16} /> : <span>✓</span>}{p}</p>)}</div>
        {mode === 'login' && <div className="mt-5 text-4xl">👩🏻‍💻 &nbsp; 👨🏽‍💻</div>}
      </section>
    </div>
  </main>
}
