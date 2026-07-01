<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { register, isLoading } = useAuth()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  fullName: '',
  email: '',
})

const submitError = ref('')

const passwordRequirements = computed(() => [
  { label: 'Mínimo 6 caracteres', met: form.password.length >= 6 },
  { label: 'Al menos una mayúscula', met: /[A-Z]/.test(form.password) },
  { label: 'Al menos un número', met: /\d/.test(form.password) },
  { label: 'Al menos un carácter especial', met: /[^A-Za-z0-9]/.test(form.password) },
  { label: 'Las contraseñas coinciden', met: !!form.password && form.password === form.confirmPassword },
])

const isPasswordValid = computed(() => passwordRequirements.value.every((req) => req.met))

function validate(): boolean {
  errors.fullName = form.fullName ? '' : 'El nombre completo es obligatorio.'

  if (!form.email) {
    errors.email = 'El correo es obligatorio.'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Ingresa un correo válido.'
  } else {
    errors.email = ''
  }

  return !errors.fullName && !errors.email && isPasswordValid.value
}

async function handleSubmit() {
  submitError.value = ''
  if (!validate()) return

  try {
    await register({ fullName: form.fullName, email: form.email, password: form.password })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'No se pudo completar el registro. Intenta nuevamente.'
  }
}
</script>

<template>
  <Card class="register-card">
    <template #title>
      <div class="register-card__title">
        <i class="pi pi-heart-fill" />
        <span>CitasMedicas</span>
      </div>
    </template>
    <template #subtitle>Crea tu cuenta de paciente</template>
    <template #content>
      <form class="register-form" @submit.prevent="handleSubmit">
        <div class="field">
          <label for="fullName">Nombre completo</label>
          <InputText id="fullName" v-model="form.fullName" placeholder="Nombre y apellido" :invalid="!!errors.fullName" />
          <small v-if="errors.fullName" class="field__error">{{ errors.fullName }}</small>
        </div>

        <div class="field">
          <label for="email">Correo electrónico</label>
          <InputText id="email" v-model="form.email" placeholder="correo@ejemplo.com" :invalid="!!errors.email" />
          <small v-if="errors.email" class="field__error">{{ errors.email }}</small>
        </div>

        <div class="field">
          <label for="password">Contraseña</label>
          <Password
            id="password"
            v-model="form.password"
            placeholder="Crea una contraseña segura"
            :feedback="false"
            toggle-mask
            fluid
          />
        </div>

        <div class="field">
          <label for="confirmPassword">Confirmar contraseña</label>
          <Password
            id="confirmPassword"
            v-model="form.confirmPassword"
            placeholder="Repite tu contraseña"
            :feedback="false"
            toggle-mask
            fluid
          />
        </div>

        <ul class="password-checklist">
          <li
            v-for="req in passwordRequirements"
            :key="req.label"
            class="password-checklist__item"
            :class="{ 'password-checklist__item--met': req.met }"
          >
            <i :class="req.met ? 'pi pi-check-circle' : 'pi pi-circle'" />
            <span>{{ req.label }}</span>
          </li>
        </ul>

        <Message v-if="submitError" severity="error" :closable="false">{{ submitError }}</Message>

        <Button type="submit" label="Crear cuenta" icon="pi pi-user-plus" :loading="isLoading" class="register-form__submit" />

        <p class="register-form__login">
          ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
        </p>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.register-card {
  width: 100%;
  max-width: 440px;
}

.register-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0369a1;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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

.password-checklist {
  list-style: none;
  margin: -0.25rem 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.password-checklist__item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  color: #94a3b8;
  transition: color 0.15s ease;
}

.password-checklist__item--met {
  color: #16a34a;
}

.register-form__submit {
  width: 100%;
  margin-top: 0.25rem;
}

.register-form__login {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}
</style>
