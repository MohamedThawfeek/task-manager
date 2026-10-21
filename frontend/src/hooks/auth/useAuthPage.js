import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import useFormikForm from '../../components/formik/useFormikForm'
import { setAuth, setAuthError, setAuthLoading } from '../../redux/slice/auth'
import {
  loginUser,
  registerUser,
  sendForgotPassword,
  submitResetPassword,
} from '../../service/auth'
import { saveStoredAuth } from '../../service/authStorage'
import { getAuthSchema } from '../../validations/auth'

function getInitialValues(mode) {
  if (mode === 'register') return { name: '', email: '', phone: '', password: '', confirm: '' }
  if (mode === 'forgot') return { email: '' }
  if (mode === 'reset') return { password: '', confirm: '' }
  return { email: '', password: '', remember: true }
}

export default function useAuthPage(mode) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const loading = useSelector((state) => state.auth.loading)
  const token = useSelector((state) => state.auth.token)
  const resetToken = searchParams.get('token') || ''
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (token && !['forgot', 'reset'].includes(mode)) {
      navigate('/dashboard', { replace: true })
    }
  }, [token, mode, navigate])

  const submit = async (values) => {
    dispatch(setAuthLoading(true))
    dispatch(setAuthError(null))

    try {
      if (mode === 'forgot') {
        const result = await sendForgotPassword(values.email)
        toast.success(result.message || 'Password reset link sent')
        navigate('/login')
        return
      }

      if (mode === 'reset') {
        if (!resetToken) {
          toast.error('This reset link is missing its token')
          return
        }
        const result = await submitResetPassword(resetToken, values.password)
        toast.success(result.message || 'Password reset successfully')
        navigate('/login', { replace: true })
        return
      }

      if (mode === 'register') {
        const result = await registerUser(values)
        toast.success(result.message || 'Account created successfully')
        navigate('/login', { replace: true })
        return
      }

      const auth = await loginUser(values)
      saveStoredAuth(auth)
      dispatch(setAuth(auth))
      toast.success(auth.message || 'Welcome back!')
    } catch (error) {
      const message = error.message || 'Something went wrong. Please try again.'
      dispatch(setAuthError(message))
      toast.error(message)
    } finally {
      dispatch(setAuthLoading(false))
    }
  }

  const formik = useFormikForm({
    initialValues: getInitialValues(mode),
    validationSchema: getAuthSchema(mode),
    onSubmit: submit,
    enableReinitialize: true,
  })

  return {
    formik,
    loading,
    resetToken,
    showPassword,
    setShowPassword,
  }
}
