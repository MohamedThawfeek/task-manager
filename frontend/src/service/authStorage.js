const AUTH_KEY = 'taskflow_auth'

function parseAuth(value) {
  try {
    return value ? JSON.parse(value) : null
  } catch {
    return null
  }
}

export function loadStoredAuth() {
  return parseAuth(window.localStorage.getItem(AUTH_KEY))
    || parseAuth(window.sessionStorage.getItem(AUTH_KEY))
}

export function saveStoredAuth(auth) {
  if (!auth?.token) return clearStoredAuth()

  if (auth.remember) {
    window.localStorage.setItem(AUTH_KEY, JSON.stringify(auth))
    window.sessionStorage.removeItem(AUTH_KEY)
  } else {
    window.localStorage.removeItem(AUTH_KEY)
    window.sessionStorage.setItem(AUTH_KEY, JSON.stringify(auth))
  }
  return auth
}

export function clearStoredAuth() {
  window.localStorage.removeItem(AUTH_KEY)
  window.sessionStorage.removeItem(AUTH_KEY)
}
