import axios from 'axios'
import { AUTH_STORAGE_KEY, readStoredToken } from '@/services/authToken'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3005',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = readStoredToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Un 401 en un endpoint protegido significa que el token expiró o ya no es válido.
// Los 401 de /auth/login o /auth/register son credenciales inválidas, no expiración de sesión.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/')
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)
