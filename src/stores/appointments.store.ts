import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Appointment } from '@/types/appointment.types'
import { appointmentsService } from '@/services/appointments.service'

export interface CreateAppointmentInput {
  slotId: string
  doctorId: string
  doctorName: string
  patientName: string
  specialty: string
  date: string
  startTime: string
  endTime: string
  reason?: string
}

export interface RescheduleSlotInput {
  id: string
  date: string
  startTime: string
  endTime: string
}

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref<Appointment[]>([])
  const isLoading = ref(false)
  const hasLoaded = ref(false)

  async function fetchAll() {
    isLoading.value = true
    try {
      appointments.value = await appointmentsService.getMyAppointments()
      hasLoaded.value = true
    } finally {
      isLoading.value = false
    }
  }

  async function ensureLoaded() {
    if (hasLoaded.value) return
    try {
      await fetchAll()
    } catch {
      // La vista queda con la lista vacía y su propio EmptyState se encarga de comunicarlo.
    }
  }

  // El endpoint de creación no devuelve el médico/paciente/horario anidados,
  // así que la fila se arma localmente con los datos que la vista ya conocía.
  async function createAppointment(payload: CreateAppointmentInput) {
    const created = await appointmentsService.create({ slotId: payload.slotId, reason: payload.reason })
    const appointment: Appointment = {
      id: created.id,
      doctorId: payload.doctorId,
      patientId: '',
      doctorName: payload.doctorName,
      patientName: payload.patientName,
      specialty: payload.specialty,
      date: payload.date,
      startTime: payload.startTime,
      endTime: payload.endTime,
      status: created.status,
      reason: payload.reason,
    }
    appointments.value.unshift(appointment)
    return appointment
  }

  async function confirmAppointment(id: string) {
    await appointmentsService.confirm(id)
    const appointment = appointments.value.find((item) => item.id === id)
    if (appointment) appointment.status = 'confirmed'
  }

  async function rejectAppointment(id: string) {
    await appointmentsService.reject(id)
    const appointment = appointments.value.find((item) => item.id === id)
    if (appointment) appointment.status = 'rejected'
  }

  async function cancelAppointment(id: string) {
    await appointmentsService.cancel(id)
    const appointment = appointments.value.find((item) => item.id === id)
    if (appointment) appointment.status = 'cancelled'
  }

  async function rescheduleAppointment(id: string, slot: RescheduleSlotInput) {
    await appointmentsService.reschedule(id, slot.id)
    const appointment = appointments.value.find((item) => item.id === id)
    if (appointment) {
      appointment.date = slot.date
      appointment.startTime = slot.startTime
      appointment.endTime = slot.endTime
    }
  }

  return {
    appointments,
    isLoading,
    hasLoaded,
    fetchAll,
    ensureLoaded,
    createAppointment,
    confirmAppointment,
    rejectAppointment,
    cancelAppointment,
    rescheduleAppointment,
  }
})
