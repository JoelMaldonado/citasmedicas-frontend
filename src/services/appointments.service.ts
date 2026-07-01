import type { Appointment, AppointmentStatus } from '@/types/appointment.types'
import { api } from '@/services/api'
import { extractErrorMessage } from '@/services/httpError'

export interface CreateAppointmentPayload {
  slotId: string
  reason?: string
}

interface ApiAppointment {
  id: string
  doctorId: string
  patientId: string
  status: AppointmentStatus
  reason: string | null
  doctor?: { specialty: string; user: { fullName: string } }
  patient?: { user: { fullName: string } }
  slot?: { date: string; startTime: string; endTime: string }
}

function toAppointment(raw: ApiAppointment): Appointment {
  return {
    id: raw.id,
    doctorId: raw.doctorId,
    patientId: raw.patientId,
    doctorName: raw.doctor?.user.fullName ?? '',
    patientName: raw.patient?.user.fullName ?? '',
    specialty: raw.doctor?.specialty ?? '',
    date: raw.slot?.date ?? '',
    startTime: raw.slot?.startTime ?? '',
    endTime: raw.slot?.endTime ?? '',
    status: raw.status,
    reason: raw.reason ?? undefined,
  }
}

export const appointmentsService = {
  async getMyAppointments(): Promise<Appointment[]> {
    try {
      const { data } = await api.get<ApiAppointment[]>('/appointments/my-appointments')
      return data.map(toAppointment)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudieron cargar las citas.'))
    }
  },

  async create(payload: CreateAppointmentPayload): Promise<{ id: string; status: AppointmentStatus }> {
    try {
      const { data } = await api.post<ApiAppointment>('/appointments', payload)
      return { id: data.id, status: data.status }
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo solicitar la cita.'))
    }
  },

  async confirm(id: string): Promise<void> {
    try {
      await api.patch(`/appointments/${id}/confirm`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo confirmar la cita.'))
    }
  },

  async reject(id: string): Promise<void> {
    try {
      await api.patch(`/appointments/${id}/reject`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo rechazar la cita.'))
    }
  },

  async cancel(id: string): Promise<void> {
    try {
      await api.delete(`/appointments/${id}`)
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo cancelar la cita.'))
    }
  },

  async reschedule(id: string, newSlotId: string): Promise<void> {
    try {
      await api.patch(`/appointments/${id}/reschedule`, { newSlotId })
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'No se pudo reagendar la cita.'))
    }
  },
}
