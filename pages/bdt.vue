<template>
  <div class="mobile-container">
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Cabeçalho com animação -->
      <div class="page-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }">
        <button class="back-button" @click="router.push('/home')">
          <i class="material-icons">arrow_back</i>
        </button>
        <h1 class="page-title">Boletins Diários de Transporte</h1>
      </div>
      
      <!-- Filtros com animação -->
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
            :class="{ active: statusFilter === 'Concluído' }" 
            @click="statusFilter = 'Concluído'"
          >
            <i class="material-icons">check_circle</i>
            <span>Concluídos</span>
          </button>
        </div>
      </div>
      
      <!-- Estado de carregamento -->
      <div v-if="loading" class="loading-state" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }">
        <div class="spinner"></div>
        <p>Carregando boletins...</p>
      </div>
      
      <!-- Estado vazio -->
      <div v-else-if="filteredBdts.length === 0" class="empty-state" v-motion :initial="{ opacity: 0, scale: 0.9 }" :enter="{ opacity: 1, scale: 1, transition: { duration: 300 } }">
        <i class="material-icons">assignment_late</i>
        <p>Nenhum boletim encontrado</p>
        <button class="refresh-button" @click="refreshData">
          <i class="material-icons">refresh</i>
          <span>Atualizar</span>
        </button>
      </div>
      
      <!-- Lista de BDTs -->
      <div v-else class="bdt-list" v-motion :initial="{ opacity: 0, y: 20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: 200 } }">
        <div 
          v-for="(bdt, index) in filteredBdts" 
          :key="bdt.id"
          class="bdt-card"
          :class="{ 'new-card': newCards[bdt.id] }"
          v-motion
          :initial="{ opacity: 0, y: 20 }"
          :enter="{ opacity: 1, y: 0, transition: { duration: 300, delay: index * 50 } }"
        >
          <div class="bdt-header" @click="toggleExpand(bdt.id)">
            <div class="bdt-info">
              <div class="bdt-id">BDT #{{ bdt.id }}</div>
              <div class="bdt-date">{{ formatDate(bdt.data_saida) }}</div>
            </div>
            <div class="bdt-details">
              <div class="vehicle-info">
                <span class="vehicle-model">{{ bdt.veiculo_modelo }}</span>
                <span class="vehicle-plate">{{ bdt.placa }}</span>
              </div>
              <div class="bdt-status" :class="getStatusClass(bdt.status)">
                {{ bdt.status }}
              </div>
            </div>
            <i class="material-icons expand-icon" :class="{ 'expanded': expandedCards[bdt.id] }">
              expand_more
            </i>
          </div>
          
          <div class="bdt-content" v-if="expandedCards[bdt.id]">
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">Veículo:</div>
                <div class="detail-value">{{ bdt.veiculo_modelo }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Placa:</div>
                <div class="detail-value">{{ bdt.placa }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Data de Saída:</div>
                <div class="detail-value">{{ bdt.data_saida || 'Não informado' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Hora de Saída:</div>
                <div class="detail-value">{{ bdt.hora_saida || 'Não informado' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Odômetro Inicial:</div>
                <div class="detail-value">{{ bdt.odometro_inicial || 'Não informado' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Destino:</div>
                <div class="detail-value">{{ bdt.local_destino || 'Não informado' }}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Equipe:</div>
                <div class="detail-value">{{ bdt.equipe || 'Não informado' }}</div>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="action-button" @click="preencherBdt(bdt.id)">
                <i class="material-icons">edit</i>
                <span>Preencher</span>
              </button>
              <button class="action-button" @click="viewDetails(bdt.id)">
                <i class="material-icons">visibility</i>
                <span>Detalhes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      

      
      <!-- Bottom Sheet para Novo BDT -->
      <div class="bottom-sheet-overlay" v-if="newBdtFormVisible" @click="closeNewBdtForm"></div>
      <div class="bottom-sheet" v-if="newBdtFormVisible" :class="{ 'visible': newBdtFormVisible }">
        <div class="bottom-sheet-header">
          <h2>Novo Boletim Diário de Transporte</h2>
          <button class="close-button" @click="closeNewBdtForm">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="bottom-sheet-content">
          <div class="form-group">
            <label>Modelo do Veículo</label>
            <input type="text" v-model="newBdt.veiculo_modelo" placeholder="Digite o modelo do veículo" />
          </div>
          
          <div class="form-group">
            <label>Placa</label>
            <input type="text" v-model="newBdt.placa" placeholder="Digite a placa do veículo" />
          </div>
          
          <div class="form-group">
            <label>Data de Saída</label>
            <input type="date" v-model="newBdt.data_saida" />
          </div>
          
          <button class="save-button" @click="createBdt">
            <i class="material-icons">check</i>
            <span>Criar Boletim</span>
          </button>
        </div>
      </div>
      
      <!-- Bottom Sheet para Preencher BDT -->
      <div class="bottom-sheet-overlay" v-if="bdtFormVisible" @click="closeBdtForm"></div>
      <div class="bottom-sheet" v-if="bdtFormVisible" :class="{ 'visible': bdtFormVisible }">
        <div class="bottom-sheet-header">
          <h2>Preencher Boletim Diário de Transporte</h2>
          <button class="close-button" @click="closeBdtForm">
            <i class="material-icons">close</i>
          </button>
        </div>
        
        <div class="bottom-sheet-content">
          <div class="form-section">
            <h3>Informações de Saída</h3>
            
            <div class="form-group">
              <label>Hora de Saída</label>
              <input type="time" v-model="currentBdt.hora_saida" />
            </div>
            
            <div class="form-group">
              <label>Odômetro Inicial</label>
              <input type="text" v-model="currentBdt.odometro_inicial" placeholder="Digite o odômetro inicial" />
            </div>
            
            <div class="form-group">
              <label>Local de Destino</label>
              <input type="text" v-model="currentBdt.local_destino" placeholder="Digite o local de destino" />
            </div>
            
            <div class="form-group">
              <label>Equipe</label>
              <input type="text" v-model="currentBdt.equipe" placeholder="Digite os nomes da equipe" />
            </div>
          </div>
          
          <div class="form-section">
            <h3>Informações de Abastecimento</h3>
            
            <div class="form-group">
              <label>Horário de Abastecimento</label>
              <input type="time" v-model="currentBdt.horario_abastecimento" />
            </div>
            
            <div class="form-group">
              <label>Litros</label>
              <input type="text" v-model="currentBdt.lt" placeholder="Digite a quantidade em litros" />
            </div>
            
            <div class="form-group">
              <label>Local de Abastecimento</label>
              <input type="text" v-model="currentBdt.local_abastecimento" placeholder="Digite o local de abastecimento" />
            </div>
          </div>
          
          <div class="form-section">
            <h3>Informações de Chegada</h3>
            
            <div class="form-group">
              <label>Hora de Chegada</label>
              <input type="time" v-model="currentBdt.hora_chegada" />
            </div>
            
            <div class="form-group">
              <label>Odômetro Final</label>
              <input type="text" v-model="currentBdt.odometro_final" placeholder="Digite o odômetro final" />
            </div>
            
            <!-- Campo de Rubrica removido, substituído pela assinatura em imagem -->
          </div>
          
          <div class="form-section">
            <h3>Checklist do Veículo</h3>
            
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.nivel_oleo" />
                <span>Nível de Óleo</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.nivel_agua" />
                <span>Nível de Água</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.nivel_fluido_freio" />
                <span>Nível de Fluido de Freio</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.nivel_agua_limpador" />
                <span>Nível de Água do Limpador</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.pneus" />
                <span>Pneus</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.crvl_documentacao" />
                <span>CRVL/Documentação</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.eletrica" />
                <span>Elétrica</span>
              </label>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Checklist de Equipamentos</h3>
            
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.balanca_carregada" />
                <span>Balança Carregada</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.balanca_manual" />
                <span>Balança Manual</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.placas" />
                <span>Placas</span>
              </label>
              
              <label class="checkbox-label">
                <input type="checkbox" v-model="currentBdt.cartao_despesas" />
                <span>Cartão de Despesas</span>
              </label>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Foto da Bomba de Combustível</h3>
            <div class="image-upload">
              <button type="button" class="upload-button" @click="openCamera">
                <i class="material-icons">local_gas_station</i>
                <span>Foto da bomba de combustível</span>
              </button>
              <!-- Input oculto para upload de imagem -->
              <input 
                id="image-upload" 
                type="file" 
                accept="image/*" 
                @change="handleImageUpload" 
                style="display: none;"
              />
              <div class="camera-hint" style="margin-top: 8px; color: #888; font-size: 13px;">
                Se aparecer opção, selecione <b>Câmera</b> para tirar a foto na hora.
              </div>
              <div v-if="imagePreview" class="image-preview">
                <img :src="imagePreview" alt="Preview" />
                <button class="remove-image" @click="removeImage">
                  <i class="material-icons">close</i>
                </button>
              </div>
            </div>
          </div>
          
          <div class="form-group">
            <label>Observações Gerais</label>
            <textarea 
              v-model="currentBdt.observacoes_gerais" 
              placeholder="Digite observações gerais sobre o transporte"
              rows="4"
            ></textarea>
          </div>
          
          <button class="save-button" @click="saveBdt">
            <i class="material-icons">check</i>
            <span>Salvar Boletim</span>
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNuxtApp } from '#app';
import { useMotion } from '@vueuse/motion';

const { $supabase } = useNuxtApp();
const router = useRouter();
const user = ref(null);
const loading = ref(true);
const bdts = ref([]);
const statusFilter = ref('Em aberto');
const expandedCards = ref({});
const newCards = ref({});
const lastRefresh = ref(new Date());

// Variáveis para o formulário de novo BDT
const newBdtFormVisible = ref(false);
const newBdt = ref({
  veiculo_modelo: '',
  placa: '',
  data_saida: new Date().toISOString().split('T')[0],
});

// Variáveis para o formulário de preenchimento de BDT
const bdtFormVisible = ref(false);
const currentBdtId = ref(null);
const currentBdt = ref({});
const imageFile = ref(null);
const imagePreview = ref(null);

// Variáveis para o snackbar
const snackbarVisible = ref(false);
const snackbarMessage = ref('');
const snackbarTimeout = ref(null);

// Filtrar BDTs por status
const filteredBdts = computed(() => {
  if (statusFilter.value === 'todos') {
    return bdts.value;
  } else if (statusFilter.value === 'Em aberto') {
    return bdts.value.filter(bdt => bdt.status === 'Em aberto');
  } else if (statusFilter.value === 'Em atraso') {
    // Verificar se existe data de saída e é anterior à data atual
    return bdts.value.filter(bdt => {
      if (!bdt.data_saida) return false;
      
      const dataSaida = new Date(bdt.data_saida);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      
      return dataSaida < hoje && bdt.status === 'Em aberto';
    });
  } else if (statusFilter.value === 'Concluído') {
    return bdts.value.filter(bdt => bdt.status === 'Realizado' || bdt.status === 'Concluído');
  }
  
  return bdts.value;
});

// Formatar data para exibição
const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // Tentar formato DD/MM/YYYY
    const parts = dateString.split('/');
    if (parts.length === 3) {
      return dateString; // Já está formatado
    }
    return 'Data inválida';
  }
  
  return date.toLocaleDateString('pt-BR');
};

// Obter classe CSS com base no status
const getStatusClass = (status) => {
  switch (status) {
    case 'Em aberto':
      return 'status-pending';
    case 'Em atraso':
      return 'status-late';
    case 'Concluído':
      return 'status-completed';
    default:
      return '';
  }
};

// Expandir/colapsar card
const toggleExpand = (id) => {
  expandedCards.value = {
    ...expandedCards.value,
    [id]: !expandedCards.value[id]
  };
};

// Mostrar formulário de novo BDT
const showNewBdtForm = () => {
  newBdt.value = {
    veiculo_modelo: '',
    placa: '',
    data_saida: new Date().toISOString().split('T')[0],
  };
  newBdtFormVisible.value = true;
};

// Fechar formulário de novo BDT
const closeNewBdtForm = () => {
  newBdtFormVisible.value = false;
};

// Criar novo BDT
const createBdt = async () => {
  if (!newBdt.value.veiculo_modelo || !newBdt.value.placa) {
    showSnackbar('Preencha todos os campos obrigatórios');
    return;
  }
  
  try {
    loading.value = true;
    
    const { data: userData } = await $supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    const { data, error } = await $supabase
      .from('bdt_relatorio')
      .insert([
        {
          veiculo_modelo: newBdt.value.veiculo_modelo,
          placa: newBdt.value.placa,
          data_saida: newBdt.value.data_saida,
          status: 'Em aberto',
          usuario_id: userId
        }
      ])
      .select();
      
    if (error) throw error;
    
    // Adicionar o novo BDT à lista
    if (data && data.length > 0) {
      bdts.value.unshift(data[0]);
      newCards.value[data[0].id] = true;
      
      // Remover a classe 'new-card' após 3 segundos
      setTimeout(() => {
        newCards.value[data[0].id] = false;
      }, 3000);
    }
    
    closeNewBdtForm();
    showSnackbar('Boletim criado com sucesso!');
    
  } catch (error) {
    console.error('Erro ao criar boletim:', error);
    showSnackbar('Erro ao criar boletim. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

// Abrir formulário para preencher BDT
const preencherBdt = async (id) => {
  try {
    loading.value = true;
    
    const { data, error } = await $supabase
      .from('bdt_relatorio')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    currentBdtId.value = id;
    currentBdt.value = { ...data };
    imagePreview.value = null;
    imageFile.value = null;
    bdtFormVisible.value = true;
    
  } catch (error) {
    console.error('Erro ao carregar dados do boletim:', error);
    showSnackbar('Erro ao carregar dados. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

// Fechar formulário de preenchimento de BDT
const closeBdtForm = () => {
  bdtFormVisible.value = false;
  currentBdtId.value = null;
  imagePreview.value = null;
  imageFile.value = null;
};

// Manipular upload de imagem
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  imageFile.value = file;
  
  // Criar preview da imagem
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

// Abrir a câmera diretamente
const openCamera = () => {
  // Verificar se estamos em um dispositivo móvel
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  const fileInput = document.getElementById('image-upload');
  
  if (fileInput) {
    // Em dispositivos móveis, tentamos forçar a abertura da câmera
    if (isMobile) {
      // Remover qualquer input temporário anterior que possa existir
      const oldTempInput = document.getElementById('temp-camera-input');
      if (oldTempInput) {
        oldTempInput.remove();
      }
      
      // Criar um novo elemento input temporário com configurações específicas para câmera
      const tempInput = document.createElement('input');
      tempInput.id = 'temp-camera-input';
      tempInput.type = 'file';
      tempInput.accept = 'image/*';
      
      // Forçar o uso da câmera traseira com diferentes atributos para maior compatibilidade
      tempInput.setAttribute('capture', 'environment');
      tempInput.setAttribute('camera', 'environment');
      
      // Esconder o input temporário mas mantê-lo no DOM
      tempInput.style.position = 'absolute';
      tempInput.style.visibility = 'hidden';
      tempInput.style.top = '-9999px';
      document.body.appendChild(tempInput);
      
      // Transferir o evento de change para nosso input original
      tempInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          try {
            // Simular a seleção no input original
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(e.target.files[0]);
            fileInput.files = dataTransfer.files;
            
            // Disparar o evento change manualmente
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
            
            console.log('Imagem da câmera capturada com sucesso');
          } catch (error) {
            console.error('Erro ao transferir arquivo da câmera:', error);
          }
        }
        
        // Remover o input temporário após um pequeno delay para garantir que o evento foi processado
        setTimeout(() => {
          if (document.body.contains(tempInput)) {
            tempInput.remove();
          }
        }, 500);
      });
      
      // Clicar no input temporário para abrir a câmera
      tempInput.click();
    } else {
      // Em desktop, usamos o input normal
      fileInput.click();
    }
  } else {
    console.error('Elemento de input para upload de imagem não encontrado');
  }
};

// Remover imagem
const removeImage = () => {
  imageFile.value = null;
  imagePreview.value = null;
  
  // Limpar o input de arquivo
  const fileInput = document.getElementById('image-upload');
  if (fileInput) fileInput.value = '';
};

// Salvar BDT preenchido
const saveBdt = async () => {
  try {
    loading.value = true;
    
    // Primeiro, fazer upload da imagem se existir
    let publicUrl = null;
    
    if (imageFile.value) {
      try {
        // Nome do arquivo: bdt_ID_TIMESTAMP.extensão
        const fileName = `bdt_${currentBdtId.value}_${Date.now()}.${imageFile.value.name.split('.').pop()}`;
        
        // Fazer upload para o bucket 'assinatura' na pasta 'bdt'
        const { data: uploadData, error: uploadError } = await $supabase.storage
          .from('assinatura')
          .upload(`bdt/${fileName}`, imageFile.value, {
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) {
          console.error('Erro no upload:', uploadError);
          throw uploadError;
        }
        
        // Obter a URL pública da imagem
        const { data: publicData } = await $supabase.storage
          .from('assinatura')
          .getPublicUrl(`bdt/${fileName}`);
        
        publicUrl = publicData?.publicUrl;
        console.log('Upload realizado com sucesso:', publicUrl);
      } catch (uploadError) {
        console.error('Erro durante o upload da imagem:', uploadError);
        showSnackbar('Erro ao fazer upload da imagem. Verifique as permissões.');
        throw uploadError;
      }
    }
    
    // Preparar dados para salvar na tabela
    const dadosParaSalvar = {
      veiculo_modelo: currentBdt.value.veiculo_modelo,
      placa: currentBdt.value.placa,
      data_saida: currentBdt.value.data_saida,
      hora_saida: currentBdt.value.hora_saida,
      odometro_inicial: currentBdt.value.odometro_inicial,
      local_destino: currentBdt.value.local_destino,
      horario_abastecimento: currentBdt.value.horario_abastecimento,
      lt: currentBdt.value.lt,
      local_abastecimento: currentBdt.value.local_abastecimento,
      hora_chegada: currentBdt.value.hora_chegada,
      odometro_final: currentBdt.value.odometro_final,
      equipe: currentBdt.value.equipe,
      nivel_oleo: currentBdt.value.nivel_oleo,
      nivel_agua: currentBdt.value.nivel_agua,
      nivel_fluido_freio: currentBdt.value.nivel_fluido_freio,
      nivel_agua_limpador: currentBdt.value.nivel_agua_limpador,
      pneus: currentBdt.value.pneus,
      crvl_documentacao: currentBdt.value.crvl_documentacao,
      eletrica: currentBdt.value.eletrica,
      balanca_carregada: currentBdt.value.balanca_carregada,
      balanca_manual: currentBdt.value.balanca_manual,
      placas: currentBdt.value.placas,
      cartao_despesas: currentBdt.value.cartao_despesas,
      observacoes_gerais: currentBdt.value.observacoes_gerais
    };
    
    // Adicionar URL da imagem no campo 'url' da tabela
    if (publicUrl) {
      dadosParaSalvar.url = publicUrl;
      console.log('URL da imagem sendo salva:', publicUrl);
    }
    
    // Definir status com base na imagem ou campos preenchidos
    if (imageFile.value) {
      dadosParaSalvar.status = 'Realizado';
      console.log('Status sendo atualizado para: Realizado');
    } else {
      // Verificar se todos os campos necessários para concluir estão preenchidos
      const isComplete = dadosParaSalvar.hora_saida && 
                        dadosParaSalvar.odometro_inicial && 
                        dadosParaSalvar.hora_chegada && 
                        dadosParaSalvar.odometro_final;
      
      if (isComplete) {
        dadosParaSalvar.status = 'Concluído';
        console.log('Status sendo atualizado para: Concluído');
      }
    }
    
    console.log('Dados sendo salvos:', dadosParaSalvar);
    
    // Atualizar o registro no banco de dados
    const { data, error } = await $supabase
      .from('bdt_relatorio')
      .update(dadosParaSalvar)
      .eq('id', currentBdtId.value)
      .select();
    
    console.log('Resposta do Supabase:', { data, error });
      
    if (error) {
      console.error('Erro ao atualizar o registro:', error);
      throw error;
    }
    
    // Verificar se a atualização foi bem-sucedida mesmo com array vazio
    if (!data || data.length === 0) {
      console.log('Atualização bem-sucedida, mas sem dados retornados. Buscando dados atualizados...');
      
      // Buscar os dados atualizados
      const { data: updatedData, error: fetchError } = await $supabase
        .from('bdt_relatorio')
        .select('*')
        .eq('id', currentBdtId.value)
        .single();
      
      if (fetchError) {
        console.error('Erro ao buscar dados atualizados:', fetchError);
      } else if (updatedData) {
        console.log('Dados atualizados obtidos com sucesso:', updatedData);
        
        // Atualizar o BDT na lista
        const index = bdts.value.findIndex(bdt => bdt.id === currentBdtId.value);
        if (index !== -1) {
          bdts.value[index] = updatedData;
        }
      }
    } else {
      // Atualizar o BDT na lista com os dados retornados
      const index = bdts.value.findIndex(bdt => bdt.id === currentBdtId.value);
      if (index !== -1) {
        bdts.value[index] = data[0];
      }
    }
    
    closeBdtForm();
    
    if (imageFile.value) {
      showSnackbar('Assinatura anexada e BDT marcado como Realizado!');
    } else {
      showSnackbar('Boletim atualizado com sucesso!');
    }
    
  } catch (error) {
    console.error('Erro ao salvar boletim:', error);
    showSnackbar('Erro ao salvar boletim. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

// Ver detalhes do BDT
const viewDetails = (id) => {
  // Implementar visualização detalhada se necessário
  console.log('Ver detalhes do BDT', id);
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

// Atualizar dados
const refreshData = async () => {
  try {
    loading.value = true;
    lastRefresh.value = new Date();
    
    // Obter o UUID do usuário autenticado
    const { data: userData } = await $supabase.auth.getUser();
    const userUuid = userData?.user?.id;
    
    if (!userUuid) {
      console.error('UUID do usuário não encontrado');
      showSnackbar('Erro de autenticação. Faça login novamente.');
      return;
    }
    
    // Buscar o ID do usuário na tabela usuario usando o UUID
    const { data: usuarioData, error: usuarioError } = await $supabase
      .from('usuario')
      .select('id')
      .eq('uuid', userUuid)
      .single();
      
    if (usuarioError) {
      console.error('Erro ao buscar ID do usuário:', usuarioError);
      throw usuarioError;
    }
    
    if (!usuarioData) {
      console.error('Usuário não encontrado na tabela usuario');
      showSnackbar('Erro ao carregar dados. Usuário não encontrado.');
      return;
    }
    
    const usuarioId = usuarioData.id;
    console.log('Filtrando BDTs para o usuário ID:', usuarioId);
    
    // Buscar BDTs filtrados pelo ID do usuário
    const { data, error } = await $supabase
      .from('bdt_relatorio')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    bdts.value = data || [];
    console.log(`Carregados ${bdts.value.length} BDTs para o usuário ID ${usuarioId}`);
    
  } catch (error) {
    console.error('Erro ao carregar boletins:', error);
    showSnackbar('Erro ao carregar dados. Tente novamente.');
  } finally {
    loading.value = false;
  }
};

// Carregar dados ao montar o componente
onMounted(async () => {
  try {
    // Verificar se o usuário está autenticado
    const { data: userData } = await $supabase.auth.getUser();
    user.value = userData?.user;
    
    if (!user.value) {
      router.push('/auth/login');
      return;
    }
    
    await refreshData();
    
  } catch (error) {
    console.error('Erro ao inicializar:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.mobile-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: #f5f5f5;
  min-height: 100vh;
  position: relative;
}

.page-content {
  padding: 0 0 80px 0;
}

.page-header {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: var(--primary-color);
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-button {
  background: none;
  border: none;
  color: white;
  margin-right: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
}

/* Filtros */
.filters-section {
  padding: 16px 16px 8px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  overflow-x: auto;
  gap: 8px;
  padding-bottom: 8px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-tabs::-webkit-scrollbar {
  display: none;
}

.filter-tab {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background-color: #f0f0f0;
  border: none;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  color: var(--text-secondary-color);
}

.filter-tab i {
  margin-right: 8px;
  font-size: 16px;
}

.filter-tab.active {
  background-color: var(--primary-color);
  color: white;
}

.filter-tab:active {
  transform: scale(0.98);
}

/* Estado de carregamento */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: var(--text-secondary-color);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Estado vazio */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 16px;
  color: var(--text-secondary-color);
  text-align: center;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #ccc;
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
  margin-top: 16px;
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

/* Lista de BDTs */
.bdt-list {
  padding: 0 16px;
}

.bdt-card {
  background-color: white;
  border-radius: 12px;
  margin-bottom: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.bdt-card.new-card {
  animation: highlight 3s ease-out;
}

@keyframes highlight {
  0% { background-color: rgba(var(--primary-color-rgb), 0.2); }
  100% { background-color: white; }
}

.bdt-header {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  position: relative;
}

.bdt-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bdt-id {
  font-weight: 500;
  color: var(--primary-color);
}

.bdt-date {
  font-size: 14px;
  color: var(--text-secondary-color);
}

.bdt-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.vehicle-info {
  display: flex;
  flex-direction: column;
}

.vehicle-model {
  font-weight: 500;
}

.vehicle-plate {
  font-size: 14px;
  color: var(--text-secondary-color);
}

.bdt-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.status-pending {
  background-color: #FFF8E1;
  color: #FFA000;
}

.status-late {
  background-color: #FFEBEE;
  color: #D32F2F;
}

.status-completed {
  background-color: #E8F5E9;
  color: #388E3C;
}

.expand-icon {
  position: absolute;
  right: 16px;
  bottom: 16px;
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.bdt-content {
  padding: 0 16px 16px;
  border-top: 1px solid #f0f0f0;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
}

.detail-label {
  font-size: 12px;
  color: var(--text-secondary-color);
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  font-size: 14px;
}

/* Botão flutuante */
.floating-button {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.floating-button i {
  font-size: 24px;
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

.bottom-sheet-content {
  padding: 16px;
  padding-bottom: 32px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h3 {
  font-size: 16px;
  margin: 0 0 16px 0;
  color: var(--primary-color);
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

.checkbox-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color);
}

.image-upload {
  margin-top: 8px;
}

.upload-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: #f0f0f0;
  border: 1px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  width: 100%;
  cursor: pointer;
  color: var(--text-secondary-color);
}

.image-preview {
  margin-top: 16px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
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

/* Responsividade */
@media (max-width: 480px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .bottom-sheet {
    max-height: 85vh;
  }
}
</style>
