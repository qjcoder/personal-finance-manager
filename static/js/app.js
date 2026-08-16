// API Base URL
const API_BASE = '/api';

// Expense and Income Categories
const EXPENSE_CATEGORIES = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Housing',
    'Personal Care', 'Travel', 'Gifts & Donations', 'Other'
];

const INCOME_CATEGORIES = [
    'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'
];

const CURRENCY_STORAGE_KEY = 'pfm-currency-v2';
let selectedCurrency = { country: 'Pakistan', code: 'PKR', locale: 'ur-PK' };

function loadSavedCurrency() {
    try {
        const saved = JSON.parse(localStorage.getItem(CURRENCY_STORAGE_KEY));
        if (saved && saved.code && saved.country) {
            selectedCurrency = saved;
        }
    } catch (e) {
        // keep default
    }
}

function saveCurrency() {
    localStorage.setItem(CURRENCY_STORAGE_KEY, JSON.stringify(selectedCurrency));
}

function formatMoney(amount) {
    const value = Number(amount) || 0;
    try {
        return new Intl.NumberFormat(selectedCurrency.locale, {
            style: 'currency',
            currency: selectedCurrency.code
        }).format(value);
    } catch (e) {
        return `${selectedCurrency.code} ${value.toFixed(2)}`;
    }
}

function populateCurrencySelect(filter = '') {
    const select = document.getElementById('currency-select');
    const query = filter.trim().toLowerCase();
    const matches = COUNTRIES.filter(item =>
        !query ||
        item.country.toLowerCase().includes(query) ||
        item.code.toLowerCase().includes(query)
    );

    select.innerHTML = matches.map((item, index) => {
        const value = `${item.country}|${item.code}|${item.locale}`;
        const selected = item.country === selectedCurrency.country && item.code === selectedCurrency.code;
        return `<option value="${value}" ${selected ? 'selected' : ''}>${item.country} (${item.code})</option>`;
    }).join('');

    if (!select.value && matches.length) {
        select.selectedIndex = 0;
    }
}

function updateCurrencyLabels() {
    document.querySelectorAll('.currency-code').forEach(el => {
        el.textContent = selectedCurrency.code;
    });
}

function applyCurrencySelection() {
    const select = document.getElementById('currency-select');
    const [country, code, locale] = select.value.split('|');
    selectedCurrency = { country, code, locale };
    saveCurrency();
    updateCurrencyLabels();
    loadDashboard();
    loadTransactions();
    loadSavingsGoals();
    loadBudgets();
    const analyticsTab = document.getElementById('analytics');
    if (analyticsTab && analyticsTab.classList.contains('active')) {
        loadAnalytics();
    }
}

function initCurrencySelector() {
    loadSavedCurrency();
    populateCurrencySelect();

    const select = document.getElementById('currency-select');
    const search = document.getElementById('currency-search');
    const currentValue = `${selectedCurrency.country}|${selectedCurrency.code}|${selectedCurrency.locale}`;
    if ([...select.options].some(opt => opt.value === currentValue)) {
        select.value = currentValue;
    }

    search.addEventListener('input', () => populateCurrencySelect(search.value));
    select.addEventListener('change', applyCurrencySelection);
    updateCurrencyLabels();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
});

function initApp() {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    initCurrencySelector();
    
    // Load initial data
    loadDashboard();
    loadTransactions();
    loadSavingsGoals();
    loadBudgets();
}

function setupEventListeners() {
    // Transaction form
    document.getElementById('transaction-form').addEventListener('submit', handleTransactionSubmit);
    
    // Goal form
    document.getElementById('goal-form').addEventListener('submit', handleGoalSubmit);
    
    // Budget form
    document.getElementById('budget-form').addEventListener('submit', handleBudgetSubmit);
}

// Tab Navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for specific tabs
    if (tabName === 'analytics') {
        loadAnalytics();
    }
}

// Dashboard Functions
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/summary`);
        const data = await response.json();
        
        // Update summary cards
        document.getElementById('total-income').textContent = formatMoney(data.income);
        document.getElementById('total-expenses').textContent = formatMoney(data.expenses);
        document.getElementById('current-balance').textContent = formatMoney(data.balance);
        
        document.getElementById('month-income').textContent = formatMoney(data.month_income);
        document.getElementById('month-expenses').textContent = formatMoney(data.month_expenses);
        document.getElementById('month-balance').textContent = formatMoney(data.month_balance);
        
        // Load insights
        loadInsights();
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function loadInsights() {
    try {
        const response = await fetch(`${API_BASE}/analytics/insights?currency=${encodeURIComponent(selectedCurrency.code)}`);
        const insights = await response.json();
        
        const container = document.getElementById('insights-container');
        
        if (insights.length === 0) {
            container.innerHTML = '<p class="empty-state">No insights available yet. Add more transactions to see personalized recommendations.</p>';
            return;
        }
        
        container.innerHTML = insights.map(insight => `
            <div class="insight-card ${insight.type}">
                <h4>${insight.title}</h4>
                <p>${insight.message}</p>
                <p class="tip">💡 ${insight.tip}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading insights:', error);
    }
}

// Transaction Functions
async function loadTransactions() {
    try {
        const response = await fetch(`${API_BASE}/transactions`);
        const transactions = await response.json();
        
        const container = document.getElementById('transactions-list');
        
        if (transactions.length === 0) {
            container.innerHTML = '<p class="empty-state">No transactions yet. Click "Add Transaction" to get started!</p>';
            return;
        }
        
        container.innerHTML = transactions.map(t => `
            <div class="transaction-item">
                <div class="transaction-info">
                    <div class="transaction-category">${t.category}</div>
                    <div class="transaction-description">${t.description}</div>
                    <div class="transaction-date">${formatDate(t.date)}</div>
                </div>
                <div class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}${formatMoney(t.amount)}
                </div>
                <button class="transaction-delete" onclick="deleteTransaction(${t.id})">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading transactions:', error);
    }
}

function showTransactionModal(type) {
    const modal = document.getElementById('transactionModal');
    const typeInput = document.getElementById('transaction-type');
    const categorySelect = document.getElementById('category');
    const modalTitle = document.getElementById('modal-title');
    
    typeInput.value = type;
    modalTitle.textContent = `Add ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    
    // Populate categories
    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    categorySelect.innerHTML = '<option value="">Select category</option>' +
        categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    modal.classList.add('active');
}

async function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        type: document.getElementById('transaction-type').value,
        amount: formData.get('amount'),
        category: formData.get('category'),
        description: formData.get('description'),
        date: formData.get('date')
    };
    
    try {
        const response = await fetch(`${API_BASE}/transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('transactionModal');
            e.target.reset();
            loadDashboard();
            loadTransactions();
        }
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Error adding transaction. Please try again.');
    }
}

async function deleteTransaction(id) {
    if (!confirm('Are you sure you want to delete this transaction?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/transactions/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadDashboard();
            loadTransactions();
        }
    } catch (error) {
        console.error('Error deleting transaction:', error);
    }
}

// Savings Goals Functions
async function loadSavingsGoals() {
    try {
        const response = await fetch(`${API_BASE}/goals`);
        const goals = await response.json();
        
        const container = document.getElementById('goals-list');
        
        if (goals.length === 0) {
            container.innerHTML = '<p class="empty-state">No savings goals yet. Set your first goal to start saving!</p>';
            return;
        }
        
        container.innerHTML = goals.map(goal => `
            <div class="goal-card">
                <div class="goal-header">
                    <div>
                        <div class="goal-name">${goal.name}</div>
                        ${goal.deadline ? `<div class="goal-deadline">Due: ${formatDate(goal.deadline)}</div>` : ''}
                    </div>
                </div>
                <div class="goal-amounts">
                    <span>${formatMoney(goal.current_amount)} / ${formatMoney(goal.target_amount)}</span>
                    <span>${goal.progress.toFixed(1)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${Math.min(goal.progress, 100)}%"></div>
                </div>
                <div class="goal-actions">
                    <input type="number" step="0.01" placeholder="Add amount" id="goal-amount-${goal.id}">
                    <button class="btn btn-success btn-small" onclick="updateGoal(${goal.id})">Update</button>
                    <button class="btn btn-danger btn-small" onclick="deleteGoal(${goal.id})">Delete</button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading goals:', error);
    }
}

function showGoalModal() {
    document.getElementById('goalModal').classList.add('active');
}

async function handleGoalSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        target_amount: formData.get('target_amount'),
        current_amount: formData.get('current_amount'),
        deadline: formData.get('deadline')
    };
    
    try {
        const response = await fetch(`${API_BASE}/goals`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('goalModal');
            e.target.reset();
            loadSavingsGoals();
        }
    } catch (error) {
        console.error('Error adding goal:', error);
    }
}

async function updateGoal(goalId) {
    const input = document.getElementById(`goal-amount-${goalId}`);
    const amount = parseFloat(input.value);
    
    if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/goals/${goalId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current_amount: amount })
        });
        
        if (response.ok) {
            loadSavingsGoals();
        }
    } catch (error) {
        console.error('Error updating goal:', error);
    }
}

async function deleteGoal(goalId) {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/goals/${goalId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            loadSavingsGoals();
        }
    } catch (error) {
        console.error('Error deleting goal:', error);
    }
}

// Budget Functions
async function loadBudgets() {
    try {
        const response = await fetch(`${API_BASE}/budget`);
        const budgets = await response.json();
        
        const container = document.getElementById('budget-list');
        
        if (budgets.length === 0) {
            container.innerHTML = '<p class="empty-state">No budgets set. Create budgets to track your spending!</p>';
            return;
        }
        
        container.innerHTML = budgets.map(budget => {
            let statusClass = 'low';
            if (budget.percentage > 80) statusClass = 'high';
            else if (budget.percentage > 60) statusClass = 'medium';
            
            return `
                <div class="budget-item">
                    <div class="budget-header">
                        <div class="budget-category">${budget.category}</div>
                        <div class="budget-amounts">
                            ${formatMoney(budget.spent)} / ${formatMoney(budget.amount)}
                            (${budget.percentage.toFixed(1)}%)
                        </div>
                    </div>
                    <div class="budget-progress">
                        <div class="budget-progress-bar">
                            <div class="budget-progress-fill ${statusClass}" 
                                 style="width: ${Math.min(budget.percentage, 100)}%"></div>
                        </div>
                    </div>
                    ${budget.remaining < 0 ? 
                        `<p style="color: var(--danger); margin-top: 10px;">Over budget by ${formatMoney(Math.abs(budget.remaining))}</p>` :
                        `<p style="color: var(--success); margin-top: 10px;">${formatMoney(budget.remaining)} remaining</p>`
                    }
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading budgets:', error);
    }
}

function showBudgetModal() {
    const categorySelect = document.getElementById('budget-category');
    categorySelect.innerHTML = '<option value="">Select category</option>' +
        EXPENSE_CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('');
    
    document.getElementById('budgetModal').classList.add('active');
}

async function handleBudgetSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        category: formData.get('category'),
        amount: formData.get('amount')
    };
    
    try {
        const response = await fetch(`${API_BASE}/budget`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal('budgetModal');
            e.target.reset();
            loadBudgets();
        }
    } catch (error) {
        console.error('Error setting budget:', error);
    }
}

// Analytics Functions
let categoryChart = null;
let trendChart = null;

async function loadAnalytics() {
    try {
        // Load spending by category
        const categoryResponse = await fetch(`${API_BASE}/analytics/spending-by-category`);
        const categoryData = await categoryResponse.json();
        renderCategoryChart(categoryData);
        
        // Load monthly trend
        const trendResponse = await fetch(`${API_BASE}/analytics/monthly-trend`);
        const trendData = await trendResponse.json();
        renderTrendChart(trendData);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function renderCategoryChart(data) {
    const ctx = document.getElementById('categoryChart').getContext('2d');
    
    if (categoryChart) {
        categoryChart.destroy();
    }
    
    const colors = [
        '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6',
        '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'
    ];
    
    categoryChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.map(d => d.category),
            datasets: [{
                data: data.map(d => d.amount),
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    
    if (trendChart) {
        trendChart.destroy();
    }
    
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [
                {
                    label: 'Income',
                    data: data.income,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: data.expenses,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: (value) => formatMoney(value)
                    }
                }
            }
        }
    });
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
