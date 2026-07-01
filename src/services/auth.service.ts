import type { User } from '@/types/user.types'
import { api } from '@/services/api'
import { extractErrorMessage } from '@/services/httpError'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
}

export interface AuthResult {
  user: User
  token: string
}

interface AuthApiResponse {
  access_token: string
  user: User
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResult> {
    try {
      const { data } = await api.post<AuthApiResponse>('/auth/login', payload)
      return { user: data.user, token: data.access_token }
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo iniciar sesión. Intenta nuevamente.'))
    }
  },

  async register(payload: RegisterPayload): Promise<AuthResult> {
    try {
      const { data } = await api.post<AuthApiResponse>('/auth/register', payload)
      return { user: data.user, token: data.access_token }
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo completar el registro. Intenta nuevamente.'))
    }
  },
}
