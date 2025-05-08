<template>
  <div class="mobile-container">
    <!-- Barra de status simulada -->
    <div class="status-bar">
      <div></div>
      <div class="status-icons">
        <i class="material-icons status-icon">signal_cellular_alt</i>
        <i class="material-icons status-icon">wifi</i>
        <i class="material-icons status-icon">battery_full</i>
      </div>
    </div>
    
    <!-- Conteúdo principal -->
    <div class="page-content">
      <slot />
    </div>
    
    <!-- Barra de navegação inferior -->
    <div class="bottom-nav">
      <NuxtLink to="/home" class="bottom-nav-item" :class="{ active: route.path.includes('/home') }">
        <i class="material-icons nav-icon">home</i>
      </NuxtLink>
      
      <NuxtLink to="/ordens" class="bottom-nav-item" :class="{ active: route.path.includes('/ordens') }">
        <i class="material-icons nav-icon">folder</i>
      </NuxtLink>
      
      <NuxtLink to="/bdt" class="bottom-nav-item" :class="{ active: route.path.includes('/bdt') }">
        <i class="material-icons nav-icon">directions_car</i>
      </NuxtLink>
      
      <NuxtLink to="/auth/login" class="bottom-nav-item">
        <i class="material-icons nav-icon">exit_to_app</i>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const currentTime = ref('');

// Atualiza o relógio a cada minuto
onMounted(() => {
  updateTime();
  const timer = setInterval(updateTime, 60000);
  
  onBeforeUnmount(() => {
    clearInterval(timer);
  });
});

function updateTime() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${hours}:${minutes}`;
}
</script>

<style scoped>
.mobile-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  padding: 5px 15px;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.status-icons {
  display: flex;
  align-items: center;
}

.status-icon {
  font-size: 16px;
  margin-left: 5px;
}

.page-content {
  flex: 1;
  padding-bottom: 60px;
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  width: 100%;
  background-color: #4CAF50; /* Fundo verde */
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  max-width: 500px;
  margin: 0 auto;
  box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
  z-index: 1000;
}

.bottom-nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 10px 0;
}

.nav-icon {
  color: rgba(255,255,255,0.7); /* Branco com transparência para inativos */
  font-size: 28px !important;
}

a {
  text-decoration: none;
  color: inherit;
}

.active .nav-icon {
  color: #FFFFFF; /* Branco puro para ícones ativos */
}

/* Garantindo que os ícones do Material Design sejam carregados corretamente */
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  -moz-osx-font-smoothing: grayscale;
  font-feature-settings: 'liga';
}
</style>
