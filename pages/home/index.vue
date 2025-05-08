<template>
  <div class="home-page">
    <div class="header-section">
      <div class="user-greeting">
        <h2 class="greeting">Olá, {{ userName }}</h2>
        <p class="date">{{ currentDate }}</p>
      </div>
      <q-avatar color="primary" text-color="white" size="42px">
        {{ userInitials }}
      </q-avatar>
    </div>
    
    <div class="balance-card" v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0 } }">
      <div class="balance-header">
        <h3>Saldo do mês</h3>
        <q-btn flat dense round icon="more_horiz" color="grey-7" />
      </div>
      <div class="balance-amount">
        <span class="currency">R$</span>
        <span class="amount">{{ formatCurrency(balance) }}</span>
      </div>
      <div class="budget-info">
        <div class="budget-text">
          <span>Orçamento: R$ {{ formatCurrency(budget) }}</span>
          <span>{{ Math.round((balance / budget) * 100) }}% disponível</span>
        </div>
        <q-linear-progress
          :value="balance / budget"
          color="primary"
          class="q-mt-sm"
          size="8px"
        />
      </div>
    </div>
    
    <div class="section-title">
      <h3>Resumo de despesas</h3>
      <q-btn flat color="primary" label="Ver tudo" to="/expenses" />
    </div>
    
    <div class="expense-chart" v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { delay: 200 } } }">
      <div class="chart-header">
        <h4>Despesas por categoria</h4>
        <div class="chart-period">
          <q-btn flat dense icon="chevron_left" color="grey-7" size="sm" @click="previousMonth" />
          <span>{{ currentMonth }}</span>
          <q-btn flat dense icon="chevron_right" color="grey-7" size="sm" @click="nextMonth" :disable="isCurrentMonthYear" />
        </div>
      </div>
      
      <div class="chart-container">
        <!-- Aqui seria renderizado o gráfico de categorias -->
        <div class="placeholder-chart">
          <div class="chart-bar" v-for="(category, index) in topCategories" :key="index"
               :style="{ height: `${(category.amount / maxCategoryAmount) * 100}%`, backgroundColor: categoryColors[index] }">
          </div>
        </div>
        
        <div class="chart-labels">
          <div class="chart-label" v-for="(category, index) in topCategories" :key="index">
            <div class="label-color" :style="{ backgroundColor: categoryColors[index] }"></div>
            <span class="label-name">{{ category.name }}</span>
            <span class="label-amount">R$ {{ formatCurrency(category.amount) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="section-title">
      <h3>Últimas transações</h3>
      <q-btn flat color="primary" label="Ver tudo" to="/expenses" />
    </div>
    
    <div class="recent-transactions" v-motion="{ initial: { opacity: 0, y: 20 }, enter: { opacity: 1, y: 0, transition: { delay: 300 } } }">
      <q-list separator>
        <q-item v-for="(transaction, index) in recentTransactions" :key="index" class="transaction-item">
          <q-item-section avatar>
            <q-avatar :color="transaction.color" text-color="white">
              <q-icon :name="transaction.icon" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label>{{ transaction.description }}</q-item-label>
            <q-item-label caption>{{ transaction.category }}</q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <q-item-label class="transaction-amount">
              R$ {{ formatCurrency(transaction.amount) }}
            </q-item-label>
            <q-item-label caption>{{ transaction.date }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
    
    <!-- Botão flutuante para adicionar nova despesa -->
    <q-page-sticky position="bottom-right" :offset="[16, 70]">
      <q-btn
        fab
        icon="add"
        color="primary"
        @click="showAddExpenseDialog = true"
      />
    </q-page-sticky>
    
    <!-- Modal para adicionar nova despesa -->
    <q-dialog v-model="showAddExpenseDialog" position="bottom">
      <q-card class="add-expense-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Adicionar despesa</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>
        
        <q-card-section>
          <q-input
            v-model="newExpense.description"
            label="Descrição"
            outlined
            dense
            class="q-mb-md"
          />
          
          <q-input
            v-model="newExpense.amount"
            label="Valor (R$)"
            outlined
            dense
            type="number"
            class="q-mb-md"
          />
          
          <q-select
            v-model="newExpense.category"
            :options="categoryOptions"
            label="Categoria"
            outlined
            dense
            class="q-mb-md"
          />
          
          <q-input
            v-model="newExpense.date"
            label="Data"
            outlined
            dense
            type="date"
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn label="Salvar" color="primary" @click="saveExpense" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth']
});

const user = useSupabaseUser();
const userName = computed(() => {
  if (!user.value) return 'Usuário';
  return user.value.user_metadata?.full_name || user.value.email?.split('@')[0] || 'Usuário';
});

const userInitials = computed(() => {
  if (!userName.value) return 'U';
  return userName.value
    .split(' ')
    .map(name => name[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
});

// Data atual formatada
const currentDate = computed(() => {
  const now = new Date();
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(now);
});

// Controle do mês do gráfico
const selectedMonth = ref(new Date().getMonth());
const selectedYear = ref(new Date().getFullYear());

const currentMonth = computed(() => {
  const date = new Date(selectedYear.value, selectedMonth.value);
  return date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
});

const isCurrentMonthYear = computed(() => {
  const now = new Date();
  return selectedMonth.value === now.getMonth() && selectedYear.value === now.getFullYear();
});

const previousMonth = () => {
  if (selectedMonth.value === 0) {
    selectedMonth.value = 11;
    selectedYear.value--;
  } else {
    selectedMonth.value--;
  }
};

const nextMonth = () => {
  if (selectedMonth.value === 11) {
    selectedMonth.value = 0;
    selectedYear.value++;
  } else {
    selectedMonth.value++;
  }
};

// Dados simulados para demonstração
const balance = ref(2420.60);
const budget = ref(5000);

// Categorias de despesas
const categoryColors = [
  '#4CAF50', // Verde (primário)
  '#2196F3', // Azul
  '#FFC107', // Amarelo
  '#9C27B0', // Roxo
  '#F44336'  // Vermelho
];

const topCategories = ref([
  { name: 'Alimentação', amount: 850.75 },
  { name: 'Transporte', amount: 420.30 },
  { name: 'Lazer', amount: 650.00 },
  { name: 'Moradia', amount: 1200.00 },
  { name: 'Outros', amount: 250.45 }
]);

const maxCategoryAmount = computed(() => {
  return Math.max(...topCategories.value.map(cat => cat.amount));
});

// Transações recentes
const recentTransactions = ref([
  {
    description: 'Supermercado Extra',
    category: 'Alimentação',
    amount: 235.67,
    date: '25/04/2025',
    icon: 'shopping_cart',
    color: 'primary'
  },
  {
    description: 'Uber',
    category: 'Transporte',
    amount: 45.90,
    date: '24/04/2025',
    icon: 'directions_car',
    color: 'blue'
  },
  {
    description: 'Cinema',
    category: 'Lazer',
    amount: 80.00,
    date: '22/04/2025',
    icon: 'movie',
    color: 'amber'
  },
  {
    description: 'Conta de Luz',
    category: 'Moradia',
    amount: 187.45,
    date: '20/04/2025',
    icon: 'bolt',
    color: 'deep-orange'
  }
]);

// Opções de categorias para o formulário
const categoryOptions = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Moradia',
  'Saúde',
  'Educação',
  'Vestuário',
  'Outros'
];

// Formulário de nova despesa
const showAddExpenseDialog = ref(false);
const newExpense = ref({
  description: '',
  amount: null,
  category: null,
  date: new Date().toISOString().split('T')[0]
});

// Função para salvar nova despesa
const saveExpense = () => {
  // Aqui seria implementada a lógica para salvar no Supabase
  // Por enquanto, apenas adiciona à lista de transações recentes
  if (newExpense.value.description && newExpense.value.amount && newExpense.value.category) {
    const iconMap: Record<string, string> = {
      'Alimentação': 'shopping_cart',
      'Transporte': 'directions_car',
      'Lazer': 'movie',
      'Moradia': 'home',
      'Saúde': 'healing',
      'Educação': 'school',
      'Vestuário': 'checkroom',
      'Outros': 'more_horiz'
    };
    
    const colorMap: Record<string, string> = {
      'Alimentação': 'primary',
      'Transporte': 'blue',
      'Lazer': 'amber',
      'Moradia': 'deep-orange',
      'Saúde': 'red',
      'Educação': 'purple',
      'Vestuário': 'pink',
      'Outros': 'grey'
    };
    
    recentTransactions.value.unshift({
      description: newExpense.value.description,
      category: newExpense.value.category,
      amount: parseFloat(newExpense.value.amount),
      date: new Date(newExpense.value.date).toLocaleDateString('pt-BR'),
      icon: iconMap[newExpense.value.category] || 'more_horiz',
      color: colorMap[newExpense.value.category] || 'grey'
    });
    
    // Atualiza o saldo
    balance.value -= parseFloat(newExpense.value.amount);
    
    // Atualiza a categoria correspondente
    const categoryIndex = topCategories.value.findIndex(cat => cat.name === newExpense.value.category);
    if (categoryIndex >= 0) {
      topCategories.value[categoryIndex].amount += parseFloat(newExpense.value.amount);
    }
    
    // Limpa o formulário
    newExpense.value = {
      description: '',
      amount: null,
      category: null,
      date: new Date().toISOString().split('T')[0]
    };
    
    // Fecha o diálogo
    showAddExpenseDialog.value = false;
    
    // Mostra notificação
    const { Notify } = useQuasar();
    Notify.create({
      type: 'positive',
      message: 'Despesa adicionada com sucesso!',
      position: 'bottom'
    });
  }
};

// Função para formatar valores monetários
const formatCurrency = (value: number) => {
  return value.toFixed(2).replace('.', ',');
};
</script>

<style scoped>
.home-page {
  padding: 16px;
  padding-bottom: 80px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.greeting {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color);
}

.date {
  font-size: 14px;
  color: var(--text-secondary-color);
  margin: 4px 0 0 0;
}

.balance-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--box-shadow);
}

.balance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.balance-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-secondary-color);
}

.balance-amount {
  margin-bottom: 16px;
}

.currency {
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
}

.amount {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-color);
  margin-left: 4px;
}

.budget-info {
  margin-top: 8px;
}

.budget-text {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: var(--text-secondary-color);
  margin-bottom: 4px;
}

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24px 0 16px;
}

.section-title h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.expense-chart {
  background-color: white;
  border-radius: var(--border-radius);
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: var(--box-shadow);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-header h4 {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  color: var(--text-color);
}

.chart-period {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--text-secondary-color);
}

.chart-period span {
  margin: 0 8px;
  text-transform: capitalize;
}

.chart-container {
  height: 220px;
}

.placeholder-chart {
  height: 150px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 16px;
}

.chart-bar {
  width: 18%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.chart-labels {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chart-label {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.label-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
}

.label-name {
  flex: 1;
}

.label-amount {
  font-weight: 500;
}

.transaction-item {
  padding: 12px 0;
}

.transaction-amount {
  font-weight: 500;
}

.add-expense-dialog {
  width: 100%;
  max-width: 400px;
  border-radius: 16px 16px 0 0;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
