import type { Patient } from '@/types/patient.types'
import { api } from '@/services/api'
import { extractErrorMessage } from '@/services/httpError'

interface ApiPatient {
  id: string
  phone: string | null
  birthDate: string | null
  user: {
    id: string
    email: string
    fullName: string
  }
}

function toPatient(apiPatient: ApiPatient): Patient {
  return {
    id: apiPatient.id,
    fullName: apiPatient.user.fullName,
    email: apiPatient.user.email,
    phone: apiPatient.phone ?? '',
    birthDate: apiPatient.birthDate ?? '',
  }
}

export const patientsService = {
  async getAll(): Promise<Patient[]> {
    try {
      const { data } = await api.get<ApiPatient[]>('/patients')
      return data.map(toPatient)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo cargar la lista de pacientes.'))
    }
  },

  async getById(id: string): Promise<Patient | undefined> {
    try {
      const { data } = await api.get<ApiPatient>(`/patients/${id}`)
      return toPatient(data)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo cargar el paciente.'))
    }
  },
}
