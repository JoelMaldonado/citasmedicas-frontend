<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Doctor } from '@/types/doctor.types'
import type { DoctorSlot } from '@/types/slot.types'
import { doctorsService } from '@/services/doctors.service'
import { slotsService } from '@/services/slots.service'
import { useAppointments } from '@/composables/useAppointments'
import EmptyState from '@/components/common/EmptyState.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { requestAppointment } = useAppointments()

const doctorId = route.params.doctorId as string

const doctor = ref<Doctor | null>(null)
const slots = ref<DoctorSlot[]>([])
const isLoading = ref(true)
const selectedSlotId = ref<string | null>(null)
const reason = ref('')
const showConfirm = ref(false)
const isSubmitting = ref(false)

const availableSlots = computed(() => slots.value.filter((slot) => slot.status === 'available'))

const slotsByDate = computed(() => {
  const groups = new Map<string, DoctorSlot[]>()
  for (const slot of availableSlots.value) {
    const group = groups.get(slot.date) ?? []
    group.push(slot)
    groups.set(slot.date, group)
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
})

const selectedSlot = computed(() => slots.value.find((slot) => slot.id === selectedSlotId.value) ?? null)

function formatDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
}

onMounted(async () => {
  isLoading.value = true
  try {
    const [doctorResult, slotsResult] = await Promise.all([
      doctorsService.getById(doctorId),
      slotsService.getByDoctor(doctorId),
    ])
    doctor.value = doctorResult ?? null
    slots.value = slotsResult
  } catch {
    doctor.value = null
  } finally {
    isLoading.value = false
  }
})

function selectSlot(slotId: string) {
  selectedSlotId.value = slotId
}

async function handleConfirm() {
  if (!selectedSlot.value || !doctor.value) return
  isSubmitting.value = true
  try {
    await requestAppointment({
      slotId: selectedSlot.value.id,
      doctorId: doctor.value.id,
      doctorName: doctor.value.fullName,
      specialty: doctor.value.specialty,
      date: selectedSlot.value.date,
      startTime: selectedSlot.value.startTime,
      endTime: selectedSlot.value.endTime,
      reason: reason.value || undefined,
    })
    showConfirm.value = false
    router.push('/appointments')
  } catch (error) {
    showConfirm.value = false
    selectedSlotId.value = null
    toast.add({
      severity: 'error',
      summary: error instanceof Error ? error.message : 'No se pudo solicitar la cita.',
      life: 4000,
    })
    slots.value = await slotsService.getByDoctor(doctorId)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <Button icon="pi pi-arrow-left" text label="Volver a médicos" @click="router.push('/doctors')" />
      <h1 v-if="doctor">{{ doctor.fullName }}</h1>
      <p v-if="doctor">{{ doctor.specialty }}</p>
    </div>

    <div v-if="isLoading" class="loading">Cargando horarios disponibles...</div>

    <template v-else-if="doctor">
      <EmptyState
        v-if="slotsByDate.length === 0"
        icon="pi pi-calendar-times"
        title="No hay horarios disponibles"
        message="Este médico no tiene horarios libres por el momento."
      />

      <template v-else>
        <Card v-for="[date, daySlots] in slotsByDate" :key="date" class="day-card">
          <template #title>{{ formatDate(date) }}</template>
          <template #content>
            <div class="slot-grid">
              <Button
                v-for="slot in daySlots"
                :key="slot.id"
                :label="slot.startTime"
                :outlined="selectedSlotId !== slot.id"
                size="small"
                @click="selectSlot(slot.id)"
              />
            </div>
          </template>
        </Card>

        <Card class="reason-card">
          <template #title>Motivo de la consulta (opcional)</template>
          <template #content>
            <Textarea v-model="reason" rows="3" fluid placeholder="Describe brevemente el motivo de tu consulta" />
            <Button
              label="Solicitar cita"
              icon="pi pi-check"
              class="reason-card__submit"
              :disabled="!selectedSlot"
              @click="showConfirm = true"
            />
          </template>
        </Card>
      </template>
    </template>

    <EmptyState v-else icon="pi pi-exclamation-circle" title="Médico no encontrado" />

    <ConfirmDialog
      v-model:visible="showConfirm"
      title="Confirmar solicitud de cita"
      :message="
        selectedSlot
          ? `¿Confirmas tu cita con ${doctor?.fullName} el ${formatDate(selectedSlot.date)} a las ${selectedSlot.startTime}?`
          : ''
      "
      confirm-label="Solicitar cita"
      severity="success"
      :loading="isSubmitting"
      @confirm="handleConfirm"
    />
  </div>
</template>

<style scoped>
.loading {
  color: #64748b;
}

.day-card {
  margin-bottom: 1rem;
  text-transform: capitalize;
}

.slot-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  text-transform: none;
}

.reason-card {
  margin-top: 1.5rem;
}

.reason-card__submit {
  margin-top: 1rem;
}
</style>
