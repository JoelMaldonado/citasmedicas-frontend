<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Doctor } from '@/types/doctor.types'
import { useDoctorsStore } from '@/stores/doctors.store'

const doctorsStore = useDoctorsStore()
const router = useRouter()
const toast = useToast()

onMounted(() => doctorsStore.ensureLoaded())

const selectedDoctor = ref<Doctor | null>(null)
const showDetail = ref(false)

function viewDetail(doctor: Doctor) {
  selectedDoctor.value = doctor
  showDetail.value = true
}

function handleEdit() {
  toast.add({ severity: 'info', summary: 'Próximamente', detail: 'La edición de médicos estará disponible pronto.', life: 3000 })
}
</script>

<template>
  <div class="page">
    <div class="page-header page-header--row">
      <div>
        <h1>Médicos</h1>
        <p>Administra los médicos registrados en el sistema.</p>
      </div>
      <Button label="Nuevo médico" icon="pi pi-user-plus" @click="router.push('/admin/doctors/create')" />
    </div>

    <DataTable :value="doctorsStore.doctors" :loading="doctorsStore.isLoading" paginator :rows="8" data-key="id">
      <Column field="fullName" header="Nombre" />
      <Column field="email" header="Correo" />
      <Column field="specialty" header="Especialidad" />
      <Column header="Acciones">
        <template #body="{ data }">
          <div class="row-actions">
            <Button label="Ver detalle" text size="small" @click="viewDetail(data)" />
            <Button label="Editar" text size="small" severity="secondary" @click="handleEdit" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="showDetail" modal header="Detalle del médico" :style="{ width: '380px' }">
      <div v-if="selectedDoctor" class="doctor-detail">
        <p><strong>Nombre:</strong> {{ selectedDoctor.fullName }}</p>
        <p><strong>Correo:</strong> {{ selectedDoctor.email }}</p>
        <p><strong>Especialidad:</strong> {{ selectedDoctor.specialty }}</p>
      </div>
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

.row-actions {
  display: flex;
  gap: 0.4rem;
}

.doctor-detail p {
  margin: 0 0 0.6rem;
  color: #334155;
}
</style>
