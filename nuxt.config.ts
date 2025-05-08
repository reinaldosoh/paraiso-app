// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  
  modules: [
    '@vueuse/motion/nuxt',
    '@unocss/nuxt'
  ],
  
  // Configuração do Supabase - desativado para evitar erros
  // Agora usamos um plugin personalizado em plugins/supabase.client.ts
  runtimeConfig: {
    public: {
      supabaseUrl: 'https://gpcamvqqqvzourhrcevk.supabase.co',
      supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwY2FtdnFxcXZ6b3VyaHJjZXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwMzk0MDUsImV4cCI6MjAzNjYxNTQwNX0.-3dGEBMvXdqPCLUG9TZ_nHStB9_htAHzsCx9QslLi-s',
      appVersion: '1.0.0'
    }
  },
  
  // Configuração para experiência mobile
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui',
      meta: [
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#0D7A3E' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/icon.png' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/icon?family=Material+Icons' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },
  
  // Configuração do CSS global
  css: [
    '~/assets/css/main.css'
  ],
  
  // Configuração do UnoCSS
  unocss: {
    // Presets
    uno: true, // habilita o preset `@unocss/preset-uno`
    icons: true, // habilita o preset `@unocss/preset-icons`
    attributify: true, // habilita o preset `@unocss/preset-attributify`
    
    // Cores personalizadas
    theme: {
      colors: {
        primary: '#0D7A3E',
        secondary: '#4B9CD3',
        accent: '#F9C74F',
      }
    },
    
    // Regras personalizadas
    rules: [
      ['btn', { 
        'display': 'inline-flex',
        'align-items': 'center',
        'justify-content': 'center',
        'font-weight': '500',
        'padding': '0.5rem 1rem',
        'border-radius': '0.375rem',
        'transition': 'all 0.2s ease-in-out'
      }],
      ['btn-primary', {
        'background-color': '#0D7A3E',
        'color': 'white',
        'border': 'none'
      }],
      ['card', {
        'background-color': 'white',
        'border-radius': '0.5rem',
        'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'padding': '1.5rem'
      }],
      ['input', {
        'width': '100%',
        'padding': '0.5rem 0.75rem',
        'border': '1px solid #e2e8f0',
        'border-radius': '0.375rem',
        'outline': 'none',
        'transition': 'border-color 0.2s ease-in-out'
      }]
    ],
    
    // Atalhos personalizados
    shortcuts: {
      'btn-outline': 'btn border border-primary text-primary hover:bg-primary/10',
      'btn-secondary': 'btn bg-secondary text-white',
      'input-focus': 'input focus:border-primary focus:ring-2 focus:ring-primary/20'
    }
  },
  
  // Configuração de runtimes
  runtimeConfig: {
    public: {
      appName: 'App Paraíso',
      appVersion: '1.0.0'
    }
  }
})
