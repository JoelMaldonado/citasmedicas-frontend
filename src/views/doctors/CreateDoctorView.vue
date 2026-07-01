<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useDoctorsStore } from '@/stores/doctors.store'

const SPECIALTIES = ['Cardiología', 'Pediatría', 'Dermatología', 'Medicina General', 'Ginecología', 'Traumatología']

const doctorsStore = useDoctorsStore()
const router = useRouter()
const toast = useToast()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  specialty: '',
  licenseNumber: '',
})

const errors = reactive({
  fullName: '',
  email: '',
  password: '',
  specialty: '',
  licenseNumber: '',
})

const isSubmitting = ref(false)
const submitError = ref('')

function validate(): boolean {
  errors.fullName = form.fullName ? '' : 'El nombre completo es obligatorio.'
  errors.email = /^\S+@\S+\.\S+$/.test(form.email) ? '' : 'Ingresa un correo válido.'
  errors.password = form.password.length >= 6 ? '' : 'La contraseña debe tener al menos 6 caracteres.'
  errors.specialty = form.specialty ? '' : 'Selecciona una especialidad.'
  errors.licenseNumber = form.licenseNumber ? '' : 'El número de colegiatura es obligatorio.'

  return Object.values(errors).every((error) => !error)
}

async function handleSubmit() {
  if (!validate()) return

  submitError.value = ''
  isSubmitting.value = true
  try {
    await doctorsStore.createDoctor({ ...form })
    toast.add({ severity: 'success', summary: 'Médico registrado', detail: `${form.fullName} fue dado de alta correctamente.`, life: 4000 })
    router.push('/admin/doctors')
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'No se pudo registrar el médico. Intenta nuevamente.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <Button icon="pi pi-arrow-left" text label="Volver a médicos" @click="router.push('/admin/doctors')" />
      <h1>Nuevo médico</h1>
      <p>Registra un nuevo médico en el sistema.</p>
    </div>

    <Card class="doctor-form-card">
      <template #content>
        <form class="doctor-form" @submit.prevent="handleSubmit">
          <div class="field">
            <label for="fullName">Nombre completo</label>
            <InputText id="fullName" v-model="form.fullName" placeholder="Dr(a). Nombre Apellido" :invalid="!!errors.fullName" />
            <small v-if="errors.fullName" class="field__error">{{ errors.fullName }}</small>
          </div>

          <div class="field">
            <label for="email">Correo electrónico</label>
            <InputText id="email" v-model="form.email" placeholder="correo@citasmedicas.com" :invalid="!!errors.email" />
            <small v-if="errors.email" class="field__error">{{ errors.email }}</small>
          </div>

          <div class="field">
            <label for="password">Contraseña temporal</label>
            <Password id="password" v-model="form.password" :feedback="false" toggle-mask :invalid="!!errors.password" fluid />
            <small v-if="errors.password" class="field__error">{{ errors.password }}</small>
          </div>

          <div class="field">
            <label for="specialty">Especialidad</label>
            <Select id="specialty" v-model="form.specialty" :options="SPECIALTIES" placeholder="Selecciona una especialidad" :invalid="!!errors.specialty" fluid />
            <small v-if="errors.specialty" class="field__error">{{ errors.specialty }}</small>
          </div>

          <div class="field">
            <label for="licenseNumber">Número de colegiatura</label>
            <InputText id="licenseNumber" v-model="form.licenseNumber" placeholder="CMP-00000" :invalid="!!errors.licenseNumber" />
            <small v-if="errors.licenseNumber" class="field__error">{{ errors.licenseNumber }}</small>
          </div>

          <Message v-if="submitError" severity="error" :closable="false">{{ submitError }}</Message>

          <Button type="submit" label="Registrar médico" icon="pi pi-user-plus" :loading="isSubmitting" class="doctor-form__submit" />
        </form>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.doctor-form-card {
  max-width: 480px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1.1rem;
}

.field label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}

.field__error {
  color: #dc2626;
  font-size: 0.78rem;
}

.doctor-form__submit {
  width: 100%;
  margin-top: 0.25rem;
}
</style>
