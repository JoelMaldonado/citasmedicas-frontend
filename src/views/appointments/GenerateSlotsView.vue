<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { slotsService } from '@/services/slots.service'
import { doctorsService } from '@/services/doctors.service'
import { useAuthStore } from '@/stores/auth.store'

const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  startDate: new Date(),
  days: 5,
})

const isGenerating = ref(false)

async function handleGenerate() {
  if (!authStore.user) return
  isGenerating.value = true
  try {
    const doctor = await doctorsService.getByUserId(authStore.user.id)
    if (!doctor) {
      toast.add({ severity: 'error', summary: 'No se encontró tu perfil de médico', life: 4000 })
      return
    }

    const result = await slotsService.generate(
      doctor.id,
      form.startDate.toISOString().slice(0, 10),
      form.days,
    )
    toast.add({
      severity: 'success',
      summary: 'Horarios generados',
      detail: `Se generaron ${result.createdCount} horarios nuevos (los que ya existían se omitieron).`,
      life: 4000,
    })
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: error instanceof Error ? error.message : 'No se pudieron generar los horarios.',
      life: 4000,
    })
  } finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Generar disponibilidad</h1>
      <p>Define un rango de días para publicar tus horarios de atención.</p>
    </div>

    <Card class="generate-card">
      <template #content>
        <div class="field">
          <label for="startDate">Fecha de inicio</label>
          <DatePicker id="startDate" v-model="form.startDate" show-icon date-format="dd/mm/yy" fluid />
        </div>

        <div class="field">
          <label for="days">Número de días</label>
          <InputNumber id="days" v-model="form.days" :min="1" :max="30" show-buttons fluid />
        </div>

        <Button
          label="Generar horarios"
          icon="pi pi-clock"
          :loading="isGenerating"
          class="generate-card__submit"
          @click="handleGenerate"
        />
      </template>
    </Card>
  </div>
</template>

<style scoped>
.generate-card {
  max-width: 420px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.generate-card__submit {
  width: 100%;
}
</style>
