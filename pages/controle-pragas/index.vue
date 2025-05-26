<template>
  <div class="mobile-container">
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Cabeçalho com animação -->
      <div class="page-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }">
        <button class="back-button" @click="router.push('/home')">
          <i class="material-icons">arrow_back</i>
        </button>
        <h1 class="page-title">Controle de Pragas</h1>
      </div>
      
      <!-- Filtros com animação -->
      <div class="filters-section" v-motion :initial="{ opacity: 0, y: -10 }" :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 100 } }">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: statusFilter === 'Em aberto' }" 
            @click="statusFilter = 'Em aberto'"
          >
            <i class="material-icons">pending_actions</i>
            <span>Em aberto</span>
          </button>
          <button 
            class="filter-tab" 
            :class="{ active: statusFilter === 'Finalizado' }" 
            @click="statusFilter = 'Finalizado'"
          >
            <i class="material-icons">check_circle</i>
            <span>Finalizado</span>
          </button>
        </div>
      </div>
      
      <!-- Estados de carregamento e vazio -->
      <div v-if="loading" class="loading-container" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 300 } }">
        <div class="loading-spinner"></div>
        <p>Carregando registros de controle de pragas...</p>
      </div>
      
      <div v-else-if="filteredRegistros.length === 0" class="empty-state" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }">
        <i class="material-icons">pest_control</i>
        <p>Nenhum registro de controle de pragas encontrado</p>
        <button class="refresh-button" @click="refreshData">
          <i class="material-icons">refresh</i>
          <span>Atualizar</span>
        </button>
      </div>
      
      <!-- Lista de registros -->
      <div v-else class="registros-list">
        <div 
          v-for="(registro, index) in filteredRegistros" 
          :key="registro.id" 
          class="registro-card"
          v-motion 
          :initial="{ opacity: 0, y: 20 }" 
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
        >
          <!-- Cabeçalho do card (sempre visível) -->
          <div class="registro-header" @click="toggleCard(registro.id)">
            <div class="registro-summary">
              <div class="registro-id">
                <i class="material-icons status-icon" :class="{ 'status-finalizado': registro.finalizado, 'status-aberto': !registro.finalizado }">
                  {{ registro.finalizado ? 'check_circle' : 'pending_actions' }}
                </i>
                OS #{{ registro.numero_os }}
              </div>
              <div class="cliente-name">{{ registro.nome }}</div>
              <div class="registro-date">
                <i class="material-icons date-icon">event</i>
                {{ formatDate(registro.data_servico) }}
              </div>
            </div>
            <div class="registro-meta">
              <div class="registro-status" :class="{ 'status-finalizado': registro.finalizado, 'status-aberto': !registro.finalizado }">
                {{ registro.finalizado ? 'Finalizado' : 'Em aberto' }}
              </div>
              <div class="toggle-container">
                <i class="material-icons toggle-icon" :class="{ 'expanded': expandedCards[registro.id] }">
                  expand_more
                </i>
              </div>
            </div>
          </div>
          
          <!-- Conteúdo expandível com animação -->
          <div class="registro-expandable" v-if="expandedCards[registro.id]" v-motion :initial="{ opacity: 0, height: 0 }" :enter="{ opacity: 1, height: 'auto', transition: { duration: 300 } }">
            <!-- Detalhes do registro -->
            <div class="registro-details">
              <div class="section-title">
                <i class="material-icons">description</i>
                <span>Detalhes do Serviço</span>
              </div>
              
              <div class="details-grid">
                <div class="detail-row">
                  <div class="detail-label">Cliente:</div>
                  <div class="detail-value highlight">{{ registro.nome }}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">CPF/CNPJ:</div>
                  <div class="detail-value">{{ registro.cpf_cnpj || 'Não informado' }}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">Telefone:</div>
                  <div class="detail-value">{{ registro.telefone || 'Não informado' }}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">Endereço:</div>
                  <div class="detail-value">{{ registro.endereco || 'Não informado' }}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">Data do Serviço:</div>
                  <div class="detail-value">
                    <i class="material-icons detail-icon">event_note</i>
                    {{ formatDate(registro.data_servico) }}
                  </div>
                </div>
                
                <div v-if="registro.data_realizado" class="detail-row">
                  <div class="detail-label">Data de Realização:</div>
                  <div class="detail-value">
                    <i class="material-icons detail-icon">event_available</i>
                    {{ formatDate(registro.data_realizado) }}
                  </div>
                </div>
              </div>
              
              <!-- Serviços realizados -->
              <div class="services-section">
                <div class="section-title">
                  <i class="material-icons">pest_control</i>
                  <span>Serviços</span>
                </div>
                
                <div class="services-grid">
                  <!-- Dedetização -->
                  <div v-if="temServicosDedetizacao(registro)" class="service-category">
                    <h4>Dedetização</h4>
                    <div class="service-items">
                      <div v-if="registro.dedetizacao_barata" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Baratas</span>
                      </div>
                      <div v-if="registro.dedetizacao_traca" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Traças</span>
                      </div>
                      <div v-if="registro.dedetizacao_formiga" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Formigas</span>
                      </div>
                      <div v-if="registro.dedetizacao_escorpiao" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Escorpiões</span>
                      </div>
                      <div v-if="registro.dedetizacao_percevejo" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Percevejos</span>
                      </div>
                      <div v-if="registro.dedetizacao_carrapatos" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Carrapatos</span>
                      </div>
                      <div v-if="registro.dedetizacao_pulga" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Pulgas</span>
                      </div>
                      <div v-if="registro.dedetizacao_aranha" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Aranhas</span>
                      </div>
                      <div v-if="registro.dedetizacao_outros" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Outros</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Outros serviços -->
                  <div v-if="temOutrosServicos(registro)" class="service-category">
                    <h4>Outros Serviços</h4>
                    <div class="service-items">
                      <div v-if="registro.desratizacao_roedores" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Desratização</span>
                      </div>
                      <div v-if="registro.descupinazao_cupimdesolo" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Descupinização (Solo)</span>
                      </div>
                      <div v-if="registro.descupinazao_cupimdemadeira" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Descupinização (Madeira)</span>
                      </div>
                      <div v-if="registro.desalojamento_morcego" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Desalojamento de Morcegos</span>
                      </div>
                      <div v-if="registro.desalojamento_pombo_aves" class="service-item">
                        <i class="material-icons">check</i>
                        <span>Desalojamento de Pombos/Aves</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Botões de ação -->
              <div class="action-buttons">
                <button v-if="!registro.finalizado" class="action-button" @click="finalizarServico(registro.id)">
                  <i class="material-icons">check_circle</i>
                  <span>Finalizar Serviço</span>
                </button>
                <button class="action-button" @click="viewDetails(registro.id)">
                  <i class="material-icons">visibility</i>
                  <span>Ver Detalhes Completos</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Diálogo de Confirmação -->
      <div class="dialog-overlay" v-if="confirmDialogVisible" @click="confirmDialogVisible = false"></div>
      <div class="confirm-dialog" v-if="confirmDialogVisible">
        <div class="dialog-header">
          <h3>Confirmar Ação</h3>
        </div>
        <div class="dialog-content">
          <p>Tem certeza que deseja finalizar este serviço de controle de pragas?</p>
        </div>
        <div class="dialog-actions">
          <button class="cancel-button" @click="confirmDialogVisible = false">
            <i class="material-icons">close</i>
            <span>Cancelar</span>
          </button>
          <button class="confirm-button" @click="confirmarFinalizacao">
            <i class="material-icons">check</i>
            <span>Confirmar</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const { $supabase } = useNuxtApp();
const router = useRouter();

// Estado dos registros
const registros = ref([]);
const loading = ref(true);
const statusFilter = ref('Em aberto');
const expandedCards = ref({});
const confirmDialogVisible = ref(false);
const currentRegistroId = ref(null);

// Filtrar registros com base no status selecionado
const filteredRegistros = computed(() => {
  if (statusFilter.value === 'Em aberto') {
    return registros.value.filter(registro => !registro.finalizado);
  } else if (statusFilter.value === 'Finalizado') {
    return registros.value.filter(registro => registro.finalizado);
  }
  return registros.value;
});

// Buscar dados ao carregar a página
onMounted(async () => {
  await fetchData();
});

// Buscar dados da API
const fetchData = async () => {
  try {
    loading.value = true;
    
    const { data, error } = await $supabase
      .from('pest_control_services')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    registros.value = data || [];
    
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    // Mostrar mensagem de erro
  } finally {
    loading.value = false;
  }
};

// Atualizar dados
const refreshData = async () => {
  await fetchData();
};

// Formatar data
const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Expandir/colapsar card
const toggleCard = (id) => {
  expandedCards.value = {
    ...expandedCards.value,
    [id]: !expandedCards.value[id]
  };
};

// Verificar se tem serviços de dedetização
const temServicosDedetizacao = (registro) => {
  return registro.dedetizacao_barata || 
         registro.dedetizacao_traca || 
         registro.dedetizacao_formiga || 
         registro.dedetizacao_escorpiao || 
         registro.dedetizacao_percevejo || 
         registro.dedetizacao_carrapatos || 
         registro.dedetizacao_pulga || 
         registro.dedetizacao_aranha || 
         registro.dedetizacao_outros;
};

// Verificar se tem outros serviços
const temOutrosServicos = (registro) => {
  return registro.desratizacao_roedores || 
         registro.descupinazao_cupimdesolo || 
         registro.descupinazao_cupimdemadeira || 
         registro.desalojamento_morcego || 
         registro.desalojamento_pombo_aves;
};

// Iniciar processo de finalização
const finalizarServico = (id) => {
  currentRegistroId.value = id;
  confirmDialogVisible.value = true;
};

// Confirmar finalização do serviço
const confirmarFinalizacao = async () => {
  try {
    loading.value = true;
    
    const { error } = await $supabase
      .from('pest_control_services')
      .update({
        finalizado: true,
        data_realizado: new Date().toISOString().split('T')[0]
      })
      .eq('id', currentRegistroId.value);
    
    if (error) throw error;
    
    // Atualizar localmente
    const index = registros.value.findIndex(r => r.id === currentRegistroId.value);
    if (index !== -1) {
      registros.value[index].finalizado = true;
      registros.value[index].data_realizado = new Date().toISOString().split('T')[0];
    }
    
    // Fechar diálogo
    confirmDialogVisible.value = false;
    
    // Mostrar mensagem de sucesso
    alert('Serviço finalizado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao finalizar serviço:', error);
    alert('Erro ao finalizar serviço. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

// Ver detalhes completos
const viewDetails = (id) => {
  // Implementar visualização detalhada ou edição
  alert('Funcionalidade de visualização detalhada em desenvolvimento');
};
</script>

<style scoped>
/* Estilos gerais */
.page-content {
  padding: 16px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.back-button {
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  padding: 8px;
  margin-right: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-button:hover {
  background-color: rgba(76, 175, 80, 0.1);
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

/* Filtros */
.filters-section {
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding-bottom: 8px;
}

.filter-tab {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab i {
  font-size: 18px;
  margin-right: 4px;
}

.filter-tab.active {
  background-color: var(--primary-color);
  color: white;
}

/* Estados de carregamento e vazio */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(76, 175, 80, 0.2);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  color: #ccc;
  margin-bottom: 16px;
}

.refresh-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  margin-top: 16px;
  cursor: pointer;
}

.refresh-button i {
  font-size: 18px;
  margin-right: 4px;
  color: white;
}

/* Cards de registro */
.registros-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.registro-card {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.registro-header {
  padding: 16px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.registro-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.registro-id {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.status-icon {
  margin-right: 8px;
  font-size: 20px;
}

.status-aberto {
  color: #ff9800;
}

.status-finalizado {
  color: #4CAF50;
}

.cliente-name {
  font-size: 14px;
  color: #555;
}

.registro-date {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #777;
}

.date-icon {
  font-size: 16px;
  margin-right: 4px;
}

.registro-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.registro-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background-color: #f5f5f5;
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

/* Conteúdo expandível */
.registro-expandable {
  padding: 0 16px 16px;
  border-top: 1px solid #eee;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 16px 0 8px;
  font-weight: 600;
  font-size: 16px;
}

.section-title i {
  margin-right: 8px;
  color: var(--primary-color);
}

.details-grid {
  display: grid;
  gap: 8px;
}

.detail-row {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: #777;
}

.detail-value {
  font-size: 14px;
  display: flex;
  align-items: center;
}

.detail-icon {
  font-size: 16px;
  margin-right: 4px;
  color: #555;
}

.highlight {
  font-weight: 600;
  color: var(--primary-color);
}

/* Serviços */
.services-section {
  margin-top: 16px;
}

.services-grid {
  display: grid;
  gap: 16px;
}

.service-category h4 {
  margin: 0 0 8px;
  font-size: 14px;
  color: #555;
}

.service-items {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.service-item {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  background-color: #f5f5f5;
  border-radius: 16px;
  font-size: 12px;
}

.service-item i {
  font-size: 14px;
  margin-right: 4px;
  color: var(--primary-color);
}

/* Botões de ação */
.action-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.action-button {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.action-button i {
  font-size: 16px;
  margin-right: 4px;
}

/* Diálogo de confirmação */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
}

.confirm-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  z-index: 101;
  overflow: hidden;
}

.dialog-header {
  padding: 16px;
  background-color: var(--primary-color);
  color: white;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
}

.dialog-content {
  padding: 16px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px 16px;
  gap: 8px;
}

.cancel-button, .confirm-button {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-button {
  background-color: #f5f5f5;
  color: #555;
}

.confirm-button {
  background-color: var(--primary-color);
  color: white;
}

.cancel-button i, .confirm-button i {
  font-size: 16px;
  margin-right: 4px;
}
</style>
