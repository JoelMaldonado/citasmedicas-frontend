import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Patient } from '@/types/patient.types'
import { patientsService } from '@/services/patients.service'

export const usePatientsStore = defineStore('patients', () => {
  const patients = ref<Patient[]>([])
  const isLoading = ref(false)
  const hasLoaded = ref(false)

  async function fetchAll() {
    isLoading.value = true
    try {
      patients.value = await patientsService.getAll()
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

  return { patients, isLoading, hasLoaded, fetchAll, ensureLoaded }
})
