import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1`
  : '/api/v1'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common.Authorization
  }
}

const TOKEN_KEY = 'cpi_token'

export function loadStoredToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function persistToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export function getApiErrorMessage(error) {
  const msg = error.response?.data?.error?.message
  if (msg) return msg
  if (error.response?.data?.error?.details?.length) {
    const d = error.response.data.error.details[0]
    return d.msg || d.message || 'Validation error'
  }
  return error.message || 'Request failed'
}
