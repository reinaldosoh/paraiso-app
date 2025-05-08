import { Quasar, Dialog, Notify, Loading, QSpinnerDots } from 'quasar'

export default defineNuxtPlugin((nuxtApp) => {
  // As cores são definidas na configuração do Quasar abaixo
  
  nuxtApp.vueApp.use(Quasar, {
    plugins: {
      Dialog,
      Notify,
      Loading
    },
    config: {
      brand: {
        primary: '#0D7A3E',
        secondary: '#4B9CD3',
        accent: '#F9C74F',
        dark: '#333333',
        positive: '#0D7A3E',
        negative: '#F44336',
        info: '#2196F3',
        warning: '#FFC107'
      },
      loading: {
        spinner: QSpinnerDots,
        spinnerColor: 'primary',
        spinnerSize: 80,
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
      },
      notify: {
        position: 'bottom',
        timeout: 2500,
        textColor: 'white',
        actions: [{ icon: 'close', color: 'white' }]
      },
      dialog: {
        maxWidth: '400px'
      }
    }
  })
})
