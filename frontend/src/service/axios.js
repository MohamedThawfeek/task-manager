import axios from 'axios'
import { loadStoredAuth } from './authStorage'
import { apiPath } from './path'

const API_BASE_URL = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5001/v1'

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  const message = error.response?.data?.message
  if (typeof message === 'string') return message
  if (message && typeof message === 'object') return Object.values(message).join(' ')
  return error.message || fallback
}

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

const publicPaths = [
  apiPath.login,
  apiPath.register,
  apiPath.forgotPassword,
  apiPath.resetPassword,
]

instance.interceptors.request.use((config) => {
  const token = loadStoredAuth()?.token
  const pathname = new URL(config.url || '', config.baseURL || API_BASE_URL).pathname
  const isPublicPath = publicPaths.some((path) => pathname.endsWith(path))

  if (token && !isPublicPath) config.headers.Authorization = `Bearer ${token}`
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    config.headers.setContentType(undefined)
  }
  return config
})

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem('taskflow_auth')
      window.sessionStorage.removeItem('taskflow_auth')
      window.dispatchEvent(new Event('taskflow:unauthorized'))
    }
    return Promise.reject(error)
  },
)

const responseBody = (response) => response.data

const ApiRequest = {
  get: (url, headers = {}) => instance.get(url, { headers }).then(responseBody),
  post: (url, body, headers = {}) => instance.post(url, body, { headers }).then(responseBody),
  put: (url, body, headers = {}) => instance.put(url, body, { headers }).then(responseBody),
  patch: (url, body, headers = {}) => instance.patch(url, body, { headers }).then(responseBody),
  delete: (url, body, headers = {}) => instance.delete(url, { data: body, headers }).then(responseBody),
}

export { instance }
export default ApiRequest
