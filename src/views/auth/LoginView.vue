<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { login, isLoading } = useAuth()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
})

const submitError = ref('')

function validate(): boolean {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'El correo es obligatorio.'
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Ingresa un correo válido.'
  }

  if (!form.password) {
    errors.password = 'La contraseña es obligatoria.'
  }

  return !errors.email && !errors.password
}

async function handleSubmit() {
  submitError.value = ''
  if (!validate()) return

  try {
    await login({ email: form.email, password: form.password })
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'No se pudo iniciar sesión. Intenta nuevamente.'
  }
}
</script>

<template>
  <Card class="login-card">
    <template #title>
      <div class="login-card__title">
        <i class="pi pi-heart-fill" />
        <span>CitasMedicas</span>
      </div>
    </template>
    <template #subtitle>Inicia sesión para gestionar tus citas médicas</template>
    <template #content>
      <form class="login-form" @submit.prevent="handleSubmit">
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
            placeholder="Ingresa tu contraseña"
            :feedback="false"
            toggle-mask
            :invalid="!!errors.password"
            fluid
          />
          <small v-if="errors.password" class="field__error">{{ errors.password }}</small>
        </div>

        <Message v-if="submitError" severity="error" :closable="false">{{ submitError }}</Message>

        <Button type="submit" label="Ingresar" icon="pi pi-sign-in" :loading="isLoading" class="login-form__submit" />

        <p class="login-form__register">
          ¿No tienes cuenta? <router-link to="/register">Regístrate aquí</router-link>
        </p>
      </form>
    </template>
  </Card>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 420px;
}

.login-card__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #0369a1;
}

.login-form {
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

.login-form__submit {
  width: 100%;
  margin-top: 0.25rem;
}

.login-form__register {
  text-align: center;
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}
</style>
