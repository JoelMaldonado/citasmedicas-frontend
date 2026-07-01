import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { User } from '@/types/user.types'
import { authService, type LoginPayload, type RegisterPayload } from '@/services/auth.service'
import { AUTH_STORAGE_KEY } from '@/services/authToken'

interface StoredAuth {
  user: User
  token: string
}

function readStoredAuth(): StoredAuth | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as StoredAuth
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = readStoredAuth()

  const user = ref<User | null>(stored?.user ?? null)
  const token = ref<string | null>(stored?.token ?? null)
  const isLoading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const role = computed(() => user.value?.role ?? null)

  async function login(payload: LoginPayload) {
    isLoading.value = true
    try {
      const result = await authService.login(payload)
      user.value = result.user
      token.value = result.token
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result))
    } finally {
      isLoading.value = false
    }
  }

  async function register(payload: RegisterPayload) {
    isLoading.value = true
    try {
      const result = await authService.register(payload)
      user.value = result.user
      token.value = result.token
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(result))
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return { user, token, isLoading, isAuthenticated, role, login, register, logout }
})
