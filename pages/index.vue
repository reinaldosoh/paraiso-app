<template>
  <div class="mobile-container">
    
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Logo Paraíso Ambiental -->
      <div class="logo-section">
        <div class="logo-animation" style="display: flex; justify-content: center; margin: 32px 0 40px 0;">
          <img src="/img/logotipo.PNG" alt="Logotipo Paraíso Ambiental" style="max-width: 220px; height: auto;" />
        </div>
      </div>
      
      <!-- Formulário de Login -->
      <div class="card">
        <form @submit.prevent="handleLogin">
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">E-mail</label>
            <div style="position: relative;">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="form-input"
                style="padding-left: 40px;"
                placeholder="seu@email.com"
                :disabled="loading"
              />
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary-color);">
                <i class="material-icons" style="font-size: 20px;">email</i>
              </span>
            </div>
          </div>
          
          <!-- Senha -->
          <div class="form-group">
            <label for="password" class="form-label">Senha</label>
            <div style="position: relative;">
              <input
                id="password"
                v-model="password"
                :type="isPwd ? 'password' : 'text'"
                required
                class="form-input"
                style="padding-left: 40px; padding-right: 40px;"
                placeholder="••••••••"
                :disabled="loading"
              />
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary-color);">
                <i class="material-icons" style="font-size: 20px;">lock</i>
              </span>
              <button 
                type="button" 
                style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary-color); cursor: pointer;"
                @click="isPwd = !isPwd"
              >
                <i class="material-icons" style="font-size: 20px;">{{ isPwd ? 'visibility' : 'visibility_off' }}</i>
              </button>
            </div>
          </div>
          
          <!-- Opções -->
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="display: flex; align-items: center;">
              <input
                id="remember-me"
                v-model="rememberMe"
                type="checkbox"
                style="width: 16px; height: 16px;"
                :disabled="loading"
              />
              <label for="remember-me" style="margin-left: 8px; font-size: 14px;">Lembrar-me</label>
            </div>
            <div>
              <NuxtLink to="/auth/reset-password" style="color: var(--primary-color); font-size: 14px; text-decoration: none; font-weight: 500;">Esqueceu a senha?</NuxtLink>
            </div>
          </div>
          
          <!-- Botão de Login -->
          <button
            type="submit"
            class="btn btn-block ripple"
            :disabled="loading"
          >
            <span v-if="loading" style="margin-right: 8px;">
              <i class="material-icons spin" style="font-size: 20px;">refresh</i>
            </span>
            <span>{{ loading ? 'Autenticando...' : 'Entrar' }}</span>
          </button>
        </form>
      </div>
      
      <!-- Espaço adicional no final -->
      <div style="height: 24px;"></div>
      
      <!-- Versão do app -->
      <div style="text-align: center; margin-top: 40px;">
        <p style="font-size: 12px; color: var(--text-secondary-color);">Versão {{ appVersion }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const { $supabase } = useNuxtApp();
const router = useRouter();
const config = useRuntimeConfig();
const appVersion = config.public.appVersion || '1.0.0';

// Estado do usuário
const user = ref(null);

// Verificar se o usuário já está autenticado
onMounted(async () => {
  const { data } = await $supabase.auth.getSession();
  if (data.session) {
    user.value = data.session.user;
    router.push('/home');
  }
});

const email = ref('');
const password = ref('');
const isPwd = ref(true);
const loading = ref(false);
const rememberMe = ref(false);
const currentTime = ref('');

// Atualizar o horário atual
const updateTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${hours}:${minutes}`;
};

// Redirecionar para home se já estiver autenticado e iniciar o relógio
onMounted(() => {
  if (user.value) {
    router.push('/home');
  }
  
  // Iniciar o relógio
  updateTime();
  setInterval(updateTime, 60000); // Atualiza a cada minuto
});

const handleLogin = async () => {
  if (!email.value || !password.value) {
    alert('Por favor, preencha o email e a senha.');
    return;
  }
  
  try {
    loading.value = true;
    console.log('Tentando fazer login com:', email.value);
    
    const { data, error } = await $supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });
    
    if (error) throw error;
    
    console.log('Login bem-sucedido:', data.user?.email);
    user.value = data.user;
    
    // Login bem-sucedido, redirecionar para a página inicial
    router.push('/home');
  } catch (error: any) {
    console.error('Erro ao fazer login:', error.message);
    alert(`Falha ao fazer login: ${error.message}`);
  } finally {
    loading.value = false;
  }
};

// Função de login com Google removida
</script>

<style scoped>
/* Animação para o logo */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.logo-animation {
  animation: pulse 3s infinite ease-in-out;
}

.logo-section {
  margin-bottom: 32px;
}
</style>
