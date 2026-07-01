<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { Appointment } from '@/types/appointment.types'
import { useAppointments } from '@/composables/useAppointments'
import { getEffectiveStatus } from '@/utils/appointmentStatus'
import StatusBadge from '@/components/appointments/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const { appointments, isLoading, ensureLoaded, cancelAppointment } = useAppointments()
const toast = useToast()

const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const appointmentToCancel = ref<Appointment | null>(null)

onMounted(ensureLoaded)

function canCancel(appointment: Appointment): boolean {
  const status = getEffectiveStatus(appointment)
  return status === 'pending' || status === 'confirmed'
}

function openCancelDialog(appointment: Appointment) {
  appointmentToCancel.value = appointment
  showCancelConfirm.value = true
}

async function handleCancel() {
  if (!appointmentToCancel.value) return
  isCancelling.value = true
  try {
    await cancelAppointment(appointmentToCancel.value.id)
    showCancelConfirm.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: error instanceof Error ? error.message : 'No se pudo cancelar la cita.',
      life: 4000,
    })
  } finally {
    isCancelling.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Mis citas</h1>
      <p>Consulta el estado de tus citas médicas.</p>
    </div>

    <EmptyState
      v-if="!isLoading && appointments.length === 0"
      icon="pi pi-calendar-times"
      title="No hay citas todavía"
      message="Solicita tu primera cita desde la sección de médicos."
    />

    <DataTable v-else :value="appointments" :loading="isLoading" paginator :rows="8" data-key="id">
      <Column field="doctorName" header="Médico" />
      <Column field="specialty" header="Especialidad" />
      <Column field="date" header="Fecha" />
      <Column header="Hora">
        <template #body="{ data }">{{ data.startTime }} - {{ data.endTime }}</template>
      </Column>
      <Column header="Estado">
        <template #body="{ data }"><StatusBadge :status="getEffectiveStatus(data)" /></template>
      </Column>
      <Column header="Acciones">
        <template #body="{ data }">
          <Button
            v-if="canCancel(data)"
            label="Cancelar"
            severity="danger"
            text
            size="small"
            @click="openCancelDialog(data)"
          />
        </template>
      </Column>
    </DataTable>

    <ConfirmDialog
      v-model:visible="showCancelConfirm"
      title="Cancelar cita"
      :message="`¿Seguro que deseas cancelar tu cita con ${appointmentToCancel?.doctorName}?`"
      confirm-label="Sí, cancelar"
      severity="danger"
      :loading="isCancelling"
      @confirm="handleCancel"
    />
  </div>
</template>
