import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import useFormikForm from '../../components/formik/useFormikForm'
import { updateProfile } from '../../redux/slice/workspace'
import { syncUser } from '../../redux/slice/auth'
import { setTheme } from '../../redux/slice/ui'
import { updateAccountPassword } from '../../service/auth'
import { passwordSchema, profileSchema } from '../../validations/forms'

export default function useSettings() {
  const dispatch = useDispatch()
  const profile = useSelector((state) => state.workspace.profile)
  const theme = useSelector((state) => state.ui.theme)
  const [tab, setTab] = useState('Profile')
  const [showPasswords, setShowPasswords] = useState(false)

  const saveProfile = async (values) => {
    const nextProfile = { ...profile, ...values, email: profile.email }
    dispatch(updateProfile(nextProfile))
    dispatch(syncUser({
      name: nextProfile.name,
      email: profile.email,
      jobTitle: nextProfile.jobTitle,
    }))
    toast.success('Profile changes saved')
  }

  const updatePassword = async (values, actions) => {
    try {
      const result = await updateAccountPassword(values.newPassword)
      actions.resetForm()
      toast.success(result.message || 'Password updated successfully')
    } catch (error) {
      toast.error(error.message || 'Unable to update the password')
    }
  }

  const profileFormik = useFormikForm({
    initialValues: {
      name: profile.name || '',
      email: profile.email || '',
      jobTitle: profile.jobTitle || '',
      phone: profile.phone || '',
    },
    validationSchema: profileSchema,
    onSubmit: saveProfile,
    enableReinitialize: true,
  })

  const passwordFormik = useFormikForm({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: passwordSchema,
    onSubmit: updatePassword,
  })

  const updatePhoto = (event) => {
    const file = event.target.files[0]
    if (!file || file.size > 1_500_000) {
      toast.error('Choose an image smaller than 1.5 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      dispatch(updateProfile({ avatar: reader.result }))
      toast.success('Profile photo updated')
    }
    reader.readAsDataURL(file)
  }

  const changeTheme = (nextTheme) => dispatch(setTheme(nextTheme))

  return {
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
  }
}
