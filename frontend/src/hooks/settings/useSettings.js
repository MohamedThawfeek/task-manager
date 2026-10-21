import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import Formhandel from '../../components/formik/FormikFields'
import { updateProfile } from '../../redux/slice/profile'
import { syncUser } from '../../redux/slice/auth'
import { setTheme } from '../../redux/slice/ui'
import api from '../../service/axios'
import { apiPath } from '../../service/path'
import { formatUser } from '../../utils/apiData'
import { passwordSchema, profileSchema } from '../../validations/forms'

export default function useSettings() {
  const dispatch = useDispatch()
  const profile = useSelector((state) => state.profile.details)
  const theme = useSelector((state) => state.ui.theme)
  const [tab, setTab] = useState('Profile')
  const [showPasswords, setShowPasswords] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)

  const saveProfile = async (values) => {
    try {
      const formData = new FormData()
      formData.append('name', values.name.trim())
      formData.append('role', values.jobTitle?.trim() || '')
      formData.append('phone', values.phone?.trim() || '')
      if (photoFile) formData.append('profile', photoFile)

      const result = await api.patch(
        apiPath.updateProfile,
        formData,
        'Unable to update your profile',
      )
      const profileResult = await api.get(
        apiPath.profile,
        'Unable to load your profile',
      )
      const nextProfile = formatUser(profileResult.user || {})
      dispatch(updateProfile(nextProfile))
      dispatch(syncUser(nextProfile))
      setPhotoFile(null)
      toast.success(result.message || 'Profile changes saved')
    } catch (error) {
      toast.error(error.message || 'Unable to update your profile')
      throw error
    }
  }

  const updatePassword = async (values, actions) => {
    try {
      const result = await api.patch(
        apiPath.updatePassword,
        { password: values.newPassword },
        'Unable to update the password',
      )
      actions.resetForm()
      toast.success(result.message || 'Password updated successfully')
    } catch (error) {
      toast.error(error.message || 'Unable to update the password')
    }
  }

  const profileForm = Formhandel({
    initialValue: {
      name: profile.name || '',
      email: profile.email || '',
      jobTitle: profile.jobTitle || '',
      phone: profile.phone || '',
    },
    schema: profileSchema,
    submitFunction: saveProfile,
    enableReinitialize: true,
  })

  const passwordForm = Formhandel({
    initialValue: { newPassword: '', confirmPassword: '' },
    schema: passwordSchema,
    submitFunction: updatePassword,
  })

  const updatePhoto = (event) => {
    const file = event.target.files[0]
    if (!file || file.size > 1_500_000) {
      toast.error('Choose an image smaller than 1.5 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoFile(file)
      dispatch(updateProfile({ avatar: reader.result }))
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
    profileForm,
    passwordForm,
    updatePhoto,
    changeTheme,
  }
}
