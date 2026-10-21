import { useState } from 'react'
import { FormikProvider } from 'formik'
import { Eye, EyeOff } from 'lucide-react'
import useFormikForm from '../formik/useFormikForm'
import { FormikDropdown, FormikError, FormikInput } from '../formik/FormikFields'
import { memberSchema } from '../../validations/forms'

export default function MemberForm({ initial, onSubmit }) {
  const [showPassword, setShowPassword] = useState(false)
  const normalizedStatus = initial?.status === 'Inactive'
    || String(initial?.status).toLowerCase() === 'inactive'
    ? 'Inactive'
    : 'Active'
  const formik = useFormikForm({
    initialValues: {
      name: initial?.name || '',
      email: initial?.email || '',
      password: '',
      phone: initial?.phone || '',
      role: initial?.role || '',
      access: initial?.access || 'User',
      status: normalizedStatus,
    },
    validationSchema: memberSchema(Boolean(initial)),
    enableReinitialize: true,
    onSubmit,
  })

  return <FormikProvider value={formik}>
    <form onSubmit={formik.handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <FormikInput name="name" placeholder="Full name" />
          <FormikError name="name" />
        </div>
        <div>
          <label className="label">Email</label>
          <FormikInput name="email" type="email" placeholder="name@company.com" />
          <FormikError name="email" />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <FormikInput
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="pr-11"
              placeholder={initial ? 'Leave blank to keep current' : 'Minimum 6 characters'}
            />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <FormikError name="password" />
        </div>
        <div>
          <label className="label">Phone</label>
          <FormikInput name="phone" type="tel" placeholder="+1 555 0123" />
          <FormikError name="phone" />
        </div>
      </div>
      <div>
        <label className="label">Role</label>
        <FormikInput name="role" placeholder="e.g. Product Manager" />
        <FormikError name="role" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Access</label>
          <FormikDropdown name="access" options={['User', 'Admin']} />
          <FormikError name="access" />
        </div>
        <div>
          <label className="label">Status</label>
          <FormikDropdown name="status" options={['Active', 'Inactive']} />
          <FormikError name="status" />
        </div>
      </div>
      <button disabled={formik.isSubmitting} className="primary-btn w-full disabled:cursor-not-allowed disabled:opacity-60">
        {formik.isSubmitting ? 'Please wait…' : initial ? 'Save Member' : 'Create Member'}
      </button>
    </form>
  </FormikProvider>
}
