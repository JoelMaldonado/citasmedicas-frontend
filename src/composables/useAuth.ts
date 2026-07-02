import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import type { LoginPayload, RegisterPayload } from '@/services/auth.service'
import { disconnectSocket } from '@/services/realtime'

export function useAuth() {
  const store = useAuthStore()
  const router = useRouter()

  const user = computed(() => store.user)
  const role = computed(() => store.role)
  const isAuthenticated = computed(() => store.isAuthenticated)
  const isLoading = computed(() => store.isLoading)

  async function login(payload: LoginPayload) {
    await store.login(payload)
    if (store.role === 'admin') await router.push('/admin/doctors')
    else if (store.role === 'patient') await router.push('/appointments')
    else await router.push('/doctor/appointments')
  }

  async function register(payload: RegisterPayload) {
    await store.register(payload)
    await router.push('/appointments')
  }

  async function logout() {
    store.logout()
    disconnectSocket()
    await router.push('/login')
  }

  return { user, role, isAuthenticated, isLoading, login, register, logout }
}
