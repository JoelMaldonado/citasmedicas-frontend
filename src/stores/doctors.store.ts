import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Doctor } from '@/types/doctor.types'
import { doctorsService, type CreateDoctorPayload } from '@/services/doctors.service'

export const useDoctorsStore = defineStore('doctors', () => {
  const doctors = ref<Doctor[]>([])
  const isLoading = ref(false)
  const hasLoaded = ref(false)

  async function fetchAll() {
    isLoading.value = true
    try {
      doctors.value = await doctorsService.getAll()
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

  async function createDoctor(payload: CreateDoctorPayload) {
    await doctorsService.create(payload)
    try {
      await fetchAll()
    } catch {
      // El alta ya se realizó; si el refresco de la lista falla, se reintentará al reabrir la vista.
    }
  }

  return { doctors, isLoading, hasLoaded, fetchAll, ensureLoaded, createDoctor }
})
