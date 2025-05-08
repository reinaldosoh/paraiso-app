<template>
  <div class="mobile-container">
    <!-- Cabeçalho -->
    <div class="status-bar">
      <span>{{ currentTime }}</span>
      <div class="status-icons">
        <span>4G</span>
        <span style="margin-left: 8px;">Wi-Fi</span>
        <span style="margin-left: 8px;">100%</span>
      </div>
    </div>
    
    <!-- Conteúdo principal -->
    <div class="page-content" style="display: flex; justify-content: center; align-items: center; height: calc(100vh - 24px);">
      <div class="loading-container" style="display: flex; flex-direction: column; align-items: center;">
        <div class="spinner">
          <i class="material-icons spin" style="font-size: 48px; color: var(--primary-color);">refresh</i>
        </div>
        <p style="margin-top: 24px; color: var(--text-secondary-color); font-size: 18px;">Autenticando...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
});

const client = useSupabaseClient();
const router = useRouter();
const currentTime = ref('');

// Atualizar o horário atual
const updateTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${hours}:${minutes}`;
};

// Processar o callback de autenticação OAuth
onMounted(async () => {
  // Iniciar o relógio
  updateTime();
  
  try {
    // Processar o callback e redirecionar para a página inicial
    await client.auth.getSession();
    router.push('/home');
  } catch (error) {
    console.error('Erro no callback de autenticação:', error);
    router.push('/');
  }
});
</script>

<style scoped>
.spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(13, 122, 62, 0.1);
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-container {
  animation: pulse 2s infinite ease-in-out;
}
</style>
