const backendUrl = 'http://127.0.0.1:5000'; // Adjust if your Flask app runs on a different port

async function fetchData(url, method = 'GET', body = null) {
    const headers = {};
    if (body) {
        headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : null });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

async function getExpenses() {
    try {
        const expenses = await fetchData(`${backendUrl}/expenses`);
        displayExpenses(expenses);
    } catch (error) {
        document.getElementById('expenses-list').innerHTML = `<li>Error: ${error.message}</li>`;
    }
}

function displayExpenses(expenses) {
    const expensesList = document.getElementById('expenses-list');
    expensesList.innerHTML = '';
    if (expenses.length === 0) {
        expensesList.innerHTML = '<li>No expenses recorded yet.</li>';
        return;
    }
    expenses.forEach(expense => {
        const listItem = document.createElement('li');
        listItem.textContent = `${expense.description} - ₹${expense.amount.toFixed(2)} (${expense.category}) - ${expense.date}`;
        expensesList.appendChild(listItem);
    });
}

async function addExpense() {
    const description = document.getElementById('expense-description').value.trim();
    const amount = parseFloat(document.getElementById('expense-amount').value);
    const category = document.getElementById('expense-category').value.trim();
    const date = document.getElementById('expense-date').value;
    const messageElement = document.getElementById('expense-message');

    if (!description || isNaN(amount) || !category || !date) {
        messageElement.textContent = 'Please fill in all fields.';
        return;
    }

    try {
        const newExpense = await fetchData(`${backendUrl}/expenses`, 'POST', { description, amount, category, date });
        messageElement.textContent = 'Expense added successfully!';
        document.getElementById('add-expense-form').reset();
        getExpenses();
        getMonthlySummary();
    } catch (error) {
        messageElement.textContent = error.message;
    }
}

async function getBudgets() {
    try {
        const budgets = await fetchData(`${backendUrl}/budgets`);
        displayBudgets(budgets);
    } catch (error) {
        document.getElementById('budgets-list').innerHTML = `<li>Error: ${error.message}</li>`;
    }
}

function displayBudgets(budgets) {
    const budgetsList = document.getElementById('budgets-list');
    budgetsList.innerHTML = '';
    if (Object.keys(budgets).length === 0) {
        budgetsList.innerHTML = '<li>No budgets set yet.</li>';
        return;
    }
    for (const category in budgets) {
        const listItem = document.createElement('li');
        listItem.textContent = `${category}: ₹${budgets[category].toFixed(2)}`;
        budgetsList.appendChild(listItem);
    }
}

async function setBudget() {
    const category = document.getElementById('budget-category').value.trim();
    const limit = parseFloat(document.getElementById('budget-limit').value);
    const messageElement = document.getElementById('budget-message');

    if (!category || isNaN(limit)) {
        messageElement.textContent = 'Please enter category and a valid limit.';
        return;
    }

    try {
        const newBudget = await fetchData(`${backendUrl}/budgets`, 'POST', { category, limit });
        messageElement.textContent = `Budget for ${newBudget.category} set to ₹${newBudget.limit.toFixed(2)}`;
        document.getElementById('set-budget-form').reset();
        getBudgets();
    } catch (error) {
        messageElement.textContent = error.message;
    }
}

async function getSavingsGoals() {
    try {
        const goals = await fetchData(`${backendUrl}/savings_goals`);
        displaySavingsGoals(goals);
    } catch (error) {
        document.getElementById('savings-goals-list').innerHTML = `<li>Error: ${error.message}</li>`;
    }
}

function displaySavingsGoals(goals) {
    const goalsList = document.getElementById('savings-goals-list');
    goalsList.innerHTML = '';
    if (goals.length === 0) {
        goalsList.innerHTML = '<li>No savings goals added yet.</li>';
        return;
    }
    goals.forEach(goal => {
        const listItem = document.createElement('li');
        listItem.textContent = `${goal.name}: ₹${goal.current_amount.toFixed(2)} / ₹${goal.target_amount.toFixed(2)} (Deadline: ${goal.deadline})`;
        goalsList.appendChild(listItem);
    });
}

async function addSavingsGoal() {
    const name = document.getElementById('goal-name').value.trim();
    const target_amount = parseFloat(document.getElementById('goal-target').value);
    const deadline = document.getElementById('goal-deadline').value;
    const messageElement = document.getElementById('goal-message');

    if (!name || isNaN(target_amount) || !deadline) {
        messageElement.textContent = 'Please fill in all fields.';
        return;
    }

    try {
        const newGoal = await fetchData(`${backendUrl}/savings_goals`, 'POST', { name, target_amount, deadline });
        messageElement.textContent = `${newGoal.name} goal added!`;
        document.getElementById('add-goal-form').reset();
        getSavingsGoals();
    } catch (error) {
        messageElement.textContent = error.message;
    }
}

async function getMonthlySummary() {
    try {
        const summary = await fetchData(`${backendUrl}/expenses/summary`);
        displayMonthlySummary(summary);
    } catch (error) {
        document.getElementById('monthly-summary').innerHTML = `<li>Error: ${error.message}</li>`;
    }
}

function displayMonthlySummary(summary) {
    const summaryList = document.getElementById('monthly-summary');
    summaryList.innerHTML = '';
    if (Object.keys(summary).length === 0) {
        summaryList.innerHTML = '<li>No spending recorded this month.</li>';
        return;
    }
    for (const category in summary) {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span class="summary-item">${category}:</span> ₹${summary[category].toFixed(2)}`;
        summaryList.appendChild(listItem);
    }
}

// Load data on page load
window.onload = () => {
    getExpenses();
    getBudgets();
    getSavingsGoals();
    getMonthlySummary();
};