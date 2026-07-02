<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

interface NavItem {
  label: string
  to: string
  icon: string
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  patient: [
    { label: 'Mis citas', to: '/appointments', icon: 'pi pi-calendar' },
  ],
  doctor: [
    { label: 'Mis citas', to: '/doctor/appointments', icon: 'pi pi-calendar' },
  ],
  admin: [
    { label: 'Médicos', to: '/admin/doctors', icon: 'pi pi-users' },
  ],
}

const authStore = useAuthStore()
const route = useRoute()

const items = computed(() => NAV_ITEMS[authStore.role ?? ''] ?? [])

function isActive(to: string): boolean {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <i class="pi pi-heart-fill" />
      <span>CitasMedicas</span>
    </div>
    <nav class="sidebar__nav">
      <router-link
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="sidebar__item"
        :class="{ 'sidebar__item--active': isActive(item.to) }"
      >
        <i :class="item.icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 240px;
  flex-shrink: 0;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: sticky;
  top: 0;
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.25rem;
  font-weight: 700;
  font-size: 1.05rem;
  color: #0369a1;
  border-bottom: 1px solid #e2e8f0;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  padding: 0.75rem;
  gap: 0.25rem;
}

.sidebar__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  color: #475569;
  text-decoration: none;
  font-size: 0.925rem;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.sidebar__item:hover {
  background: #f0f9ff;
  color: #0369a1;
}

.sidebar__item--active {
  background: #e0f2fe;
  color: #0369a1;
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    width: 72px;
  }

  .sidebar__brand span,
  .sidebar__item span {
    display: none;
  }

  .sidebar__brand {
    justify-content: center;
  }

  .sidebar__item {
    justify-content: center;
  }
}
</style>
