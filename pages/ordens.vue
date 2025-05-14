<template>
  <div class="mobile-container">
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Cabeçalho com animação -->
      <div class="page-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }">
        <button class="back-button" @click="router.push('/home')">
          <i class="material-icons">arrow_back</i>
        </button>
        <h1 class="page-title">Ordens de Serviço</h1>
      </div>
      
      <!-- Filtros com animação e melhor responsividade -->
      <div class="filters-section" v-motion :initial="{ opacity: 0, y: -10 }" :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 100 } }">
        <div class="filter-tabs">
          <button 
            class="filter-tab" 
            :class="{ active: statusFilter === 'todos' }" 
            @click="statusFilter = 'todos'"
          >
            <i class="material-icons">list_alt</i>
            <span>Todos</span>
          </button>
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
            :class="{ active: statusFilter === 'Em atraso' }" 
            @click="statusFilter = 'Em atraso'"
          >
            <i class="material-icons">event_busy</i>
            <span>Em atraso</span>
          </button>
          <button
            class="filter-tab" 
            :class="{ active: statusFilter === 'Realizado' }" 
            @click="statusFilter = 'Realizado'"
          >
            <i class="material-icons">check_circle</i>
            <span>Realizadas</span>
          </button>
          <button
            class="filter-tab" 
            :class="{ active: statusFilter === 'impossibilidade' }" 
            @click="statusFilter = 'impossibilidade'"
          >
            <i class="material-icons">report_problem</i>
            <span>Impossibilidades</span>
          </button>
        </div>
      </div>
      
      <!-- Estados de carregamento e vazio melhorados -->
      <div v-if="loading" class="loading-container" v-motion :initial="{ opacity: 0 }" :enter="{ opacity: 1, transition: { duration: 300 } }">
        <div class="loading-spinner"></div>
        <p>Carregando ordens de serviço...</p>
      </div>
      
      <div v-else-if="filteredOrdens.length === 0" class="empty-state" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }">
        <i class="material-icons">assignment_late</i>
        <p>Nenhuma ordem de serviço encontrada</p>
        <button class="refresh-button" @click="refreshData">
          <i class="material-icons">refresh</i>
          <span>Atualizar</span>
        </button>
      </div>
      
      <div v-else class="orders-list">
        <div 
          v-for="(ordem, index) in filteredOrdens" 
          :key="ordem.id" 
          class="order-card"
          :class="getStatusClass(ordem)"
          v-motion 
          :initial="{ opacity: 0, y: 20 }" 
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
        >
          <!-- Cabeçalho do card (sempre visível) -->
          <div class="order-header" @click="toggleCard(ordem.id)" :class="{ 'pulse': isNewCard(ordem.id) }">
            <div class="order-summary">
              <div class="order-id">
                <i class="material-icons status-icon" :class="getStatusClass(ordem)">{{ getStatusIcon(ordem) }}</i>
                OS #{{ ordem.id }}
              </div>
              <div class="client-name">{{ getClienteNome(ordem.cliente_id) }}</div>
              <div class="generator-name">{{ ordem.gerador || 'Sem gerador' }}</div>
            </div>
            <div class="order-meta">
              <div class="order-date" v-if="getRotaData(ordem.id)">
                <i class="material-icons date-icon">event</i>
                {{ formatDateShort(getRotaData(ordem.id)) }}
              </div>
              <div class="order-status" :class="getStatusClass(ordem)">
                {{ getStatusText(ordem) }}
              </div>
              <div class="toggle-container">
                <i class="material-icons toggle-icon" :class="{ 'expanded': expandedCards[ordem.id] }">
                  expand_more
                </i>
              </div>
            </div>
          </div>
          
          <!-- Conteúdo expandível com animação -->
          <div class="order-expandable" v-if="expandedCards[ordem.id]" v-motion :initial="{ opacity: 0, height: 0 }" :enter="{ opacity: 1, height: 'auto', transition: { duration: 300 } }">
            <!-- Detalhes da ordem com melhor organização -->
            <div class="order-details">
              <div class="section-title">
                <i class="material-icons">description</i>
                <span>Detalhes da Ordem</span>
              </div>
              
              <div class="details-grid">
                <div class="detail-row">
                  <div class="detail-label">Nome Fantasia:</div>
                  <div class="detail-value highlight">{{ ordem.nomefantasia || 'Não informado' }}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">Criada em:</div>
                  <div class="detail-value">
                    <i class="material-icons detail-icon">event_note</i>
                    {{ formatDate(ordem.created_at) }}
                  </div>
                </div>
                
                <div v-if="ordem.data_realizacao" class="detail-row">
                  <div class="detail-label">Data Realização:</div>
                  <div class="detail-value">
                    <i class="material-icons detail-icon">event_available</i>
                    {{ formatDate(ordem.data_realizacao) }}
                  </div>
                </div>
                
                <div v-if="getRotaInfo(ordem.id)" class="detail-row">
                  <div class="detail-label">Horário:</div>
                  <div class="detail-value">
                    <i class="material-icons detail-icon">access_time</i>
                    {{ formatTime(getRotaInfo(ordem.id).hora_arealizar) }}
                  </div>
                </div>
              </div>
              
              <div class="details-section">
                <div v-if="getClienteRoda(ordem.cliente_id)?.grupo" class="detail-row">
                  <div class="detail-label">Grupos:</div>
                  <div class="detail-value">
                    <div class="tags-container">
                      <span v-for="(grupo, index) in getClienteRoda(ordem.cliente_id)?.grupo?.split(', ')" :key="index" class="tag">
                        <i class="material-icons tag-icon">group</i>
                        {{ grupo }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div v-if="getClienteRoda(ordem.cliente_id)?.frequenciacoleta" class="detail-row">
                  <div class="detail-label">Frequência:</div>
                  <div class="detail-value highlight">
                    <i class="material-icons detail-icon">repeat</i>
                    {{ getClienteRoda(ordem.cliente_id)?.frequenciacoleta }}
                  </div>
                </div>
                
                <div v-if="getClienteRoda(ordem.cliente_id)?.dias_coleta" class="detail-row">
                  <div class="detail-label">Dias de Coleta:</div>
                  <div class="detail-value">
                    <div class="tags-container">
                      <span v-for="(dia, index) in getClienteRoda(ordem.cliente_id)?.dias_coleta" :key="index" class="tag day-tag">
                        <i class="material-icons tag-icon">today</i>
                        {{ dia }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="details-section">
                <div v-if="ordem.mtr && ordem.mtr.length > 0" class="detail-row">
                  <div class="detail-label">MTR:</div>
                  <div class="detail-value">
                    <div class="tags-container">
                      <span v-for="(mtr, index) in ordem.mtr" :key="index" class="tag mtr-tag">
                        <i class="material-icons tag-icon">receipt</i>
                        {{ mtr }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div v-if="ordem.peso_coletado && ordem.peso_coletado.length > 0" class="detail-row">
                  <div class="detail-label">Peso Coletado:</div>
                  <div class="detail-value highlight">
                    <i class="material-icons detail-icon">scale</i>
                    {{ ordem.peso_coletado.join(', ') }} kg
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Detalhes do cliente com melhor organização e links clicáveis -->
            <div class="client-details" v-if="clientesMap[ordem.cliente_id]">
              <div class="section-title">
                <i class="material-icons">business</i>
                <span>Detalhes do Cliente</span>
              </div>
              
              <div class="detail-card">
                <div class="detail-row">
                  <div class="detail-label">Empresa:</div>
                  <div class="detail-value highlight">{{ clientesMap[ordem.cliente_id].empresa || clientesMap[ordem.cliente_id].nome_cliente || 'Não informado' }}</div>
                </div>
                
                <div class="detail-row">
                  <div class="detail-label">Endereço:</div>
                  <div class="detail-value">
                    <a 
                      :href="`https://maps.google.com/?q=${encodeURIComponent(formatEndereco(clientesMap[ordem.cliente_id]))}`" 
                      target="_blank" 
                      class="map-link"
                    >
                      <i class="material-icons">place</i>
                      {{ formatEndereco(clientesMap[ordem.cliente_id]) }}
                    </a>
                  </div>
                </div>
                
                <div class="contact-grid">
                  <div class="detail-row">
                    <div class="detail-label">Contato:</div>
                    <div class="detail-value">
                      <a 
                        v-if="clientesMap[ordem.cliente_id].telefone" 
                        :href="`tel:${clientesMap[ordem.cliente_id].telefone.replace(/\D/g, '')}`" 
                        class="phone-link"
                      >
                        <i class="material-icons">phone</i>
                        {{ clientesMap[ordem.cliente_id].telefone }}
                      </a>
                      <span v-else>Não informado</span>
                    </div>
                  </div>
                  
                  <div class="detail-row">
                    <div class="detail-label">Email:</div>
                    <div class="detail-value">
                      <a 
                        v-if="clientesMap[ordem.cliente_id].email" 
                        :href="`mailto:${clientesMap[ordem.cliente_id].email}`" 
                        class="email-link"
                      >
                        <i class="material-icons">email</i>
                        {{ clientesMap[ordem.cliente_id].email }}
                      </a>
                      <span v-else>Não informado</span>
                    </div>
                  </div>
                  
                  <!-- WhatsApp removido desta seção -->
                </div>
              </div>
            </div>
            
            <!-- Ações da ordem com botões mais atraentes -->
            <div class="order-actions">
              <button 
                class="action-button details-button" 
                @click="viewDetails(ordem.id)" 
                :disabled="ordem.status === 'Realizado' || ordem.status === 'Finalizado'" 
                :class="{'disabled-button': ordem.status === 'Realizado' || ordem.status === 'Finalizado'}">
                <i class="material-icons">visibility</i>
                <span>Coletas</span>
              </button>
              
              <button class="action-button impossibility-button" v-if="!ordem.realizado && !ordem.impossibilidade" @click="openImpossibilitySheet(ordem.id)">
                <i class="material-icons">report_problem</i>
                <span>Marcar Impossibilidade</span>
              </button>
              
              <a 
                v-if="getRotaInfo(ordem.id) && getRotaInfo(ordem.id).whatsapp" 
                :href="openWhatsApp(getRotaInfo(ordem.id).whatsapp)" 
                target="_blank" 
                rel="noopener noreferrer"
                class="action-button whatsapp-button"
              >
                <span class="whatsapp-text">WhatsApp</span>
              </a>
              
              <!-- Botão de compartilhar removido -->
            </div>
          </div>
        </div>
      </div>
      
      <!-- Botão flutuante para atualizar -->
      <button class="floating-button" @click="refreshData" v-if="!loading && filteredOrdens.length > 0">
        <i class="material-icons">refresh</i>
      </button>
      
      <!-- Bottom Sheet para coletas -->
      <div class="bottom-sheet-overlay" v-if="bottomSheetVisible" @click="closeBottomSheet"></div>
      <div class="bottom-sheet" v-if="bottomSheetVisible" :class="{ 'visible': bottomSheetVisible }">
        <div class="bottom-sheet-header">
          <h2>Registrar Coleta</h2>
          <button class="close-button" @click="closeBottomSheet">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="bottom-sheet-content">
          <div class="mtr-items">
            <div v-for="(item, index) in mtrItems" :key="index" class="mtr-item">
              <div class="mtr-item-header">
                <h3>Item #{{ index + 1 }}</h3>
                <button v-if="mtrItems.length > 1" class="remove-button" @click="removeMtrItem(index)">
                  <i class="material-icons">delete</i>
                </button>
              </div>
              
              <div class="form-group">
                <label>MTR</label>
                <input type="text" v-model="item.mtr" placeholder="Digite o MTR" />
              </div>
              
              <div class="form-group">
                <label>Grupo</label>
                <select v-model="item.grupo">
                  <option value="" disabled>Selecione um grupo</option>
                  <option v-for="grupo in gruposOptions" :key="grupo" :value="grupo">{{ grupo }}</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Peso (kg)</label>
                <input 
                  type="text" 
                  v-model="item.peso" 
                  @input="validarPeso($event, index)" 
                  placeholder="Digite o peso" 
                />
              </div>
            </div>
          </div>
          
          <button class="add-button" @click="addMtrItem">
            <i class="material-icons">add</i>
            <span>Adicionar Item</span>
          </button>
          
          <div class="total-peso">
            <span>Peso Total:</span>
            <strong>{{ totalPeso.toFixed(2) }} kg</strong>
          </div>
          
          <div class="form-group">
            <label>Observações</label>
            <textarea v-model="observacoes" placeholder="Digite observações (opcional)"></textarea>
          </div>
          
          <button class="save-button" @click="showConfirmDialog">
            <i class="material-icons">check</i>
            <span>Concluir e Salvar</span>
          </button>
        </div>
      </div>
      
      <!-- Bottom Sheet para impossibilidade -->
      <div class="bottom-sheet-overlay" v-if="impossibilitySheetVisible" @click="closeImpossibilitySheet"></div>
      <div class="bottom-sheet" v-if="impossibilitySheetVisible" :class="{ 'visible': impossibilitySheetVisible }">
        <div class="bottom-sheet-header">
          <h2>Registrar Impossibilidade</h2>
          <button class="close-button" @click="closeImpossibilitySheet">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="bottom-sheet-content">
          <div class="form-group">
            <label>Motivo da Impossibilidade <span class="required">*</span></label>
            <select v-model="impossibilityType">
              <option disabled value="">Selecione um motivo</option>
              <option v-for="option in impossibilityOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </div>
          
          <div class="form-group" v-if="impossibilityType !== 'Local Fechado'">
            <label>Responsável no local <span class="required">*</span></label>
            <input type="text" placeholder="Digite o nome do responsável" v-model="impossibilityResponsavel">
          </div>
          
          <div class="form-group">
            <label>Observações</label>
            <textarea placeholder="Digite observações (opcional)" v-model="impossibilityObservacoes"></textarea>
          </div>
          
          <button class="save-button" @click="showImpossibilityConfirmDialog">
            <i class="material-icons">check</i>
            <span>Concluir e Salvar</span>
          </button>
        </div>
      </div>
      
      <!-- Diálogo de Confirmação -->
      <div class="dialog-overlay" v-if="confirmDialogVisible" @click="confirmDialogVisible = false"></div>
      <div class="confirm-dialog" v-if="confirmDialogVisible">
        <div class="dialog-header">
          <h3>Confirmar Ação</h3>
        </div>
        <div class="dialog-content">
          <p>Tem certeza que deseja registrar esta coleta?</p>
          <p>Serão registrados {{ mtrItems.length }} itens com peso total de {{ totalPeso.toFixed(2) }} kg.</p>
        </div>
        <div class="dialog-actions">
          <button class="cancel-button" @click="confirmDialogVisible = false">
            <i class="material-icons">close</i>
            <span>Cancelar</span>
          </button>
          <button class="confirm-button" @click="salvarColeta">
            <i class="material-icons">check</i>
            <span>Confirmar</span>
          </button>
        </div>
      </div>
      
      <!-- Diálogo de Confirmação de Impossibilidade -->
      <div class="dialog-overlay" v-if="impossibilityConfirmDialogVisible" @click="impossibilityConfirmDialogVisible = false"></div>
      <div class="confirm-dialog" v-if="impossibilityConfirmDialogVisible">
        <div class="dialog-header">
          <h3>Confirmar Ação</h3>
        </div>
        <div class="dialog-content">
          <p>Tem certeza que deseja registrar esta impossibilidade?</p>
        </div>
        <div class="dialog-actions">
          <button class="cancel-button" @click="impossibilityConfirmDialogVisible = false">
            <i class="material-icons">close</i>
            <span>Cancelar</span>
          </button>
          <button class="confirm-button" @click="markAsImpossibility">
            <i class="material-icons">check</i>
            <span>Confirmar</span>
          </button>
        </div>
      </div>
      
      <!-- Snackbar -->
      <transition name="snackbar-fade">
        <div class="snackbar" v-if="snackbarVisible">
          <div class="snackbar-content">
            <i class="material-icons snackbar-icon">check_circle</i>
            <span>{{ snackbarMessage }}</span>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
});

const { $supabase } = useNuxtApp();
const router = useRouter();
const user = ref(null);
const loading = ref(false);
const ordens = ref([]);
const clientes = ref([]);
const clientesMap = ref({});
const statusFilter = ref('Em aberto');
const expandedCards = ref({});
const rotas = ref([]);
const rotasMap = ref({});
const clientesRoda = ref([]);
const clientesRodaMap = ref({});
const newCards = ref({});
const lastRefresh = ref(new Date());

// Verificar se o usuário está autenticado
onMounted(async () => {
  try {
    const { data } = await $supabase.auth.getSession();
    if (data.session) {
      user.value = data.session.user;
      await refreshData();
    } else {
      router.push('/');
    }
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    loading.value = false;
  }
});

// Atualizar dados periodicamente (a cada 5 minutos)
let refreshInterval;
onMounted(() => {
  refreshInterval = setInterval(() => {
    if (!loading.value) {
      refreshData();
    }
  }, 5 * 60 * 1000); // 5 minutos
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

// Buscar ordens de serviço do usuário logado
const fetchOrdens = async () => {
  try {
    loading.value = true;
    
    if (!user.value?.id) {
      loading.value = false;
      return;
    }
    
    // Buscar todas as ordens de serviço do funcionário
    const { data: ordensData, error: ordensError } = await $supabase
      .from('ordem_servico')
      .select('*')
      .eq('funcionario_id', user.value.id);
      
    if (ordensError) throw ordensError;
    
    if (ordensData) {
      ordens.value = ordensData;
      
      // Extrair todos os IDs de clientes únicos
      const clienteIds = [...new Set(ordensData.map(ordem => ordem.cliente_id))];
      
      // Buscar informações dos clientes
      if (clienteIds.length > 0) {
        const { data: clientesData, error: clientesError } = await $supabase
          .from('clientes')
          .select('*')
          .in('id', clienteIds);
          
        if (clientesError) throw clientesError;
        
        if (clientesData) {
          clientes.value = clientesData;
          
          // Criar mapa de clientes para acesso rápido
          clientesData.forEach(cliente => {
            clientesMap.value[cliente.id] = cliente;
          });
        }
      }
    }
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
  } finally {
    loading.value = false;
  }
};

// Buscar rotas associadas às ordens de serviço
const fetchRotas = async () => {
  try {
    if (!user.value?.id) return;
    
    // Buscar todas as rotas do funcionário
    const { data: rotasData, error: rotasError } = await $supabase
      .from('rotas')
      .select('*')
      .eq('usuario_id_funcionario', user.value.id);
      
    if (rotasError) throw rotasError;
    
    if (rotasData) {
      rotas.value = rotasData;
      
      // Criar mapa de rotas por ordem_id para acesso rápido
      rotasData.forEach(rota => {
        if (rota.ordem_id) {
          rotasMap.value[rota.ordem_id] = rota;
        }
      });
    }
  } catch (error) {
    console.error('Erro ao buscar rotas:', error);
  }
};

// Buscar dados da view clientes_roda
const fetchClientesRoda = async () => {
  try {
    if (!clientes.value.length) return;
    
    // Extrair todos os IDs de clientes únicos
    const clienteIds = clientes.value.map(cliente => cliente.id);
    
    // Buscar informações da view clientes_roda
    const { data: clientesRodaData, error: clientesRodaError } = await $supabase
      .from('clientes_roda')
      .select('*')
      .in('id', clienteIds);
      
    if (clientesRodaError) throw clientesRodaError;
    
    if (clientesRodaData) {
      clientesRoda.value = clientesRodaData;
      
      // Criar mapa de clientes_roda por id para acesso rápido
      clientesRodaData.forEach(cliente => {
        clientesRodaMap.value[cliente.id] = cliente;
      });
    }
  } catch (error) {
    console.error('Erro ao buscar dados da view clientes_roda:', error);
  }
};

// Alternar a exibição do card
const toggleCard = (ordemId) => {
  expandedCards.value = {
    ...expandedCards.value,
    [ordemId]: !expandedCards.value[ordemId]
  };
};

// Obter informações da rota para uma ordem específica
const getRotaInfo = (ordemId) => {
  return rotasMap.value[ordemId] || null;
};

// Obter data da rota para uma ordem específica
const getRotaData = (ordemId) => {
  const rota = rotasMap.value[ordemId];
  return rota ? rota.dia_arealizar : null;
};

// Formatar data curta (apenas dia e mês)
const formatDateShort = (dateString) => {
  if (!dateString) return '';
  
  // Corrigir problema de fuso horário adicionando 'T00:00:00' e tratando como data local
  // Isso garante que a data seja interpretada no fuso horário local sem deslocamento
  const parts = dateString.split('T')[0].split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Meses em JS são 0-11
  const day = parseInt(parts[2]);
  
  const date = new Date(year, month, day);
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit'
  });
};

// Formatar hora
const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.substring(0, 5); // Formato HH:MM
};

// Verificar se uma ordem está atrasada
const isOverdue = (ordem) => {
  const rota = getRotaInfo(ordem.id);
  if (!rota || !rota.dia_arealizar) return false;
  
  // Corrigir problema de fuso horário extraindo os componentes da data
  const parts = rota.dia_arealizar.split('T')[0].split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Meses em JS são 0-11
  const day = parseInt(parts[2]);
  
  const dataRealizar = new Date(year, month, day);
  const hoje = new Date();
  
  // Resetar horas para comparar apenas as datas
  dataRealizar.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  
  // Uma ordem está atrasada apenas se a data programada for ANTERIOR à data atual
  // Se a data for igual à atual, a ordem ainda está no prazo
  return dataRealizar.getTime() < hoje.getTime();
};

// Função para abrir o WhatsApp com o número formatado
const openWhatsApp = (whatsappNumber) => {
  // Formatar o número removendo caracteres não numéricos
  const formattedNumber = whatsappNumber.toString().replace(/\D/g, '');
  
  // Usar um formato alternativo que tem menos chances de ser bloqueado
  // Tentando com whatsapp://send?phone=NUMERO que é o protocolo nativo
  return `whatsapp://send?phone=55${formattedNumber}`;
};

// Filtrar ordens por status
const filteredOrdens = computed(() => {
  if (statusFilter.value === 'todos') {
    return ordens.value;
  }
  
  // Filtro de impossibilidade
  if (statusFilter.value === 'impossibilidade') {
    const impossibilidadeStatus = [
      'Ausência do responsável de liberação',
      'Local Fechado',
      'Não há resíduos para coletar',
      'Sem MTR'
    ];
    return ordens.value.filter(ordem => impossibilidadeStatus.includes(ordem.status));
  }
  
  // Outros filtros
  if (statusFilter.value === 'Realizado') {
    // Filtrar apenas ordens com status 'Finalizado'
    return ordens.value.filter(ordem => ordem.status === 'Finalizado');
  } else if (statusFilter.value === 'Em aberto') {
    return ordens.value.filter(ordem => ordem.status === 'Em aberto' && !isOverdue(ordem));
  } else if (statusFilter.value === 'Em atraso') {
    return ordens.value.filter(ordem => ordem.status === 'Em aberto' && isOverdue(ordem));
  }
  
  return ordens.value;
});

// Obter classe CSS com base no status da ordem
const getStatusClass = (ordem) => {
  if (ordem.realizado) {
    return 'status-realizado';
  }
  
  // Verificar se existe rota para esta ordem
  const rota = getRotaInfo(ordem.id);
  if (!rota || !rota.dia_arealizar) {
    return 'status-pendente';
  }
  
  // Corrigir problema de fuso horário extraindo os componentes da data
  const parts = rota.dia_arealizar.split('T')[0].split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Meses em JS são 0-11
  const day = parseInt(parts[2]);
  
  const dataRealizar = new Date(year, month, day);
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);
  
  // Resetar horas para comparar apenas as datas
  dataRealizar.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  amanha.setHours(0, 0, 0, 0);
  
  if (dataRealizar.getTime() < hoje.getTime()) {
    return 'status-atrasado';
  } else if (
    dataRealizar.getTime() === hoje.getTime() || 
    dataRealizar.getTime() === amanha.getTime()
  ) {
    return 'status-realizar';
  } else {
    return 'status-pendente';
  }
};

// Obter texto do status da ordem
const getStatusText = (ordem) => {
  if (ordem.realizado) {
    return 'Realizado';
  }
  
  // Verificar se existe rota para esta ordem
  const rota = getRotaInfo(ordem.id);
  if (!rota || !rota.dia_arealizar) {
    return 'Pendente';
  }
  
  // Corrigir problema de fuso horário extraindo os componentes da data
  const parts = rota.dia_arealizar.split('T')[0].split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Meses em JS são 0-11
  const day = parseInt(parts[2]);
  
  const dataRealizar = new Date(year, month, day);
  const hoje = new Date();
  const amanha = new Date();
  amanha.setDate(hoje.getDate() + 1);
  
  // Resetar horas para comparar apenas as datas
  dataRealizar.setHours(0, 0, 0, 0);
  hoje.setHours(0, 0, 0, 0);
  amanha.setHours(0, 0, 0, 0);
  
  // Comparação das datas sem problemas de fuso horário
  
  if (dataRealizar.getTime() < hoje.getTime()) {
    return 'Em atraso';
  } else if (dataRealizar.getTime() === hoje.getTime()) {
    return 'Hoje';
  } else if (dataRealizar.getTime() === amanha.getTime()) {
    return 'Amanhã';
  } else {
    return 'Em aberto';
  }
};

// Formatar data
const formatDate = (dateString) => {
  if (!dateString) return 'Não definida';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Obter nome do cliente
const getClienteNome = (clienteId) => {
  const cliente = clientesMap.value[clienteId];
  if (!cliente) return 'Cliente não encontrado';
  
  return cliente.empresa || cliente.nome_cliente || cliente.razaosocial || 'Sem nome';
};

// Obter dados do cliente da view clientes_roda
const getClienteRoda = (clienteId) => {
  return clientesRodaMap.value[clienteId] || null;
};

// Formatar endereço do cliente
const formatEndereco = (cliente) => {
  if (!cliente) return 'Endereço não disponível';
  
  const parts = [];
  
  if (cliente.rua) parts.push(cliente.rua);
  if (cliente.endereco) parts.push(cliente.endereco);
  if (cliente.complemento && cliente.complemento !== 'não informado') parts.push(cliente.complemento);
  if (cliente.bairro && cliente.bairro !== 'não informado') parts.push(cliente.bairro);
  if (cliente.municipio || cliente.localidade) parts.push(cliente.municipio || cliente.localidade);
  if (cliente.uf) parts.push(cliente.uf);
  if (cliente.cep && cliente.cep !== '28976216') parts.push(cliente.cep);
  
  return parts.length > 0 ? parts.join(', ') : 'Endereço não informado';
};

// Formatar número de WhatsApp para exibição
const formatWhatsApp = (whatsapp) => {
  if (!whatsapp) return '';
  
  // Formatar número para exibição mais amigável
  const cleaned = whatsapp.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  }
  return whatsapp;
};

// Verificar se o card é novo (adicionado desde o último refresh)
const isNewCard = (ordemId) => {
  return newCards.value[ordemId] === true;
};

// Obter ícone de status para a ordem
const getStatusIcon = (ordem) => {
  if (ordem.realizado) {
    return 'check_circle';
  }
  
  const statusClass = getStatusClass(ordem);
  
  if (statusClass === 'status-atrasado') {
    return 'error';
  } else if (statusClass === 'status-realizar') {
    return 'event_available';
  } else if (statusClass === 'status-pendente') {
    return 'pending';
  }
  
  return 'assignment';
};

// Atualizar dados
const refreshData = async () => {
  loading.value = true;
  lastRefresh.value = new Date();
  
  // Salvar IDs das ordens atuais para comparação
  const currentOrdemIds = ordens.value.map(ordem => ordem.id);
  
  await fetchOrdens();
  await fetchRotas();
  await fetchClientesRoda();
  
  // Identificar novas ordens para animação
  const newOrdemIds = ordens.value
    .filter(ordem => !currentOrdemIds.includes(ordem.id))
    .map(ordem => ordem.id);
  
  // Marcar novas ordens
  newCards.value = {};
  newOrdemIds.forEach(id => {
    newCards.value[id] = true;
  });
  
  // Limpar marcação após 3 segundos
  setTimeout(() => {
    newCards.value = {};
  }, 3000);
  
  loading.value = false;
};

// Variáveis para o bottom sheet de coletas
const bottomSheetVisible = ref(false);
const currentOrdemId = ref(null);
const mtrItems = ref([]);
const totalPeso = ref(0);
const observacoes = ref('');
const confirmDialogVisible = ref(false);

// Variáveis para o snackbar
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarTimeout = ref(null);

// Opções de grupos disponíveis
const gruposOptions = [
  'GRUPO A',
  'GRUPO B',
  'GRUPO E',
  'CLASSE I',
  'CLASSE II'
];

// Abrir o bottom sheet de coletas
const viewDetails = (ordemId) => {
  currentOrdemId.value = ordemId;
  
  // Inicializar com um item vazio
  mtrItems.value = [
    { mtr: '', grupo: '', peso: '' }
  ];
  
  observacoes.value = '';
  totalPeso.value = 0;
  bottomSheetVisible.value = true;
};

// Adicionar novo item MTR
const addMtrItem = () => {
  mtrItems.value.push({ mtr: '', grupo: '', peso: '' });
};

// Remover item MTR
const removeMtrItem = (index) => {
  if (mtrItems.value.length > 1) {
    mtrItems.value.splice(index, 1);
    calcularTotalPeso();
  }
};

// Validar entrada de peso (apenas números e ponto decimal)
const validarPeso = (event, index) => {
  const value = event.target.value;
  // Permitir apenas números e um ponto decimal
  if (!/^\d*\.?\d*$/.test(value)) {
    mtrItems.value[index].peso = mtrItems.value[index].peso.replace(/[^\d.]/g, '');
  }
  calcularTotalPeso();
};

// Calcular o total do peso
const calcularTotalPeso = () => {
  totalPeso.value = mtrItems.value.reduce((sum, item) => {
    const peso = parseFloat(item.peso) || 0;
    return sum + peso;
  }, 0);
};

// Fechar o bottom sheet
const closeBottomSheet = () => {
  bottomSheetVisible.value = false;
};

// Mostrar diálogo de confirmação
const showConfirmDialog = () => {
  // Validar se todos os campos obrigatórios estão preenchidos
  const isValid = mtrItems.value.every(item => 
    item.mtr.trim() !== '' && 
    item.grupo !== '' && 
    item.peso.trim() !== ''
  );
  
  if (!isValid) {
    alert('Por favor, preencha todos os campos de MTR, Grupo e Peso.');
    return;
  }
  
  confirmDialogVisible.value = true;
};

// Mostrar snackbar
const showSnackbar = (message) => {
  // Limpar qualquer timeout existente
  if (snackbarTimeout.value) {
    clearTimeout(snackbarTimeout.value);
  }
  
  // Definir mensagem e mostrar snackbar
  snackbarMessage.value = message;
  snackbarVisible.value = true;
  
  // Configurar timeout para esconder o snackbar após 3 segundos
  snackbarTimeout.value = setTimeout(() => {
    snackbarVisible.value = false;
  }, 3000);
};

// Salvar os dados da coleta
const salvarColeta = async () => {
  try {
    loading.value = true;
    
    const mtrArray = mtrItems.value.map(item => item.mtr);
    const gruposArray = mtrItems.value.map(item => item.grupo);
    const pesoArray = mtrItems.value.map(item => parseFloat(item.peso));
    
    const { error } = await $supabase
      .from('ordem_servico')
      .update({
        mtr: mtrArray,
        grupos: gruposArray,
        peso_coletado: pesoArray,
        observacoes: observacoes.value,
        realizado: true,
        data_realizacao: new Date().toISOString(),
        status: 'Realizado'
      })
      .eq('id', currentOrdemId.value);
      
    if (error) throw error;
    
    // Atualizar a tabela de rotas para status "Em análise"
    const rotaInfo = getRotaInfo(currentOrdemId.value);
    if (rotaInfo && rotaInfo.id) {
      const { error: rotaError } = await $supabase
        .from('rotas')
        .update({ status: 'Em análise' })
        .eq('id', rotaInfo.id);
        
      if (rotaError) {
        console.error('Erro ao atualizar status da rota:', rotaError);
        // Não interromper o fluxo se houver erro na atualização da rota
      }
    }
    
    // Atualizar localmente
    const index = ordens.value.findIndex(o => o.id === currentOrdemId.value);
    if (index !== -1) {
      ordens.value[index].mtr = mtrArray;
      ordens.value[index].grupos = gruposArray;
      ordens.value[index].peso_coletado = pesoArray;
      ordens.value[index].observacoes = observacoes.value;
      ordens.value[index].realizado = true;
      ordens.value[index].data_realizacao = new Date().toISOString();
      ordens.value[index].status = 'Realizado';
    }
    
    // Enviar dados para o webhook
    try {
      // Preparar os dados no formato especificado
      const ordem = ordens.value.find(o => o.id === currentOrdemId.value);
      const clienteNome = getClienteNome(ordem.cliente_id);
      
      // Formatar os dados de MTR, grupo e peso
      const mtrGrupoPeso = mtrItems.value.map(item => {
        return `MTR: ${item.mtr} - ${item.grupo} - PESO: ${item.peso}`;
      }).join(' | ');
      
      // Formatar a data no formato YYYY-MM-DD
      const dataRealizacao = new Date().toISOString().split('T')[0];
      
      // Montar o body da requisição
      const webhookData = {
        nome_cliente: clienteNome,
        mtr_grupo_peso: mtrGrupoPeso,
        data_realizacao: dataRealizacao
      };
      
      // Enviar para o webhook
      const webhookResponse = await fetch('https://n8nwebhook.paraisoambiental.com.br/webhook/59eae245-4434-412f-a5f3-2eea3bf8e1e5', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });
      
      if (!webhookResponse.ok) {
        console.warn('Aviso: Webhook retornou status', webhookResponse.status);
        // Não interromper o fluxo se houver erro no webhook
      } else {
        console.log('Webhook enviado com sucesso');
      }
    } catch (webhookError) {
      console.warn('Aviso: Erro ao enviar webhook:', webhookError);
      // Não interromper o fluxo principal se houver erro no webhook
    }
    
    // Fechar diálogos
    confirmDialogVisible.value = false;
    bottomSheetVisible.value = false;
    
    // Mostrar snackbar de sucesso
    showSnackbar('Coleta realizada com sucesso!');
    
  } catch (error) {
    console.error('Erro ao salvar coleta:', error);
    // Mostrar snackbar de erro
    showSnackbar('Erro ao salvar coleta. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

// Marcar ordem como realizada
const markAsCompleted = async (ordemId) => {
  try {
    loading.value = true;
    
    const { error } = await $supabase
      .from('ordem_servico')
      .update({ realizado: true, data_realizacao: new Date().toISOString() })
      .eq('id', ordemId);
      
    if (error) throw error;
    
    // Atualizar localmente
    const index = ordens.value.findIndex(o => o.id === ordemId);
    if (index !== -1) {
      ordens.value[index].realizado = true;
      ordens.value[index].data_realizacao = new Date().toISOString();
    }
    
    // Fechar card
    expandedCards.value[ordemId] = false;
    
  } catch (error) {
    console.error('Erro ao marcar ordem como realizada:', error);
    alert('Não foi possível marcar a ordem como realizada. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

// Compartilhar ordem
const shareOrdem = (ordemId) => {
  const ordem = ordens.value.find(o => o.id === ordemId);
  if (!ordem) return;
  
  const cliente = clientesMap.value[ordem.cliente_id];
  const clienteNome = cliente?.empresa || cliente?.nome_cliente || 'Cliente';
  
  const textoCompartilhamento = `Ordem de Serviço #${ordem.id}\nCliente: ${clienteNome}\nStatus: ${getStatusText(ordem)}\nGerador: ${ordem.gerador || 'Não informado'}`;
  
  if (navigator.share) {
    navigator.share({
      title: `OS #${ordem.id} - ${clienteNome}`,
      text: textoCompartilhamento
    }).catch(err => {
      console.error('Erro ao compartilhar:', err);
    });
  } else {
    // Fallback para navegadores que não suportam a API de compartilhamento
    alert(textoCompartilhamento);
  }
};

// Dados para o bottomsheet de impossibilidade
const impossibilitySheetVisible = ref(false);
const impossibilityType = ref('');
const impossibilityResponsavel = ref('');
const impossibilityObservacoes = ref('');
const currentImpossibilityOrdemId = ref(null);
const impossibilityConfirmDialogVisible = ref(false);

// Opções de impossibilidade
const impossibilityOptions = [
  'Ausência do responsável de liberação',
  'Local Fechado',
  'Não há resíduos para coletar',
  'Sem MTR'
];

// Abrir bottomsheet de impossibilidade
const openImpossibilitySheet = (ordemId) => {
  currentImpossibilityOrdemId.value = ordemId;
  impossibilityType.value = '';
  impossibilityResponsavel.value = '';
  impossibilityObservacoes.value = '';
  impossibilitySheetVisible.value = true;
};

// Fechar bottomsheet de impossibilidade
const closeImpossibilitySheet = () => {
  impossibilitySheetVisible.value = false;
};

// Mostrar diálogo de confirmação de impossibilidade
const showImpossibilityConfirmDialog = () => {
  // Validar se o tipo de impossibilidade foi selecionado
  if (!impossibilityType.value) {
    showSnackbar('Por favor, selecione o tipo de impossibilidade.');
    return;
  }
  
  // Validar se o responsável foi informado (exceto quando Local Fechado)
  if (impossibilityType.value !== 'Local Fechado' && !impossibilityResponsavel.value.trim()) {
    showSnackbar('Por favor, informe o responsável no local.');
    return;
  }
  
  impossibilityConfirmDialogVisible.value = true;
};

// Marcar ordem como impossibilidade
const markAsImpossibility = async () => {
  try {
    loading.value = true;
    
    const { error } = await $supabase
      .from('ordem_servico')
      .update({ 
        status: impossibilityType.value,
        responsavel_local: impossibilityResponsavel.value,
        observacoes: impossibilityObservacoes.value
      })
      .eq('id', currentImpossibilityOrdemId.value);
      
    if (error) throw error;
    
    // Atualizar a tabela de rotas com o mesmo status da ordem_servico
    const rotaInfo = getRotaInfo(currentImpossibilityOrdemId.value);
    if (rotaInfo && rotaInfo.id) {
      const { error: rotaError } = await $supabase
        .from('rotas')
        .update({ status: impossibilityType.value })
        .eq('id', rotaInfo.id);
        
      if (rotaError) {
        console.error('Erro ao atualizar status da rota:', rotaError);
        // Não interromper o fluxo se houver erro na atualização da rota
      }
    }
    
    // Atualizar localmente
    const index = ordens.value.findIndex(o => o.id === currentImpossibilityOrdemId.value);
    if (index !== -1) {
      ordens.value[index].status = impossibilityType.value;
      ordens.value[index].responsavel_local = impossibilityResponsavel.value;
      ordens.value[index].observacoes = impossibilityObservacoes.value;
    }
    
    // Fechar diálogos
    impossibilityConfirmDialogVisible.value = false;
    impossibilitySheetVisible.value = false;
    
    // Fechar card
    expandedCards.value[currentImpossibilityOrdemId.value] = false;
    
    // Mostrar snackbar de sucesso
    showSnackbar('Impossibilidade registrada com sucesso!');
    
  } catch (error) {
    console.error('Erro ao marcar impossibilidade:', error);
    showSnackbar('Não foi possível registrar a impossibilidade. Tente novamente.');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.back-button {
  background: none;
  border: none;
  color: var(--primary-color);
  padding: 10px;
  margin-right: 10px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.back-button:active {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(0.95);
}

.page-title {
  font-size: 22px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  color: var(--primary-color);
}

.filters-section {
  margin-bottom: 20px;
}

.filter-tabs {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  padding-bottom: 10px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
}

.filter-tabs::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.filter-tab {
  background-color: #f5f5f5;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-tab i {
  font-size: 16px;
}

.filter-tab.active {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.filter-tab:active {
  transform: scale(0.97);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top-color: var(--primary-color);
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-secondary-color);
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
  color: var(--primary-color);
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 20px;
}

.refresh-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: #ffffff;
  color: var(--primary-color);
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  padding: 0 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.08);
  margin-top: 12px;
  min-width: 140px;
  height: 44px;
  line-height: 1;
}

.refresh-button:hover {
  background-color: var(--primary-color);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
}

.refresh-button:hover .material-icons {
  animation: spin-once 0.5s ease;
}

@keyframes spin-once {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.refresh-button:active {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.refresh-button .material-icons {
  font-size: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px; /* Espaço para o botão flutuante */
}

.order-card {
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  border-left: 5px solid #ccc;
  transition: all 0.3s ease;
}

.order-card:active {
  transform: scale(0.99);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}

.order-card.status-realizado {
  border-left-color: #4CAF50;
}

.order-card.status-pendente {
  border-left-color: #2196F3;
}

.order-card.status-realizar {
  border-left-color: #FF9800;
}

.order-card.status-atrasado {
  border-left-color: #F44336;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
  position: relative;
  overflow: hidden;
}

.order-header:active {
  background-color: #f0f0f0;
}

.order-header.pulse {
  animation: pulse-animation 2s infinite;
}

@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--primary-color-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--primary-color-rgb), 0);
  }
}

.order-summary {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0; /* Para evitar overflow */
}

.order-id {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-icon {
  font-size: 18px;
}

.client-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary-color);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.generator-name {
  font-size: 13px;
  color: var(--text-secondary-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.order-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.order-date {
  font-size: 14px;
  color: var(--text-secondary-color);
  background-color: #f0f0f0;
  padding: 4px 8px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.date-icon {
  font-size: 14px;
}

.order-status {
  font-size: 14px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
  background-color: #eee;
  min-width: 80px;
  text-align: center;
}

.toggle-container {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-icon {
  transition: transform 0.3s ease;
  font-size: 20px;
  color: var(--text-secondary-color);
}

.toggle-icon.expanded {
  transform: rotate(180deg);
}

.status-icon.status-realizado {
  color: #4CAF50;
}

.status-icon.status-pendente {
  color: #2196F3;
}

.status-icon.status-realizar {
  color: #FF9800;
}

.status-icon.status-atrasado {
  color: #F44336;
}

.order-status.status-realizado {
  background-color: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
}

.order-status.status-pendente {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.order-status.status-realizar {
  background-color: rgba(255, 152, 0, 0.1);
  color: #FF9800;
}

.order-status.status-atrasado {
  background-color: rgba(244, 67, 54, 0.1);
  color: #F44336;
}

.order-expandable {
  border-top: 1px solid #eee;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: var(--text-primary-color);
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.section-title i {
  font-size: 20px;
  color: var(--primary-color);
}

.order-details, .client-details {
  padding: 20px;
}

.client-details {
  background-color: #f9f9f9;
  border-top: 1px solid #eee;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.details-section {
  margin-bottom: 20px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}

.details-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-card {
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.detail-row:last-child {
  margin-bottom: 0;
}

.detail-label {
  font-weight: 500;
  width: 120px;
  color: var(--text-secondary-color);
  font-size: 14px;
  margin-right: 8px;
}

.detail-value {
  flex: 1;
  font-size: 14px;
  min-width: 0;
  word-break: break-word;
}

.detail-value.highlight {
  font-weight: 500;
  color: var(--primary-color);
}

.detail-icon {
  font-size: 16px;
  margin-right: 4px;
  color: var(--text-secondary-color);
  vertical-align: middle;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background-color: #f0f0f0;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
}

.tag:active {
  transform: scale(0.97);
}

.tag-icon {
  font-size: 14px;
}

.day-tag {
  background-color: rgba(33, 150, 243, 0.1);
  color: #2196F3;
}

.mtr-tag {
  background-color: rgba(156, 39, 176, 0.1);
  color: #9C27B0;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.map-link, .phone-link, .email-link, .whatsapp-link {
  display: flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.map-link {
  color: #F44336;
}

.phone-link {
  color: #2196F3;
}

.email-link {
  color: #FF9800;
}

.whatsapp-link {
  color: #25D366;
}

.map-link:active, .phone-link:active, .email-link:active, .whatsapp-link:active {
  opacity: 0.8;
}

.no-data {
  color: #999;
  font-style: italic;
}

.order-actions {
  display: flex;
  gap: 10px;
  padding: 16px;
  border-top: 1px solid #eee;
  flex-wrap: wrap;
}

.action-button {
  flex: 1;
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 6px;
}

.action-button i {
  font-size: 18px;
}

.impossibility-button i {
  color: #FF9800;
}

.action-button:active {
  transform: scale(0.97);
}

.details-button i {
  color: #2196F3;
}

.details-button:active {
  background-color: rgba(33, 150, 243, 0.1);
}

.complete-button i {
  color: #4CAF50;
}

.complete-button:active {
  background-color: rgba(76, 175, 80, 0.1);
}

.share-button i {
  color: #FF9800;
}

.share-button:active {
  background-color: rgba(255, 152, 0, 0.1);
}

.whatsapp-button {
  background-color: #25D366;
  color: white;
  border: none;
  text-decoration: none;
  padding: 12px 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.whatsapp-text {
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-align: center;
  display: block;
  width: 100%;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.whatsapp-button:active {
  background-color: #20bd5a;
  transform: scale(0.97);
}

.disabled-button {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  background-color: #f5f5f5;
  border-color: #e0e0e0;
}

.disabled-button i, .disabled-button span {
  color: #9e9e9e;
}

.floating-button {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 100;
}

.floating-button i {
  font-size: 24px;
}

.floating-button:active {
  transform: scale(0.95) rotate(30deg);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

/* Bottom Sheet */
.bottom-sheet-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.bottom-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.bottom-sheet.visible {
  transform: translateY(0);
}

.bottom-sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 10;
}

.bottom-sheet-header h2 {
  margin: 0;
  font-size: 18px;
  color: var(--primary-color);
}

.close-button {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.bottom-sheet-content {
  padding: 16px;
  padding-bottom: 32px;
}

.mtr-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.mtr-item {
  background-color: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.mtr-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.mtr-item-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--primary-color);
}

.remove-button {
  background: none;
  border: none;
  color: #F44336;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 14px;
  color: var(--text-secondary-color);
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
}

.form-group textarea {
  min-height: 80px;
  resize: vertical;
}

.add-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f0f0f0;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 12px;
  width: 100%;
  margin-bottom: 20px;
  cursor: pointer;
  color: var(--text-secondary-color);
}

.add-button:active {
  background-color: #e8e8e8;
}

.total-peso {
  background-color: #f0f0f0;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
}

.total-peso strong {
  color: var(--primary-color);
}

.save-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 14px;
  width: 100%;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 16px;
}

.save-button:active {
  background-color: var(--primary-color-dark);
  transform: scale(0.98);
}

/* Diálogo de Confirmação */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1002;
}

.confirm-dialog {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1003;
  width: 90%;
  max-width: 400px;
  overflow: hidden;
}

/* Snackbar */
.snackbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--primary-color);
  color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  overflow: hidden;
  max-width: 90%;
  width: auto;
}

.snackbar-content {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 8px;
}

.snackbar-icon {
  font-size: 20px;
}

/* Animações do Snackbar */
.snackbar-fade-enter-active,
.snackbar-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.snackbar-fade-enter-from,
.snackbar-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.dialog-header {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  text-align: center;
}

.dialog-header h3 {
  margin: 0;
  font-size: 18px;
  color: var(--primary-color);
}

.dialog-content {
  padding: 20px 16px;
}

.dialog-content p {
  margin: 0 0 12px;
  font-size: 15px;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.dialog-actions button {
  flex: 1;
  padding: 14px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
}

.cancel-button {
  color: #F44336;
  border-right: 1px solid #f0f0f0;
}

.confirm-button {
  color: var(--primary-color);
}

.dialog-actions button:active {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Melhorias de responsividade para telas pequenas */
@media (max-width: 480px) {
  .page-header {
    padding: 10px 0;
  }
  
  .page-title {
    font-size: 18px;
  }
  
  .filter-tab {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .filter-tab i {
    font-size: 14px;
  }
  
  .order-header {
    padding: 12px;
  }
  
  .order-id {
    font-size: 15px;
  }
  
  .client-name {
    font-size: 14px;
  }
  
  .generator-name {
    font-size: 12px;
  }
  
  .order-details, .client-details {
    padding: 16px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-label {
    width: 100px;
    font-size: 13px;
  }
  
  .detail-value {
    font-size: 13px;
  }
  
  .action-button {
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .floating-button {
    width: 48px;
    height: 48px;
    bottom: 16px;
    right: 16px;
  }
  
  .bottom-sheet {
    max-height: 85vh;
  }
  
  .mtr-item {
    padding: 12px;
  }
  
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px;
  }
}
</style>
