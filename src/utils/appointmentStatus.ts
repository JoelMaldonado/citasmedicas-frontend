import type { Appointment, AppointmentStatus } from '@/types/appointment.types'

// El backend nunca marca una cita como "completed": no hay ningún endpoint para eso.
// Una cita confirmada cuya fecha/hora ya pasó se considera completada en la UI.
export function getEffectiveStatus(appointment: Appointment): AppointmentStatus {
  if (appointment.status !== 'confirmed') return appointment.status

  const appointmentEnd = new Date(`${appointment.date}T${appointment.endTime}`)
  return appointmentEnd.getTime() < Date.now() ? 'completed' : 'confirmed'
}
