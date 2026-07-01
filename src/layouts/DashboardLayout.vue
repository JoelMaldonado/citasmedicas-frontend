<script setup lang="ts">
import Sidebar from '@/components/layout/Sidebar.vue'
import Topbar from '@/components/layout/Topbar.vue'
import { useRealtimeAppointments } from '@/composables/useRealtimeAppointments'

useRealtimeAppointments()
</script>

<template>
  <div class="dashboard-layout">
    <Sidebar />
    <div class="dashboard-layout__main">
      <Topbar />
      <main class="dashboard-layout__content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.dashboard-layout__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.dashboard-layout__content {
  flex: 1;
}
</style>
