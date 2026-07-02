import type { DoctorSlot } from '@/types/slot.types'
import { api } from '@/services/api'
import { extractErrorMessage } from '@/services/httpError'

export const slotsService = {
  async getByDoctor(doctorId: string): Promise<DoctorSlot[]> {
    try {
      const { data } = await api.get<DoctorSlot[]>(`/doctors/${doctorId}/available-slots`)
      return data
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudieron cargar los horarios disponibles.'))
    }
  },
}
