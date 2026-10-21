import ApiRequest, { getApiErrorMessage } from './axios'
import { apiPath } from './path'

function ensureSuccess(response, fallback) {
  if (!response?.status) throw new Error(response?.message || fallback)
  return response
}

function normalizeUser(user) {
  const name = user.name || user.email?.split('@')[0] || 'Unnamed User'
  return {
    ...user,
    id: user._id || user.id,
    name,
    phone: user.phone || '',
    role: user.role || 'Team Member',
    access: user.access || 'User',
    status: user.status || 'Active',
    avatar: name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
  }
}

function serviceError(error, fallback) {
  if (!error.response && error.message && error.code !== 'ERR_NETWORK') return error
  return new Error(getApiErrorMessage(error, fallback))
}

export async function getUsers() {
  try {
    const response = ensureSuccess(await ApiRequest.get(apiPath.users), 'Unable to load users')
    return Array.isArray(response.users) ? response.users.map(normalizeUser) : []
  } catch (error) {
    throw serviceError(error, 'Unable to load users')
  }
}

export async function createUser(payload) {
  try {
    return ensureSuccess(await ApiRequest.post(apiPath.createUser, payload), 'Unable to create user')
  } catch (error) {
    throw serviceError(error, 'Unable to create user')
  }
}

export async function updateUser(payload) {
  try {
    return ensureSuccess(await ApiRequest.patch(apiPath.updateUser, payload), 'Unable to update user')
  } catch (error) {
    throw serviceError(error, 'Unable to update user')
  }
}

export async function deleteUser(id) {
  try {
    return ensureSuccess(await ApiRequest.delete(apiPath.deleteUser, { id }), 'Unable to delete user')
  } catch (error) {
    throw serviceError(error, 'Unable to delete user')
  }
}
