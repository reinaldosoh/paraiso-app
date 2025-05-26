<template>
  <div class="mobile-container">
    
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Card de alerta para ordens em atraso -->
      <div v-if="showAlert && ordensEmAtraso > 0" class="alert-card">
        <div class="alert-card-content">
          <div class="alert-card-header">
            <i class="material-icons alert-icon">warning</i>
            <div class="alert-title">Ordens em Atraso</div>
            <button class="alert-close" @click="dismissAlert">
              <i class="material-icons">close</i>
            </button>
          </div>
          <div class="alert-card-body">
            <p>Existem {{ ordensEmAtraso }} {{ ordensEmAtraso === 1 ? 'ordem' : 'ordens' }} de serviço em atraso que precisam de atenção.</p>
          </div>
          <div class="alert-card-footer">
            <button class="alert-card-button" @click="verOrdensEmAtraso">
              <i class="material-icons">visibility</i>
              Ver detalhes
            </button>
          </div>
        </div>
      </div>
      
      <!-- Logo Paraíso Ambiental -->
      <div style="display: flex; justify-content: center; margin: 20px 0;">
        <img src="/img/logotipo.PNG" alt="Logotipo Paraíso Ambiental" class="logo-animation" style="max-width: 150px; height: auto;" />
      </div>
      
      <h1 style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 16px;">Dashboard Paraíso</h1>
      
      <!-- Informações do usuário -->
      <div class="user-info-card">
        <p>Olá, <span style="font-weight: bold;">{{ userInfo?.nome || user?.email }}</span></p>
        <p class="date-display">{{ formattedDate }}</p>
      </div>
      
      <!-- Indicadores principais -->
      <div class="dashboard-section">
        <h2 class="section-title">Resumo do Mês</h2>
        <div class="metrics-grid">
          <div class="metric-card" :class="{ 'loading': loading }">
            <div class="metric-icon">
              <i class="material-icons">assignment</i>
            </div>
            <div class="metric-content">
              <p class="metric-value">{{ osAbertas }}</p>
              <p class="metric-label">OS em Aberto</p>
            </div>
          </div>
          
          <div class="metric-card" :class="{ 'loading': loading }">
            <div class="metric-icon">
              <i class="material-icons">done_all</i>
            </div>
            <div class="metric-content">
              <p class="metric-value">{{ osRealizadas }}</p>
              <p class="metric-label">OS Realizadas</p>
            </div>
          </div>
          
          <div class="metric-card" :class="{ 'loading': loading }">
            <div class="metric-icon">
              <i class="material-icons">directions_car</i>
            </div>
            <div class="metric-content">
              <p class="metric-value">{{ bdtAbertos }}</p>
              <p class="metric-label">BDT em Aberto</p>
            </div>
          </div>
          
          <div class="metric-card" :class="{ 'loading': loading }">
            <div class="metric-icon">
              <i class="material-icons">check_circle</i>
            </div>
            <div class="metric-content">
              <p class="metric-value">{{ bdtRealizados }}</p>
              <p class="metric-label">BDT Realizados</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Desempenho do funcionário -->
      <div class="dashboard-section">
        <h2 class="section-title">Desempenho Mensal</h2>
        <div class="performance-card" :class="{ 'loading': loading }">
          <div class="performance-header">
            <p>Eficiência</p>
            <p class="performance-percentage">{{ eficiencia }}%</p>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${eficiencia}%` }"></div>
          </div>
          <p class="performance-details">{{ osRealizadas }} de {{ totalOS }} ordens de serviço concluídas</p>
        </div>
      </div>
      
      <!-- Ações rápidas -->
      <div class="dashboard-section">
        <h2 class="section-title">Ações Rápidas</h2>
        <div class="actions-grid">
          <button class="action-button ripple" @click="router.push('/ordens')">
            <i class="material-icons">list_alt</i>
            <span>Listar OS</span>
          </button>
          <button class="action-button ripple" @click="router.push('/bdt')">
            <i class="material-icons">directions_car</i>
            <span>Listar BDT</span>
          </button>
          <button class="action-button ripple" @click="navigateToControlePragas()">
            <i class="material-icons">pest_control</i>
            <span>Controle de Pragas</span>
          </button>
        </div>
      </div>
      
      <!-- Botão de logout -->
      <div style="margin-top: 24px; padding-bottom: 10px;">
        <button @click="handleLogout" class="btn btn-outline ripple">
          <i class="material-icons" style="margin-right: 8px; font-size: 18px;">exit_to_app</i>
          <span>Sair</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { $supabase } = useNuxtApp();

// Estado
const user = ref(null);
const userInfo = ref(null);
const loading = ref(true);
const currentDate = ref('');
const currentTime = ref('');
const osAbertas = ref(0);
const osRealizadas = ref(0);
const bdtAbertos = ref(0);
const bdtRealizados = ref(0);
const eficiencia = ref(0);
const ordensEmAtraso = ref(0);
const showAlert = ref(false);
const alertInterval = ref(null);
const totalOS = ref(0);

// Data formatada
const formattedDate = computed(() => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return now.toLocaleDateString('pt-BR', options);
});

// Obter o primeiro dia do mês atual
const getFirstDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
};

// Obter o último dia do mês atual
const getLastDayOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
};

// Buscar informações do usuário
const fetchUserInfo = async (uuid: string) => {
  try {
    const { data, error } = await $supabase
      .from('usuario')
      .select('*')
      .eq('uuid', uuid)
      .single();
      
    if (error) throw error;
    userInfo.value = data;
    return data;
  } catch (error) {
    console.error('Erro ao buscar informações do usuário:', error);
    return null;
  }
};

// Buscar ordens de serviço do mês atual
const fetchOrdemServico = async (userUuid: string) => {
  try {
    const firstDay = getFirstDayOfMonth();
    const lastDay = getLastDayOfMonth();
    
    // Buscar todas as ordens de serviço do mês atual
    const { data, error } = await $supabase
      .from('ordem_servico')
      .select('*')
      .eq('funcionario_id', userUuid)
      .gte('created_at', firstDay)
      .lte('created_at', lastDay);
      
    if (error) throw error;
    
    // Contar ordens abertas e realizadas
    if (data) {
      totalOS.value = data.length;
      osAbertas.value = data.filter(os => os.status === 'Em aberto').length;
      osRealizadas.value = data.filter(os => os.realizado === true).length;
      
      // Calcular eficiência
      eficiencia.value = totalOS.value > 0 
        ? Math.round((osRealizadas.value / totalOS.value) * 100) 
        : 0;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    return [];
  }
};

// Buscar BDTs do mês atual
const fetchBDT = async (userId: number) => {
  try {
    const firstDay = getFirstDayOfMonth();
    const lastDay = getLastDayOfMonth();
    
    // Buscar todos os BDTs do mês atual
    const { data, error } = await $supabase
      .from('bdt_relatorio')
      .select('*')
      .eq('usuario_id', userId)
      .gte('created_at', firstDay)
      .lte('created_at', lastDay);
      
    if (error) throw error;
    
    // Contar BDTs abertos e realizados
    if (data) {
      bdtAbertos.value = data.filter(bdt => bdt.status === 'Em aberto').length;
      bdtRealizados.value = data.filter(bdt => bdt.status !== 'Em aberto').length;
    }
    
    return data;
  } catch (error) {
    console.error('Erro ao buscar BDTs:', error);
    return [];
  }
};

// Carregar todos os dados do dashboard
const loadDashboardData = async () => {
  try {
    loading.value = true;
    
    if (!user.value?.id) return;
    
    // Buscar informações do usuário
    const userData = await fetchUserInfo(user.value.id);
    
    // Usar o UUID do usuário diretamente para ordens de serviço
    await fetchOrdemServico(user.value.id);
    
    // Para BDT, usar o ID do usuário da tabela usuario
    if (userData?.id) {
      await fetchBDT(userData.id);
    }
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  } finally {
    loading.value = false;
  }
};

// Verificar ordens em atraso
const checkOrdensEmAtraso = async () => {
  try {
    if (!user.value) return;
    
    console.log('Verificando ordens em atraso...');
    
    const { data, error } = await $supabase
      .from('ordem_servico')
      .select('id')
      .eq('status', 'Em atraso');
      
    if (error) throw error;
    
    console.log('Ordens em atraso encontradas:', data?.length || 0);
    ordensEmAtraso.value = data?.length || 0;
    
    if (ordensEmAtraso.value > 0) {
      showAlert.value = true;
    }
  } catch (error) {
    console.error('Erro ao verificar ordens em atraso:', error);
  }
};

// Função para fechar o alerta
const dismissAlert = () => {
  showAlert.value = false;
};

// Função para navegar para a página de ordens com filtro de atraso
const verOrdensEmAtraso = () => {
  router.push({ 
    path: '/ordens', 
    query: { filter: 'Em atraso' } 
  });
};

// Função para navegar para a página de controle de pragas
const navigateToControlePragas = () => {
  console.log('Navegando para controle de pragas');
  try {
    router.push('/controle-pragas');
  } catch (error) {
    console.error('Erro ao navegar:', error);
    // Tentar abordagem alternativa
    window.location.href = '/controle-pragas';
  }
};

// Verificar se o usuário está autenticado e carregar dados
onMounted(async () => {
  const { data } = await $supabase.auth.getSession();
  if (data.session) {
    user.value = data.session.user;
    await loadDashboardData();
    
    // Verificar ordens em atraso apenas uma vez ao carregar a página
    await checkOrdensEmAtraso();
  } else {
    router.push('/');
  }
  
  // Iniciar o relógio
  updateTime();
  setInterval(updateTime, 60000); // Atualiza a cada minuto
});

// Atualizar o horário atual
const updateTime = () => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  currentTime.value = `${hours}:${minutes}`;
};

// Função para fazer logout
const handleLogout = async () => {
  try {
    await $supabase.auth.signOut();
    user.value = null;
    router.push('/');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};
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

/* Estilos do Dashboard */
.user-info-card {
  background-color: var(--primary-color);
  color: white;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.date-display {
  font-size: 14px;
  opacity: 0.8;
  margin-top: 4px;
}

.dashboard-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary-color);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.metric-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.metric-card:active {
  transform: scale(0.98);
}

.metric-icon {
  background-color: var(--primary-color-light);
  color: var(--primary-color);
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.metric-icon i {
  font-size: 24px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  line-height: 1.2;
  color: var(--text-primary-color);
}

.metric-label {
  font-size: 12px;
  color: var(--text-secondary-color);
  margin: 0;
}

.performance-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.performance-percentage {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background-color: var(--primary-color);
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

.performance-details {
  font-size: 12px;
  color: var(--text-secondary-color);
  margin: 0;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-button {
  background-color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.action-button:active {
  transform: scale(0.95);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.action-button i {
  font-size: 24px;
  margin-bottom: 8px;
  color: var(--primary-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:active {
  background-color: rgba(76, 175, 80, 0.1);
  transform: scale(0.98);
}

/* Estilos para o card de alerta de ordens em atraso */
.alert-card {
  background-color: white;
  border-radius: 12px;
  margin: 0 10px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.3s ease-out;
  border-top: 3px solid #FF9800;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.alert-card-content {
  display: flex;
  flex-direction: column;
}

.alert-card-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
}

.alert-icon {
  color: #FF9800;
  font-size: 24px;
  margin-right: 12px;
}

.alert-title {
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.alert-close {
  background: transparent;
  border: none;
  color: #757575;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-card-body {
  padding: 16px;
  color: #555;
  font-size: 14px;
}

.alert-card-footer {
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
}

.alert-card-button {
  background-color: #FF9800;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.alert-card-button:hover {
  background-color: #F57C00;
}

.alert-card-button i {
  font-size: 18px;
  margin-right: 6px;
}

.loading {
  position: relative;
  overflow: hidden;
}

.loading::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  animation: loading-shimmer 1.5s infinite;
}

@keyframes loading-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
</style>
