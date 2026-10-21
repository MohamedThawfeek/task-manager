import { profileSeed } from '../data/seed'
import ApiRequest, { getApiErrorMessage, instance } from './axios'
import { apiPath } from './path'

function ensureSuccess(response, fallback) {
  if (!response?.status) throw new Error(response?.message || fallback)
  return response
}

export async function loginUser({ email, password, remember }) {
  try {
    const response = ensureSuccess(
      await ApiRequest.post(apiPath.login, { email, password }),
      'Unable to sign in',
    )
    if (!response.token) throw new Error('The login response did not include a token')

    let user = { ...profileSeed, email }
    try {
      const profileResponse = await instance.get(apiPath.profile, {
        headers: { Authorization: `Bearer ${response.token}` },
      })
      if (profileResponse.data?.user) {
        const backendUser = profileResponse.data.user
        user = {
          ...user,
          ...backendUser,
          id: backendUser._id || backendUser.id || user.id,
          jobTitle: backendUser.role || user.jobTitle,
        }
      }
    } catch {
      // A profile request failure does not invalidate a successful login.
    }

    return {
      user,
      token: response.token,
      remember: Boolean(remember),
      message: response.message,
    }
  } catch (error) {
    if (!error.response && error.message && error.code !== 'ERR_NETWORK') throw error
    throw new Error(getApiErrorMessage(error, 'Unable to sign in'))
  }
}

export async function registerUser({ name, email, phone, password }) {
  try {
    return ensureSuccess(
      await ApiRequest.post(apiPath.register, {
        name,
        email,
        password,
        phone,
        role: 'Team Member',
        access: 'User',
        status: 'Active',
      }),
      'Unable to create your account',
    )
  } catch (error) {
    if (!error.response && error.message && error.code !== 'ERR_NETWORK') throw error
    throw new Error(getApiErrorMessage(error, 'Unable to create your account'))
  }
}

export async function sendForgotPassword(email) {
  try {
    return ensureSuccess(
      await ApiRequest.post(apiPath.forgotPassword, { email }),
      'Unable to send the reset link',
    )
  } catch (error) {
    if (!error.response && error.message && error.code !== 'ERR_NETWORK') throw error
    throw new Error(getApiErrorMessage(error, 'Unable to send the reset link'))
  }
}

export async function submitResetPassword(token, password) {
  try {
    return ensureSuccess(
      await ApiRequest.put(apiPath.resetPassword, { token, password }),
      'Unable to reset the password',
    )
  } catch (error) {
    if (!error.response && error.message && error.code !== 'ERR_NETWORK') throw error
    throw new Error(getApiErrorMessage(error, 'Unable to reset the password'))
  }
}

export async function updateAccountPassword(password) {
  try {
    return ensureSuccess(
      await ApiRequest.patch(apiPath.updatePassword, { password }),
      'Unable to update the password',
    )
  } catch (error) {
    if (!error.response && error.message && error.code !== 'ERR_NETWORK') throw error
    throw new Error(getApiErrorMessage(error, 'Unable to update the password'))
  }
}
