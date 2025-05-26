<template>
  <div class="mobile-container">
    <!-- Conteúdo principal -->
    <div class="page-content">
      <!-- Cabeçalho com animação -->
      <div class="page-header" v-motion :initial="{ opacity: 0, y: -20 }" :enter="{ opacity: 1, y: 0, transition: { duration: 300 } }">
        <button class="back-button" @click="router.push('/home')">
          <i class="material-icons">arrow_back</i>
        </button>
        <div class="header-container">
          <h1 class="page-title">Controle de Pragas</h1>
          <button class="add-button" @click="openNewRecordForm">
            <i class="material-icons">add</i>
            <span>Novo Registro</span>
          </button>
        </div>
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
      
      <!-- Bottom Sheet para Formulário de Controle de Pragas -->
      <div class="overlay" :class="{ 'active': isBottomSheetActive }" @click="closeBottomSheet"></div>
      <div class="bottom-sheet" :class="{ 'active': isBottomSheetActive }">
        <div class="bottom-sheet-header">
          <h2 class="bottom-sheet-title">
            {{ currentServico.id ? 'Finalizar Serviço de Controle de Pragas' : 'Novo Serviço de Controle de Pragas' }}
          </h2>
          <button class="close-button" @click="closeBottomSheet">&times;</button>
        </div>
        
        <div class="bottom-sheet-content">
          <!-- Formulário com scroll -->
          <div class="form-container">
            <!-- Informações do cliente (já preenchidas) -->
            <div class="form-section">
              <h3 class="section-title">Informações do Cliente</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Nome</label>
                  <input type="text" v-model="currentServico.nome" disabled />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>CPF/CNPJ</label>
                  <input type="text" v-model="currentServico.cpf_cnpj" disabled />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Telefone</label>
                  <input type="text" v-model="currentServico.telefone" disabled />
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Endereço</label>
                  <input type="text" v-model="currentServico.endereco" disabled />
                </div>
              </div>
              <div class="form-row two-columns">
                <div class="form-group">
                  <label>Data do Serviço</label>
                  <input type="text" :value="formatDate(currentServico.data_servico)" disabled />
                </div>
                <div class="form-group">
                  <label>Número OS</label>
                  <input type="text" v-model="currentServico.numero_os" disabled />
                </div>
              </div>
            </div>
            
            <!-- Área de Aplicação -->
            <div class="form-section">
              <h3 class="section-title">Resumo dos Serviços Contratados</h3>
              <div class="form-row">
                <div class="form-group">
                  <label>Área de Aplicação</label>
                  <div class="checkbox-group">
                    <div class="checkbox-item">
                      <input type="checkbox" id="area-interna" v-model="areaInterna" />
                      <label for="area-interna">Interna</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="area-externa" v-model="areaExterna" />
                      <label for="area-externa">Externa</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Termo de Ciência -->
            <div class="form-section">
              <h3 class="section-title">Termo de Ciência e Autorização de Execução</h3>
              <div class="form-row">
                <div class="form-group">
                  <p class="disclaimer-text">
                    Autorização para execução do serviço de Controle de pragas, conforme praga alvo contratada.
                    Cliente poderá acompanhar a realização dos serviços a distância e com a utilização de EPI fornecido.
                    Em casos de Descupinização que necessita perfurar solo, pisos, móveis, portais, portas, madeiras entre outros,
                    não realizaremos serviços de reparo como rejunte e/ou reparo das superfícies perfuradas.
                    Animais e crianças não poderão permanecer nos locais durante a aplicação;
                    O retorno aos locais só poderá ocorrer após a completa secagem dos produtos químicos no mínimo de 8 horas.
                  </p>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ordem de Execução do Serviço</label>
                  <div class="checkbox-group">
                    <div class="checkbox-item">
                      <input type="checkbox" id="aplicacao-externa" v-model="aplicacaoExterna" />
                      <label for="aplicacao-externa">1ª Aplicação Externa</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="aplicacao-interna" v-model="aplicacaoInterna" />
                      <label for="aplicacao-interna">2ª Aplicação Interna</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Dedetização -->
            <div class="form-section">
              <h3 class="section-title">Dedetização</h3>
              <div class="checkbox-grid">
                <div class="checkbox-row">
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-barata" v-model="currentServico.dedetizacao_barata" />
                    <label for="dedetizacao-barata">Barata</label>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-escorpiao" v-model="currentServico.dedetizacao_escorpiao" />
                    <label for="dedetizacao-escorpiao">Escorpião</label>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-pulga" v-model="currentServico.dedetizacao_pulga" />
                    <label for="dedetizacao-pulga">Pulga</label>
                  </div>
                </div>
                <div class="checkbox-row">
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-traca" v-model="currentServico.dedetizacao_traca" />
                    <label for="dedetizacao-traca">Traça</label>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-percevejo" v-model="currentServico.dedetizacao_percevejo" />
                    <label for="dedetizacao-percevejo">Percevejo</label>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-aranha" v-model="currentServico.dedetizacao_aranha" />
                    <label for="dedetizacao-aranha">Aranha</label>
                  </div>
                </div>
                <div class="checkbox-row">
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-formiga" v-model="currentServico.dedetizacao_formiga" />
                    <label for="dedetizacao-formiga">Formiga</label>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-carrapatos" v-model="currentServico.dedetizacao_carrapatos" />
                    <label for="dedetizacao-carrapatos">Carrapatos</label>
                  </div>
                  <div class="checkbox-item">
                    <input type="checkbox" id="dedetizacao-outros" v-model="currentServico.dedetizacao_outros" />
                    <label for="dedetizacao-outros">Outros</label>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Desratização -->
            <div class="form-section">
              <h3 class="section-title">Desratização</h3>
              <div class="checkbox-row">
                <div class="checkbox-item">
                  <input type="checkbox" id="desratizacao-roedores" v-model="currentServico.desratizacao_roedores" />
                  <label for="desratizacao-roedores">Roedores</label>
                </div>
              </div>
            </div>
            
            <!-- Descupinização -->
            <div class="form-section">
              <h3 class="section-title">Descupinização</h3>
              <div class="checkbox-row">
                <div class="checkbox-item">
                  <input type="checkbox" id="descupinizacao-solo" v-model="currentServico.descupinazao_cupimdesolo" />
                  <label for="descupinizacao-solo">Cupim de Solo</label>
                </div>
                <div class="checkbox-item">
                  <input type="checkbox" id="descupinizacao-madeira" v-model="currentServico.descupinazao_cupimdemadeira" />
                  <label for="descupinizacao-madeira">Cupim de Madeira</label>
                </div>
              </div>
            </div>
            
            <!-- Desalojamento -->
            <div class="form-section">
              <h3 class="section-title">Desalojamento</h3>
              <div class="checkbox-row">
                <div class="checkbox-item">
                  <input type="checkbox" id="desalojamento-morcego" v-model="currentServico.desalojamento_morcego" />
                  <label for="desalojamento-morcego">Morcego</label>
                </div>
                <div class="checkbox-item">
                  <input type="checkbox" id="desalojamento-pombo" v-model="currentServico.desalojamento_pombo_aves" />
                  <label for="desalojamento-pombo">Pombo / Aves</label>
                </div>
              </div>
            </div>
            
            <!-- Informações adicionais -->
            <div class="form-section">
              <div class="form-row">
                <div class="form-group">
                  <label>Possui Crianças?</label>
                  <div class="radio-group">
                    <div class="radio-item">
                      <input type="radio" id="criancas-nao" name="possuiCriancas" :value="false" v-model="currentServico.possuicrianca" />
                      <label for="criancas-nao">Não</label>
                    </div>
                    <div class="radio-item">
                      <input type="radio" id="criancas-sim" name="possuiCriancas" :value="true" v-model="currentServico.possuicrianca" />
                      <label for="criancas-sim">Sim</label>
                    </div>
                  </div>
                </div>
                <div class="form-group" v-if="currentServico.possuicrianca">
                  <label>Observações</label>
                  <input type="text" v-model="currentServico.possuicrianca_obs" />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Possui Animais?</label>
                  <div class="radio-group">
                    <div class="radio-item">
                      <input type="radio" id="animais-nao" name="possuiAnimais" :value="false" v-model="currentServico.possuianimais" />
                      <label for="animais-nao">Não</label>
                    </div>
                    <div class="radio-item">
                      <input type="radio" id="animais-sim" name="possuiAnimais" :value="true" v-model="currentServico.possuianimais" />
                      <label for="animais-sim">Sim</label>
                    </div>
                  </div>
                </div>
                <div class="form-group" v-if="currentServico.possuianimais">
                  <label>Observações</label>
                  <input type="text" v-model="currentServico.possuianimais_obs" />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Alergias / Síndromes Respiratórias?</label>
                  <div class="radio-group">
                    <div class="radio-item">
                      <input type="radio" id="alergias-nao" name="possuiAlergias" :value="false" v-model="currentServico.alergiaSindromesRespiratorias" />
                      <label for="alergias-nao">Não</label>
                    </div>
                    <div class="radio-item">
                      <input type="radio" id="alergias-sim" name="possuiAlergias" :value="true" v-model="currentServico.alergiaSindromesRespiratorias" />
                      <label for="alergias-sim">Sim</label>
                    </div>
                  </div>
                </div>
                <div class="form-group" v-if="currentServico.alergiaSindromesRespiratorias">
                  <label>Observações</label>
                  <input type="text" v-model="currentServico.alergiaSindromesRespiratorias_obs" />
                </div>
              </div>
            </div>
            
            <!-- Banheiro / Cozinha -->
            <div class="form-section">
              <h3 class="section-title">Banheiro / Cozinha</h3>
              <div class="application-table">
                <div class="table-header">
                  <div class="table-cell">Elementos</div>
                  <div class="table-cell">Aplicação</div>
                  <div class="table-cell">Observações</div>
                </div>
                
                <!-- Ralos -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-ralos" v-model="currentServico.banheiroCozinha_ralos" />
                      <label for="banheiro-ralos">Ralos</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-ralos-gel" v-model="currentServico.banheiro_cozinha_ralos_gel" />
                      <label for="banheiro-ralos-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-ralos-po" v-model="currentServico.banheiro_cozinha_ralos_po" />
                      <label for="banheiro-ralos-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.banheiro_cozinha_ralos_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Rodapé / Pisos -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-rodape" />
                      <label for="banheiro-rodape">Rodapé / Pisos</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-rodape-gel" v-model="currentServico.banheiro_cozinha_rodape_gel" />
                      <label for="banheiro-rodape-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-rodape-po" v-model="currentServico.banheiro_cozinha_rodape_po" />
                      <label for="banheiro-rodape-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.banheiro_cozinha_rodape_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Armário -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-armario" />
                      <label for="banheiro-armario">Armário</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-armario-gel" v-model="currentServico.banheiro_cozinha_armario_gel" />
                      <label for="banheiro-armario-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-armario-po" v-model="currentServico.banheiro_cozinha_armario_po" />
                      <label for="banheiro-armario-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.banheiro_cozinha_armario_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Quadro de Energia -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-quadro" />
                      <label for="banheiro-quadro">Quadro de Energia</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-quadro-gel" v-model="currentServico.banheiro_cozinha_quadro_energia_gel" />
                      <label for="banheiro-quadro-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-quadro-po" v-model="currentServico.banheiro_cozinha_quadro_energia_po" />
                      <label for="banheiro-quadro-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.banheiro_cozinha_quadro_energia_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Outros -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-outros" />
                      <label for="banheiro-outros">Outros:</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-outros-gel" v-model="currentServico.banheiro_cozinha_outros_gel" />
                      <label for="banheiro-outros-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="banheiro-outros-po" v-model="currentServico.banheiro_cozinha_outros_po" />
                      <label for="banheiro-outros-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.banheiro_cozinha_outros_obs" placeholder="Observações" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Quarto / Sala -->
            <div class="form-section">
              <h3 class="section-title">Quarto / Sala</h3>
              <div class="application-table">
                <div class="table-header">
                  <div class="table-cell">Elementos</div>
                  <div class="table-cell">Aplicação</div>
                  <div class="table-cell">Observações</div>
                </div>
                
                <!-- Ralos -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-ralos" />
                      <label for="quarto-ralos">Ralos</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-ralos-gel" v-model="currentServico.quarto_sala_ralos_gel" />
                      <label for="quarto-ralos-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-ralos-po" v-model="currentServico.quarto_sala_ralos_po" />
                      <label for="quarto-ralos-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.quarto_sala_ralos_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Rodapé / Pisos -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-rodape" />
                      <label for="quarto-rodape">Rodapé / Pisos</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-rodape-gel" v-model="currentServico.quarto_sala_rodape_gel" />
                      <label for="quarto-rodape-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-rodape-po" v-model="currentServico.quarto_sala_rodape_po" />
                      <label for="quarto-rodape-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.quarto_sala_rodape_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Armário -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-armario" />
                      <label for="quarto-armario">Armário</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-armario-gel" v-model="currentServico.quarto_sala_armario_gel" />
                      <label for="quarto-armario-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-armario-po" v-model="currentServico.quarto_sala_armario_po" />
                      <label for="quarto-armario-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.quarto_sala_armario_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Quadro de Energia -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-quadro" />
                      <label for="quarto-quadro">Quadro de Energia</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-quadro-gel" v-model="currentServico.quarto_sala_quadro_energia_gel" />
                      <label for="quarto-quadro-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-quadro-po" v-model="currentServico.quarto_sala_quadro_energia_po" />
                      <label for="quarto-quadro-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.quarto_sala_quadro_energia_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Outros -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-outros" />
                      <label for="quarto-outros">Outros:</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-outros-gel" v-model="currentServico.quarto_sala_outros_gel" />
                      <label for="quarto-outros-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="quarto-outros-po" v-model="currentServico.quarto_sala_outros_po" />
                      <label for="quarto-outros-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.quarto_sala_outros_obs" placeholder="Observações" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Área Externa -->
            <div class="form-section">
              <h3 class="section-title">Área Externa</h3>
              <div class="application-table">
                <div class="table-header">
                  <div class="table-cell">Elementos</div>
                  <div class="table-cell">Aplicação</div>
                  <div class="table-cell">Observações</div>
                </div>
                
                <!-- Ralos -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-ralos" />
                      <label for="externa-ralos">Ralos</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-ralos-gel" v-model="currentServico.area_externa_ralos_gel" />
                      <label for="externa-ralos-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-ralos-po" v-model="currentServico.area_externa_ralos_po" />
                      <label for="externa-ralos-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.area_externa_ralos_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Rodapé / Pisos -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-rodape" />
                      <label for="externa-rodape">Rodapé / Pisos</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-rodape-gel" v-model="currentServico.area_externa_rodape_gel" />
                      <label for="externa-rodape-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-rodape-po" v-model="currentServico.area_externa_rodape_po" />
                      <label for="externa-rodape-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.area_externa_rodape_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Armário -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-armario" />
                      <label for="externa-armario">Armário</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-armario-gel" v-model="currentServico.area_externa_armario_gel" />
                      <label for="externa-armario-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-armario-po" v-model="currentServico.area_externa_armario_po" />
                      <label for="externa-armario-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.area_externa_armario_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Quadro de Energia -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-quadro" />
                      <label for="externa-quadro">Quadro de Energia</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-quadro-gel" v-model="currentServico.area_externa_quadro_energia_gel" />
                      <label for="externa-quadro-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-quadro-po" v-model="currentServico.area_externa_quadro_energia_po" />
                      <label for="externa-quadro-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.area_externa_quadro_energia_obs" placeholder="Observações" />
                  </div>
                </div>
                
                <!-- Outros -->
                <div class="table-row">
                  <div class="table-cell">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-outros" />
                      <label for="externa-outros">Outros:</label>
                    </div>
                  </div>
                  <div class="table-cell application-options">
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-outros-gel" v-model="currentServico.area_externa_outros_gel" />
                      <label for="externa-outros-gel">Gel</label>
                    </div>
                    <div class="checkbox-item">
                      <input type="checkbox" id="externa-outros-po" v-model="currentServico.area_externa_outros_po" />
                      <label for="externa-outros-po">Pó</label>
                    </div>
                  </div>
                  <div class="table-cell">
                    <input type="text" v-model="currentServico.area_externa_outros_obs" placeholder="Observações" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Imagem ilustrativa -->
            <div class="form-section">
              <div class="image-container">
                <img src="~/assets/images/controlepragas.png" alt="Ilustração de Áreas de Aplicação" class="illustration-image" />
              </div>
              
              <!-- Aviso de atenção -->
              <div class="warning-box">
                <h4>ATENÇÃO:</h4>
                <p>CUIDADO EM AMBIENTES COM CRIANÇAS E ANIMAIS, A APLICAÇÃO DE GEL DEVE SER EM ÁREA SUPERIOR.</p>
                <p>O TEMPO DE REENTRADA NO AMBIENTE DEDETIZADO SERÁ DE NO MÍNIMO 8 HORAS.</p>
              </div>
              
              <!-- Assinaturas -->
              <div class="signature-section">
                <div class="signature-field">
                  <label>Assinatura do Cliente:</label>
                  <div class="signature-line"></div>
                </div>
                
                <div class="signature-field">
                  <label>Assinatura do Dedetizador:</label>
                  <div class="signature-line"></div>
                </div>
              </div>
            </div>
            
            <!-- Botão de salvar -->
            <div class="form-actions">
              <button class="save-button" @click="salvarFormulario">
                <i class="material-icons">check</i>
                <span>{{ currentServico.id ? 'Finalizar e Salvar' : 'Criar Novo Registro' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { $supabase } = useNuxtApp();

// Estado dos registros
const loading = ref(true);
const statusFilter = ref('Em aberto');
const expandedCards = ref({});
const registros = ref([]);
const isBottomSheetActive = ref(false);
const currentServico = ref({});
const clientes = ref([]);
const clientesMap = ref({});

// Filtrar registros com base no status selecionado
const filteredRegistros = computed(() => {
  if (statusFilter.value === 'Em aberto') {
    return registros.value.filter(registro => !registro.finalizado);
  } else if (statusFilter.value === 'Finalizado') {
    return registros.value.filter(registro => registro.finalizado);
  }
  return registros.value;
});

onMounted(async () => {
  await fetchClientes();
  await fetchData();
});

async function fetchClientes() {
  try {
    const { data, error } = await $supabase
      .from('clientes')
      .select('*');

    if (error) throw error;
    clientes.value = data || [];
    
    // Criar um mapa de clientes para acesso rápido
    clientesMap.value = {};
    clientes.value.forEach(cliente => {
      clientesMap.value[cliente.id] = cliente;
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
  }
}

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

function openBottomSheet(record) {
  currentServico.value = { ...record };
  
  // Se tiver cliente_id, buscar os dados do cliente
  if (record.cliente_id && clientesMap.value[record.cliente_id]) {
    const cliente = clientesMap.value[record.cliente_id];
    
    // Preencher os dados do cliente no formulário
    currentServico.value.nome = currentServico.value.nome || getClienteNome(record.cliente_id);
    currentServico.value.cpf_cnpj = currentServico.value.cpf_cnpj || cliente.cpf_cnpj;
    currentServico.value.telefone = currentServico.value.telefone || cliente.telefone;
    currentServico.value.endereco = currentServico.value.endereco || cliente.endereco;
  }
  
  // Inicializar campos que podem ser undefined
  if (!currentServico.value.criancas) currentServico.value.criancas = false;
  if (!currentServico.value.animais) currentServico.value.animais = false;
  if (!currentServico.value.dedetizacao) currentServico.value.dedetizacao = false;
  if (!currentServico.value.desratizacao) currentServico.value.desratizacao = false;
  if (!currentServico.value.descupinizacao) currentServico.value.descupinizacao = false;
  if (!currentServico.value.desalojamento) currentServico.value.desalojamento = false;
  
  isBottomSheetActive.value = true;
}

function closeBottomSheet() {
  isBottomSheetActive.value = false;
}

async function salvarFormulario() {
  try {
    // Verificar se é um novo registro ou atualização
    if (currentServico.value.id) {
      // Atualizar registro existente
      currentServico.value.finalizado = true;
      currentServico.value.data_realizado = new Date().toISOString();

      const { error } = await $supabase
        .from('pest_control_services')
        .update(currentServico.value)
        .eq('id', currentServico.value.id);

      if (error) throw error;
      
      // Mostrar mensagem de sucesso
      alert('Serviço finalizado com sucesso!');
    } else {
      // Criar novo registro
      const { error } = await $supabase
        .from('pest_control_services')
        .insert([currentServico.value]);

      if (error) throw error;
      
      // Mostrar mensagem de sucesso
      alert('Novo serviço de controle de pragas criado com sucesso!');
    }

    // Atualizar a lista de registros
    await fetchData();
    closeBottomSheet();
  } catch (error) {
    console.error('Erro ao salvar formulário:', error);
    alert('Erro ao salvar o formulário. Por favor, tente novamente.');
  }
}

// Expandir/colapsar card
const toggleCard = (id) => {
  expandedCards.value = {
    ...expandedCards.value,
    [id]: !expandedCards.value[id]
  };
};

function formatDate(dateString) {
  if (!dateString) return 'Data não informada';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR');
}

function getClienteNome(clienteId) {
  const cliente = clientesMap.value[clienteId];
  if (!cliente) return 'Cliente não encontrado';
  return cliente.empresa || cliente.nome_cliente || cliente.razaosocial || 'Sem nome';
}

function openNewRecordForm() {
  // Inicializar um novo registro vazio
  currentServico.value = {
    nome: '',
    cpf_cnpj: '',
    telefone: '',
    endereco: '',
    data_servico: new Date().toISOString().split('T')[0],
    numero_os: generateOS(),
    usuario_id: null,
    cliente_id: null,
    finalizado: false,
    dedetizacao: false,
    desratizacao: false,
    descupinizacao: false,
    desalojamento: false,
    criancas: false,
    animais: false
  };
  
  isBottomSheetActive.value = true;
}

// Gerar número de OS baseado na data atual
function generateOS() {
  const date = new Date();
  const year = date.getFullYear().toString().substring(2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `CP${year}${month}${day}${random}`;
}

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
  // Buscar o registro pelo ID
  const registro = registros.value.find(r => r.id === id);
  if (registro) {
    // Abrir o bottom sheet com os detalhes do registro
    openBottomSheet(registro);
  } else {
    alert('Registro não encontrado');
  }
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
  // Buscar o registro pelo ID
  const registro = registros.value.find(r => r.id === id);
  if (registro) {
    // Abrir o bottom sheet com os detalhes do registro
    openBottomSheet(registro);
  } else {
    alert('Registro não encontrado');
  }
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

.overlay.active {
  display: block;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.add-button {
  display: flex;
  align-items: center;
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-button i {
  margin-right: 5px;
}

.add-button:hover {
  background-color: #45a049;
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
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 20px 20px 0 0;
  padding: 20px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 90vh;
  overflow-y: auto;
  transform: translateY(100%);
  transition: transform 0.3s ease;
  display: none;
}

.bottom-sheet.active {
  transform: translateY(0);
  display: block;
}

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
