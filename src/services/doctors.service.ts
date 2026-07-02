import type { Doctor } from '@/types/doctor.types'
import { api } from '@/services/api'
import { extractErrorMessage } from '@/services/httpError'

export interface CreateDoctorPayload {
  fullName: string
  email: string
  password: string
  specialty: string
}

interface ApiDoctor {
  id: string
  specialty: string
  user: {
    id: string
    email: string
    fullName: string
  }
}

function toDoctor(apiDoctor: ApiDoctor): Doctor {
  return {
    id: apiDoctor.id,
    fullName: apiDoctor.user.fullName,
    email: apiDoctor.user.email,
    specialty: apiDoctor.specialty,
  }
}

export const doctorsService = {
  async getAll(): Promise<Doctor[]> {
    try {
      const { data } = await api.get<ApiDoctor[]>('/doctors')
      return data.map(toDoctor)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo cargar la lista de médicos.'))
    }
  },

  async getById(id: string): Promise<Doctor | undefined> {
    try {
      const { data } = await api.get<ApiDoctor>(`/doctors/${id}`)
      return toDoctor(data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo cargar el médico.'))
    }
  },

  // El backend no expone un endpoint "/doctors/me": se resuelve buscando
  // en la lista completa al médico cuyo user.id coincide con el usuario logueado.
  async getByUserId(userId: string): Promise<Doctor | undefined> {
    try {
      const { data } = await api.get<ApiDoctor[]>('/doctors')
      const match = data.find((item) => item.user.id === userId)
      return match ? toDoctor(match) : undefined
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo obtener tu perfil de médico.'))
    }
  },

  async create(payload: CreateDoctorPayload): Promise<void> {
    try {
      await api.post('/doctors', payload)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo registrar el médico.'))
    }
  },
}
