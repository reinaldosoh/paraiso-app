<template>
  <div class="mobile-container">
    <!-- Alerta de erro fixo no topo -->
    <div v-if="errorMessage" class="error-banner">
      <div class="error-content">
        <i class="material-icons">error</i>
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="errorMessage = ''; email = ''; password = ''" class="error-close">
        <span>Entendi, vou revisar</span>
      </button>
    </div>
    
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Logo Paraíso Ambiental -->
      <div style="display: flex; justify-content: center; margin: 32px 0;">
        <img src="/img/logotipo.PNG" alt="Logotipo Paraíso Ambiental" class="logo-animation" style="max-width: 180px; height: auto;" />
      </div>
      
      <h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 24px;">Paraíso Ambiental</h2>
      
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
              <NuxtLink to="/" style="color: var(--primary-color); font-size: 14px; text-decoration: none; font-weight: 500;">Esqueceu a senha?</NuxtLink>
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
      
      <!-- Separador -->
      <div style="display: flex; align-items: center; margin: 24px 0;">
        <div style="flex-grow: 1; height: 1px; background-color: #e0e0e0;"></div>
        <span style="margin: 0 16px; color: var(--text-secondary-color); font-size: 14px;">ou</span>
        <div style="flex-grow: 1; height: 1px; background-color: #e0e0e0;"></div>
      </div>
      
      <!-- Login com Google -->
      <button
        type="button"
        @click="loginWithGoogle"
        class="btn btn-outline btn-block ripple"
        style="margin-bottom: 16px;"
        :disabled="loading || googleLoading"
      >
        <span v-if="googleLoading" style="margin-right: 8px;">
          <i class="material-icons spin" style="font-size: 20px;">refresh</i>
        </span>
        <span v-else style="margin-right: 8px;">
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" style="width: 20px; height: 20px;" />
        </span>
        <span>Entrar com Google</span>
      </button>
      
      <!-- Link para Registro -->
      <div class="text-center mt-3">
        <p style="font-size: 14px; color: var(--text-secondary-color);">
          Não tem uma conta? 
          <NuxtLink to="/auth/register" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">Criar conta</NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const client = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();

const email = ref('');
const password = ref('');
const isPwd = ref(true);
const loading = ref(false);
const googleLoading = ref(false);
const rememberMe = ref(false);
const currentTime = ref('');
const errorMessage = ref('');

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

// Função para lidar com o login
const handleLogin = async () => {
  if (!email.value || !password.value) return;
  
  try {
    loading.value = true;
    
    const { data, error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value
    });
    
    if (error) {
      errorMessage.value = 'Credenciais inválidas. Verifique seu email e senha.';
      console.error('Erro de login:', error.message);
      return;
    }
    
    // Se a opção 'lembrar-me' estiver marcada, salvar o email no localStorage
    if (rememberMe.value && process.client) {
      localStorage.setItem('paraiso-remembered-email', email.value);
    } else if (process.client) {
      localStorage.removeItem('paraiso-remembered-email');
    }
    
    // Login bem-sucedido, redirecionar para a página inicial
    router.push('/home');
  } catch (e) {
    errorMessage.value = 'Erro ao tentar fazer login. Tente novamente.';
    console.error('Erro inesperado:', e);
  } finally {
    loading.value = false;
  }
};



const loginWithGoogle = async () => {
  try {
    googleLoading.value = true;
    
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      errorMessage.value = 'Erro ao fazer login com Google. Tente novamente.';
      console.error('Erro de login Google:', error.message);
    }
  } catch (e) {
    errorMessage.value = 'Erro ao conectar com Google. Tente novamente.';
    console.error('Erro inesperado:', e);
  } finally {
    googleLoading.value = false;
  }
};
</script>

<style scoped>
/* Estilização específica para a página de login */
.form-input {
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.form-input:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(13, 122, 62, 0.2);
}

/* Animação para o botão quando pressionado */
.btn {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.btn:active {
  transform: scale(0.98);
}

/* Efeito de onda ao clicar */
.btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5px;
  height: 5px;
  background: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.btn:active::after {
  animation: ripple 1s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0, 0);
    opacity: 0.5;
  }
  20% {
    transform: scale(25, 25);
    opacity: 0.3;
  }
  100% {
    opacity: 0;
    transform: scale(40, 40);
  }
}

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
/* Estilo para o banner de erro */
.error-banner {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #f44336;
  color: white;
  padding: 12px 16px;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: slide-down 0.3s ease-out;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-content i {
  font-size: 20px;
}

.error-close {
  background-color: white;
  color: #f44336;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  align-self: flex-end;
  transition: all 0.2s ease;
}

.error-close:hover {
  background-color: #f8f8f8;
  transform: translateY(-2px);
}

@keyframes slide-down {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
