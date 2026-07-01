import { onMounted, onUnmounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { connectSocket } from '@/services/realtime'
import { useAppointmentsStore } from '@/stores/appointments.store'

interface AppointmentCreatedPayload {
  appointmentId: string
  patientName: string
  reason?: string
}

interface AppointmentStatusChangedPayload {
  appointmentId: string
  status: 'confirmed' | 'rejected' | 'cancelled'
}

interface AppointmentRescheduledPayload {
  appointmentId: string
  date: string
  startTime: string
  endTime: string
}

const STATUS_LABELS: Record<AppointmentStatusChangedPayload['status'], string> = {
  confirmed: 'confirmada',
  rejected: 'rechazada',
  cancelled: 'cancelada',
}

// Se monta una sola vez desde DashboardLayout: cubre toda la sesión autenticada,
// sin importar en qué pantalla esté el usuario cuando llega la notificación.
export function useRealtimeAppointments() {
  const toast = useToast()
  const store = useAppointmentsStore()

  function handleCreated(payload: AppointmentCreatedPayload) {
    toast.add({
      severity: 'info',
      summary: 'Nueva solicitud de cita',
      detail: `${payload.patientName} solicitó una cita${payload.reason ? `: ${payload.reason}` : '.'}`,
      life: 6000,
    })
    store.fetchAll()
  }

  function handleStatusChanged(payload: AppointmentStatusChangedPayload) {
    toast.add({
      severity: payload.status === 'confirmed' ? 'success' : 'warn',
      summary: `Tu cita fue ${STATUS_LABELS[payload.status]}`,
      life: 6000,
    })
    store.fetchAll()
  }

  function handleRescheduled(payload: AppointmentRescheduledPayload) {
    toast.add({
      severity: 'info',
      summary: 'Tu cita fue reagendada',
      detail: `Nuevo horario: ${payload.date} · ${payload.startTime} - ${payload.endTime}`,
      life: 6000,
    })
    store.fetchAll()
  }

  const socket = connectSocket()

  onMounted(() => {
    socket.on('appointment:created', handleCreated)
    socket.on('appointment:statusChanged', handleStatusChanged)
    socket.on('appointment:rescheduled', handleRescheduled)
  })

  onUnmounted(() => {
    socket.off('appointment:created', handleCreated)
    socket.off('appointment:statusChanged', handleStatusChanged)
    socket.off('appointment:rescheduled', handleRescheduled)
  })
}
