<template>
  <div class="mobile-container">
    
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Cabeçalho da página -->
      <div style="display: flex; align-items: center; margin-bottom: 24px;">
        <button @click="$router.push('/')" style="background: none; border: none; padding: 8px; cursor: pointer;">
          <i class="material-icons" style="color: var(--primary-color); font-size: 24px;">arrow_back</i>
        </button>
        <h1 style="flex-grow: 1; text-align: center; font-size: 20px; font-weight: 600; margin: 0; color: var(--text-color);">Criar Conta</h1>
        <div style="width: 40px;"></div> <!-- Espaçador para centralizar o título -->
      </div>
      
      <!-- Logo Paraíso Ambiental -->
      <div style="display: flex; justify-content: center; margin: 16px 0 24px 0;">
        <img src="/img/logotipo.PNG" alt="Logotipo Paraíso Ambiental" class="logo-animation" style="max-width: 150px; height: auto;" />
      </div>
      
      <!-- Formulário de Registro -->
      <div class="card">
        <form @submit.prevent="handleRegister">
          <!-- Nome -->
          <div class="form-group">
            <label for="name" class="form-label">Nome completo</label>
            <div style="position: relative;">
              <input
                id="name"
                v-model="name"
                type="text"
                required
                class="form-input"
                style="padding-left: 40px;"
                placeholder="Seu nome completo"
                :disabled="loading"
              />
              <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-secondary-color);">
                <i class="material-icons" style="font-size: 20px;">person</i>
              </span>
            </div>
            <small v-if="nameError" style="color: #dc3545; font-size: 12px; margin-top: 4px; display: block;">{{ nameError }}</small>
          </div>
          
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
            <small v-if="emailError" style="color: #dc3545; font-size: 12px; margin-top: 4px; display: block;">{{ emailError }}</small>
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
            <small v-if="passwordError" style="color: #dc3545; font-size: 12px; margin-top: 4px; display: block;">{{ passwordError }}</small>
          </div>
          
          <!-- Confirmar Senha -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirmar senha</label>
            <div style="position: relative;">
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                :type="isPwdConfirm ? 'password' : 'text'"
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
                @click="isPwdConfirm = !isPwdConfirm"
              >
                <i class="material-icons" style="font-size: 20px;">{{ isPwdConfirm ? 'visibility' : 'visibility_off' }}</i>
              </button>
            </div>
            <small v-if="confirmPasswordError" style="color: #dc3545; font-size: 12px; margin-top: 4px; display: block;">{{ confirmPasswordError }}</small>
          </div>
          
          <!-- Termos e condições -->
          <div style="display: flex; align-items: center; margin: 16px 0;">
            <input
              id="terms"
              v-model="acceptTerms"
              type="checkbox"
              style="width: 16px; height: 16px;"
              :disabled="loading"
            />
            <label for="terms" style="margin-left: 8px; font-size: 14px;">Eu aceito os termos e condições</label>
          </div>
          
          <!-- Botão de Registro -->
          <button
            type="submit"
            class="btn btn-block ripple"
            :disabled="loading || !acceptTerms"
          >
            <span v-if="loading" style="margin-right: 8px;">
              <i class="material-icons spin" style="font-size: 20px;">refresh</i>
            </span>
            <span>{{ loading ? 'Criando conta...' : 'Criar Conta' }}</span>
          </button>
        </form>
      </div>
      
      <!-- Separador -->
      <div style="display: flex; align-items: center; margin: 24px 0;">
        <div style="flex-grow: 1; height: 1px; background-color: #e0e0e0;"></div>
        <span style="margin: 0 16px; color: var(--text-secondary-color); font-size: 14px;">ou</span>
        <div style="flex-grow: 1; height: 1px; background-color: #e0e0e0;"></div>
      </div>
      
      <!-- Registro com Google -->
      <button
        type="button"
        @click="registerWithGoogle"
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
        <span>Registrar com Google</span>
      </button>
      
      <!-- Link para Login -->
      <div class="text-center mt-3">
        <p style="font-size: 14px; color: var(--text-secondary-color);">
          Já tem uma conta? 
          <NuxtLink to="/" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">Entrar</NuxtLink>
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

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isPwd = ref(true);
const isPwdConfirm = ref(true);
const acceptTerms = ref(false);
const loading = ref(false);
const googleLoading = ref(false);
const currentTime = ref('');

// Erros de validação
const nameError = ref('');
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');

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

const isValidEmail = (val: string) => {
  const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/;
  return emailPattern.test(val);
};

const validateForm = () => {
  let isValid = true;
  
  // Validar nome
  if (!name.value) {
    nameError.value = 'Nome é obrigatório';
    isValid = false;
  } else {
    nameError.value = '';
  }
  
  // Validar email
  if (!email.value) {
    emailError.value = 'E-mail é obrigatório';
    isValid = false;
  } else if (!isValidEmail(email.value)) {
    emailError.value = 'E-mail inválido';
    isValid = false;
  } else {
    emailError.value = '';
  }
  
  // Validar senha
  if (!password.value) {
    passwordError.value = 'Senha é obrigatória';
    isValid = false;
  } else if (password.value.length < 8) {
    passwordError.value = 'A senha deve ter pelo menos 8 caracteres';
    isValid = false;
  } else if (!/[A-Z]/.test(password.value)) {
    passwordError.value = 'A senha deve conter pelo menos uma letra maiúscula';
    isValid = false;
  } else if (!/[0-9]/.test(password.value)) {
    passwordError.value = 'A senha deve conter pelo menos um número';
    isValid = false;
  } else {
    passwordError.value = '';
  }
  
  // Validar confirmação de senha
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Confirmação de senha é obrigatória';
    isValid = false;
  } else if (confirmPassword.value !== password.value) {
    confirmPasswordError.value = 'As senhas não coincidem';
    isValid = false;
  } else {
    confirmPasswordError.value = '';
  }
  
  return isValid;
};

const handleRegister = async () => {
  if (!validateForm() || !acceptTerms.value) return;
  
  try {
    loading.value = true;
    
    const { data, error } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: name.value
        }
      }
    });
    
    if (error) throw error;
    
    // Registro bem-sucedido
    alert('Conta criada com sucesso! Verifique seu e-mail para confirmar o cadastro.');
    
    // Redirecionar para login
    router.push('/');
  } catch (error: any) {
    console.error('Erro ao criar conta:', error.message);
    alert('Falha ao criar conta. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

const registerWithGoogle = async () => {
  try {
    googleLoading.value = true;
    
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) throw error;
  } catch (error: any) {
    console.error('Erro ao registrar com Google:', error.message);
    alert('Falha ao registrar com Google');
  } finally {
    googleLoading.value = false;
  }
};
</script>

<style scoped>
/* Estilização específica para a página de registro */
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
</style>
