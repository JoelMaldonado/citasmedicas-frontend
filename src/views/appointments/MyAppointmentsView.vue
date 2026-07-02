<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { Appointment } from '@/types/appointment.types'
import type { DoctorSlot } from '@/types/slot.types'
import { useAppointments } from '@/composables/useAppointments'
import { useDoctorsStore } from '@/stores/doctors.store'
import { slotsService } from '@/services/slots.service'
import { getEffectiveStatus } from '@/utils/appointmentStatus'
import StatusBadge from '@/components/appointments/StatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const { appointments, isLoading, ensureLoaded, cancelAppointment, requestAppointment } = useAppointments()
const doctorsStore = useDoctorsStore()
const toast = useToast()

onMounted(() => {
  ensureLoaded()
  doctorsStore.ensureLoaded()
})

function canCancel(appointment: Appointment): boolean {
  const status = getEffectiveStatus(appointment)
  return status === 'pending' || status === 'confirmed'
}

// Cancelar cita
const showCancelConfirm = ref(false)
const isCancelling = ref(false)
const appointmentToCancel = ref<Appointment | null>(null)

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

// Crear cita: médico -> horario -> motivo, todo en un solo diálogo
const showCreateDialog = ref(false)
const selectedDoctorId = ref<string | null>(null)
const slots = ref<DoctorSlot[]>([])
const isLoadingSlots = ref(false)
const selectedSlotId = ref<string | null>(null)
const reason = ref('')
const isSubmitting = ref(false)

const doctors = computed(() => doctorsStore.doctors)
const selectedDoctor = computed(() => doctors.value.find((doctor) => doctor.id === selectedDoctorId.value) ?? null)
const selectedSlot = computed(() => slots.value.find((slot) => slot.id === selectedSlotId.value) ?? null)

const slotsByDate = computed(() => {
  const groups = new Map<string, DoctorSlot[]>()
  for (const slot of slots.value) {
    const group = groups.get(slot.date) ?? []
    group.push(slot)
    groups.set(slot.date, group)
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
})

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

function openCreateDialog() {
  selectedDoctorId.value = null
  slots.value = []
  selectedSlotId.value = null
  reason.value = ''
  showCreateDialog.value = true
}

watch(selectedDoctorId, async (doctorId) => {
  selectedSlotId.value = null
  slots.value = []
  if (!doctorId) return

  isLoadingSlots.value = true
  try {
    slots.value = await slotsService.getByDoctor(doctorId)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: error instanceof Error ? error.message : 'No se pudieron cargar los horarios.',
      life: 4000,
    })
  } finally {
    isLoadingSlots.value = false
  }
})

async function handleCreateAppointment() {
  if (!selectedDoctor.value || !selectedSlot.value) return

  isSubmitting.value = true
  try {
    await requestAppointment({
      slotId: selectedSlot.value.id,
      doctorId: selectedDoctor.value.id,
      doctorName: selectedDoctor.value.fullName,
      specialty: selectedDoctor.value.specialty,
      date: selectedSlot.value.date,
      startTime: selectedSlot.value.startTime,
      endTime: selectedSlot.value.endTime,
      reason: reason.value || undefined,
    })
    showCreateDialog.value = false
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: error instanceof Error ? error.message : 'No se pudo solicitar la cita.',
      life: 4000,
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header page-header--row">
      <div>
        <h1>Mis citas</h1>
        <p>Consulta el estado de tus citas médicas.</p>
      </div>
      <Button label="Crear cita" icon="pi pi-plus" @click="openCreateDialog" />
    </div>

    <EmptyState
      v-if="!isLoading && appointments.length === 0"
      icon="pi pi-calendar-times"
      title="No hay citas todavía"
      message="Crea tu primera cita con el botón de arriba."
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

    <Dialog v-model:visible="showCreateDialog" modal header="Crear cita" :style="{ width: '480px' }">
      <div class="field">
        <label for="doctor">Médico</label>
        <Select
          id="doctor"
          v-model="selectedDoctorId"
          :options="doctors"
          option-label="fullName"
          option-value="id"
          placeholder="Selecciona un médico"
          :loading="doctorsStore.isLoading"
          fluid
        >
          <template #option="{ option }">{{ option.fullName }} · {{ option.specialty }}</template>
        </Select>
      </div>

      <div v-if="selectedDoctorId" class="field">
        <label>Horario</label>
        <div v-if="isLoadingSlots" class="loading">Cargando horarios...</div>
        <EmptyState
          v-else-if="slotsByDate.length === 0"
          icon="pi pi-calendar-times"
          title="Sin horarios disponibles"
          message="Este médico no tiene horarios libres por el momento."
        />
        <div v-else class="slots-scroll">
          <div v-for="[date, daySlots] in slotsByDate" :key="date" class="day-block">
            <p class="day-block__date">{{ formatDate(date) }}</p>
            <div class="slot-grid">
              <Button
                v-for="slot in daySlots"
                :key="slot.id"
                :label="slot.startTime"
                size="small"
                :outlined="selectedSlotId !== slot.id"
                @click="selectedSlotId = slot.id"
              />
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedSlotId" class="field">
        <label for="reason">Motivo de la consulta (opcional)</label>
        <Textarea id="reason" v-model="reason" rows="2" fluid placeholder="Describe brevemente el motivo de tu consulta" />
      </div>

      <template #footer>
        <Button label="Cancelar" text severity="secondary" @click="showCreateDialog = false" />
        <Button
          label="Solicitar cita"
          icon="pi pi-check"
          :disabled="!selectedSlot"
          :loading="isSubmitting"
          @click="handleCreateAppointment"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.page-header--row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.1rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.loading {
  color: #64748b;
  font-size: 0.9rem;
}

.slots-scroll {
  max-height: 240px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.day-block {
  margin-bottom: 0.85rem;
}

.day-block__date {
  margin: 0 0 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #475569;
  text-transform: capitalize;
}

.slot-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
