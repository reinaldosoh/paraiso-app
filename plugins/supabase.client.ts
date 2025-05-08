import { createClient } from '@supabase/supabase-js'

export default defineNuxtPlugin(() => {
  // Definindo diretamente as credenciais do Supabase
  const supabaseUrl = 'https://gpcamvqqqvzourhrcevk.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdwY2FtdnFxcXZ6b3VyaHJjZXZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEwMzk0MDUsImV4cCI6MjAzNjYxNTQwNX0.-3dGEBMvXdqPCLUG9TZ_nHStB9_htAHzsCx9QslLi-s'

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'paraiso-auth-token',
      storage: {
        getItem: (key) => {
          if (process.client) {
            return localStorage.getItem(key)
          }
          return null
        },
        setItem: (key, value) => {
          if (process.client) {
            localStorage.setItem(key, value)
          }
        },
        removeItem: (key) => {
          if (process.client) {
            localStorage.removeItem(key)
          }
        }
      }
    }
  })

  return {
    provide: {
      supabase
    }
  }
})
