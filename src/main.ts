import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'

import Button from 'primevue/button'
import Card from 'primevue/card'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import DatePicker from 'primevue/datepicker'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import Password from 'primevue/password'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import Avatar from 'primevue/avatar'

import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'
import router from './router'

const MedicalPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{sky.50}',
      100: '{sky.100}',
      200: '{sky.200}',
      300: '{sky.300}',
      400: '{sky.400}',
      500: '{sky.500}',
      600: '{sky.600}',
      700: '{sky.700}',
      800: '{sky.800}',
      900: '{sky.900}',
      950: '{sky.950}',
    },
  },
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: MedicalPreset,
    options: { darkModeSelector: false },
  },
})
app.use(ToastService)

app.component('Button', Button)
app.component('Card', Card)
app.component('Column', Column)
app.component('DataTable', DataTable)
app.component('DatePicker', DatePicker)
app.component('Dialog', Dialog)
app.component('InputNumber', InputNumber)
app.component('InputText', InputText)
app.component('Message', Message)
app.component('Password', Password)
app.component('Select', Select)
app.component('Tag', Tag)
app.component('Textarea', Textarea)
app.component('Toast', Toast)
app.component('Avatar', Avatar)

app.mount('#app')
