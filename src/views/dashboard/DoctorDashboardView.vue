<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useAppointments } from '@/composables/useAppointments'
import { getEffectiveStatus } from '@/utils/appointmentStatus'
import StatCard from '@/components/common/StatCard.vue'

const authStore = useAuthStore()
const { appointments, ensureLoaded } = useAppointments()

onMounted(ensureLoaded)

const todayKey = new Date().toISOString().slice(0, 10)

const pendingCount = computed(() => appointments.value.filter((apt) => apt.status === 'pending').length)
const todayCount = computed(() => appointments.value.filter((apt) => apt.date === todayKey).length)
const patientsAttended = computed(
  () =>
    new Set(
      appointments.value.filter((apt) => getEffectiveStatus(apt) === 'completed').map((apt) => apt.patientId),
    ).size,
)
</script>

<template>
  <div class="page">
    <div class="page-header">
      <h1>Bienvenido, {{ authStore.user?.fullName }}</h1>
      <p>Resumen de tu actividad como médico.</p>
    </div>

    <div class="stat-grid">
      <StatCard icon="pi pi-hourglass" label="Pendientes por responder" :value="pendingCount" color="#d97706" />
      <StatCard icon="pi pi-calendar" label="Citas de hoy" :value="todayCount" color="#0284c7" />
      <StatCard icon="pi pi-users" label="Pacientes atendidos" :value="patientsAttended" color="#059669" />
    </div>
  </div>
</template>
