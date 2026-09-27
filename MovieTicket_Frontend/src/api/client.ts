import axios from 'axios'
import type { ApiError } from '../types'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5075'

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mt_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      const hadToken = !!localStorage.getItem('mt_token')
      if (hadToken && !error.config?.url?.includes('/auth/login')) {
        localStorage.removeItem('mt_token')
        localStorage.removeItem('mt_user')
        if (!window.location.pathname.startsWith('/login')) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`
        }
      }
    }
    const data = error.response?.data as ApiError | undefined
    const message =
      data?.message ||
      (status === 403
        ? 'You do not have permission to do that.'
        : status === 404
          ? 'Resource not found.'
          : status === 409
            ? data?.message || 'Conflict — please try again.'
            : !error.response
              ? 'Cannot reach the server. Is the backend running?'
              : 'Something went wrong. Please try again.')
    return Promise.reject({ ...error, friendlyMessage: message, apiError: data })
  },
)

export function getErrorMessage(err: unknown, fallback = 'Something went wrong') {
  if (err && typeof err === 'object' && 'friendlyMessage' in err) {
    return String((err as { friendlyMessage: string }).friendlyMessage)
  }
  return fallback
}
