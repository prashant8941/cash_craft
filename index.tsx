/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

// --- STATE MANAGEMENT ---
const CATEGORIES = [
    { name: 'Food', color: '#ff6384' },
    { name: 'Transport', color: '#36a2eb' },
    { name: 'Shopping', color: '#ffce56' },
    { name: 'Bills', color: '#4bc0c0' },
    { name: 'Entertainment', color: '#9966ff' },
    { name: 'Health', color: '#ff9f40' },
    { name: 'Other', color: '#c9cbcf' },
];

let transactions = [];
let budget = 0;
let ai;

// --- DOM ELEMENT REFERENCES (will be assigned in init) ---
let budgetInput;
let totalExpensesEl;
let remainingBudgetEl;
let budgetProgressBar;
let addTransactionForm;
let transactionDescriptionInput;
let transactionAmountInput;
let transactionCategoryInput;
let transactionList;
let aiPromptForm;
let aiPromptInput;
let aiChatBox;
let chartContainer;


// --- LOCAL STORAGE ---
const saveState = () => {
  localStorage.setItem('cashCraftTransactions', JSON.stringify(transactions));
  localStorage.setItem('cashCraftBudget', JSON.stringify(budget));
};

const loadState = () => {
  const savedTransactions = localStorage.getItem('cashCraftTransactions');
  const savedBudget = localStorage.getItem('cashCraftBudget');

  if (savedTransactions) {
    const parsedTransactions = JSON.parse(savedTransactions);
    transactions = parsedTransactions.map(tx => ({
        ...tx,
        category: tx.category || 'Other',
        color: tx.color || CATEGORIES.find(c => c.name === (tx.category || 'Other'))?.color || '#c9cbcf'
    }));
  }
  if (savedBudget) {
    budget = JSON.parse(savedBudget);
  }
};

// --- RENDER FUNCTIONS ---
const renderTransactions = () => {
  transactionList.innerHTML = '';
  if (transactions.length === 0) {
    transactionList.innerHTML = `<li class="empty-state">No transactions yet. Add one above!</li>`;
  } else {
    [...transactions].reverse().forEach(tx => {
      const li = document.createElement('li');
      li.innerHTML = `
        <div class="transaction-details">
            <span class="description">${tx.description}</span>
            <span class="category-badge" style="background-color: ${tx.color}">${tx.category}</span>
        </div>
        <div class="transaction-actions">
            <span class="amount">₹${tx.amount.toFixed(2)}</span>
            <button class="delete-btn" data-id="${tx.id}" aria-label="Delete transaction">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
        </div>
      `;
      transactionList.appendChild(li);
    });
  }
};

const renderExpenseChart = () => {
    chartContainer.innerHTML = '';
    if (transactions.length === 0) {
        chartContainer.innerHTML = '<p class="empty-state">No expense data to display.</p>';
        return;
    }

    // FIX: Added a type to the accumulator to resolve TypeScript errors about unknown properties.
    const categoryTotals = transactions.reduce((acc: { [key: string]: { total: number; color: string; }; }, tx) => {
        acc[tx.category] = (acc[tx.category] || { total: 0, color: tx.color });
        acc[tx.category].total += tx.amount;
        return acc;
    }, {});

    const totalExpenses = Object.values(categoryTotals).reduce((sum, item) => sum + item.total, 0);

    const chartData = Object.entries(categoryTotals)
        .map(([category, { total, color }]) => ({
            category,
            total,
            color,
            percentage: totalExpenses > 0 ? (total / totalExpenses) * 100 : 0,
        }))
        .sort((a, b) => b.total - a.total);

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", "0 0 36 36");
    const chartDiv = document.createElement('div');
    chartDiv.id = 'expense-chart';
    chartDiv.appendChild(svg);

    let cumulativePercentage = 0;
    chartData.forEach((data, index) => {
        const slice = document.createElementNS(svgNS, "path");
        slice.setAttribute("class", "chart-slice");
        slice.setAttribute("fill", data.color);
        slice.setAttribute("stroke-dasharray", `${data.percentage} ${100 - data.percentage}`);
        slice.setAttribute("stroke-dashoffset", `-${cumulativePercentage}`);
        slice.setAttribute("d", "M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831");
        
        slice.style.animationDelay = `${index * 100}ms`;
        
        svg.appendChild(slice);
        cumulativePercentage += data.percentage;
    });

    const legend = document.createElement('ul');
    legend.id = 'chart-legend';
    chartData.forEach(data => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="legend-color-box" style="background-color: ${data.color}"></div>
            <span class="legend-label">${data.category} (${data.percentage.toFixed(1)}%)</span>
            <span class="legend-amount">₹${data.total.toFixed(2)}</span>
        `;
        legend.appendChild(li);
    });

    chartContainer.appendChild(chartDiv);
    chartContainer.appendChild(legend);
};


const renderDashboard = () => {
  const totalExpenses = transactions.reduce((acc, tx) => acc + tx.amount, 0);
  const remaining = budget - totalExpenses;
  
  budgetInput.value = budget > 0 ? budget.toFixed(2) : '';
  totalExpensesEl.textContent = `₹${totalExpenses.toFixed(2)}`;
  remainingBudgetEl.textContent = `₹${remaining.toFixed(2)}`;

  let progressPercent = 0;
  if (budget > 0) {
    progressPercent = Math.min((totalExpenses / budget) * 100, 100);
  }
  
  budgetProgressBar.style.width = `${progressPercent}%`;

  if (progressPercent > 90) {
    budgetProgressBar.style.backgroundColor = 'var(--danger-color)';
  } else if (progressPercent > 70) {
    budgetProgressBar.style.backgroundColor = '#f59e0b';
  } else {
    budgetProgressBar.style.backgroundColor = 'var(--primary-color)';
  }
};

const addMessageToChat = (message, sender) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
    messageDiv.innerHTML = message;
    aiChatBox.appendChild(messageDiv);
    aiChatBox.scrollTop = aiChatBox.scrollHeight;
    return messageDiv;
};


// --- EVENT HANDLERS ---
const handleSetBudget = (e) => {
  const target = e.target;
  const newBudget = parseFloat(target.value);
  if (!isNaN(newBudget) && newBudget >= 0) {
    budget = newBudget;
    updateAndSave();
  }
};

const handleAddTransaction = (e) => {
  e.preventDefault();
  const description = transactionDescriptionInput.value;
  const amount = parseFloat(transactionAmountInput.value);
  const categoryName = transactionCategoryInput.value;

  if (description && !isNaN(amount) && amount > 0 && categoryName) {
    const categoryDetails = CATEGORIES.find(c => c.name === categoryName);
    const newTransaction = {
      id: Date.now(),
      description,
      amount,
      category: categoryName,
      color: categoryDetails.color
    };
    transactions.push(newTransaction);
    addTransactionForm.reset();
    transactionCategoryInput.value = ''; // Reset select to placeholder
    updateAndSave();
  }
};

const handleDeleteTransaction = (id) => {
    const transactionToDelete = transactions.find(tx => tx.id === id);
    if (!transactionToDelete) return;

    const isConfirmed = window.confirm(`Are you sure you want to delete this transaction?\n"${transactionToDelete.description}: ₹${transactionToDelete.amount.toFixed(2)}"`);
    if (isConfirmed) {
        transactions = transactions.filter(tx => tx.id !== id);
        updateAndSave();
    }
};


// --- GEMINI API INTEGRATION ---
const handleAIPrompt = async (e) => {
    e.preventDefault();
    if (!ai) {
        addMessageToChat('AI Advisor is not available. Please make sure you have added your API key.', 'ai');
        return;
    }

    const userPrompt = aiPromptInput.value.trim();
    if (!userPrompt) return;

    addMessageToChat(userPrompt, 'user');
    aiPromptInput.value = '';
    
    aiPromptForm.querySelector('button').disabled = true;
    const aiMessageElement = addMessageToChat(
        `<div class="typing-indicator"><span></span><span></span><span></span></div>`, 'ai'
    );


    const financialDataContext = `
        Current Monthly Budget: ₹${budget.toFixed(2)}
        Total Expenses: ₹${transactions.reduce((acc, tx) => acc + tx.amount, 0).toFixed(2)}
        Transactions:
        ${transactions.map(tx => `- [${tx.category}] ${tx.description}: ₹${tx.amount.toFixed(2)}`).join('\n') || 'No transactions yet.'}
    `;

    const systemInstruction = `You are "Cash Craft Smart Advisor", a helpful and friendly financial assistant. 
    Analyze the user's financial data provided below. Your advice should be encouraging, clear, and actionable. 
    Focus on identifying spending patterns based on categories. 
    Do not mention that you are an AI. Respond in Markdown format.
    ---
    FINANCIAL DATA:
    ${financialDataContext}
    ---
    `;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: userPrompt,
            config: { systemInstruction },
        });

        let isFirstChunk = true;
        let fullResponseText = '';

        for await (const chunk of responseStream) {
            if (isFirstChunk) {
                aiMessageElement.innerHTML = ''; // Clear typing indicator
                isFirstChunk = false;
            }
            const chunkText = chunk.text;
            fullResponseText += chunkText;
            aiMessageElement.innerHTML = fullResponseText
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/(\r\n|\n|\r)/g, "<br>");
            aiChatBox.scrollTop = aiChatBox.scrollHeight;
        }

        if (isFirstChunk) { // Handle empty response stream
             aiMessageElement.textContent = "I'm not sure how to respond to that. Could you ask another way?";
        }

    } catch (error) {
        console.error('Gemini API error:', error);
        aiMessageElement.textContent = 'Sorry, I encountered an error while processing your request. Please try again.';
    } finally {
        aiPromptForm.querySelector('button').disabled = false;
    }
};

// --- INITIALIZATION ---
const updateAndSave = () => {
  renderDashboard();
  renderTransactions();
  renderExpenseChart();
  saveState();
};

const populateCategories = () => {
    if (!transactionCategoryInput) return;

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select Category';
    placeholder.disabled = true;
    placeholder.selected = true;
    transactionCategoryInput.appendChild(placeholder);

    CATEGORIES.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name;
        option.textContent = category.name;
        transactionCategoryInput.appendChild(option);
    });
};

const init = () => {
  // --- Find DOM Elements ---
  budgetInput = document.getElementById('budget-input');
  totalExpensesEl = document.getElementById('total-expenses');
  remainingBudgetEl = document.getElementById('remaining-budget');
  budgetProgressBar = document.getElementById('budget-progress-bar');
  addTransactionForm = document.getElementById('add-transaction-form');
  transactionDescriptionInput = document.getElementById('transaction-description');
  transactionAmountInput = document.getElementById('transaction-amount');
  transactionCategoryInput = document.getElementById('transaction-category');
  transactionList = document.getElementById('transaction-list');
  aiPromptForm = document.getElementById('ai-prompt-form');
  aiPromptInput = document.getElementById('ai-prompt-input');
  aiChatBox = document.getElementById('ai-chat-box');
  chartContainer = document.getElementById('chart-container');
  
  if (!addTransactionForm || !transactionCategoryInput || !aiChatBox) {
      console.error("A critical component could not be found on the page. App cannot start.");
      return;
  }

  // --- Initialize AI ---
  try {
    // FIX: Initialize the Google Gemini AI client using the API key from environment variables.
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } catch (error) {
      addMessageToChat('Error: Could not initialize AI. Please check your API key configuration.', 'ai');
      console.error('Gemini API initialization failed:', error);
      ai = null;
  }

  // --- Start App ---
  populateCategories();
  loadState();
  updateAndSave();

  // --- Attach Event Listeners ---
  budgetInput.addEventListener('change', handleSetBudget);
  addTransactionForm.addEventListener('submit', handleAddTransaction);
  aiPromptForm.addEventListener('submit', handleAIPrompt);
  
  transactionList.addEventListener('click', (e) => {
    const deleteButton = e.target.closest('.delete-btn');
    if (deleteButton) {
        const id = parseInt(deleteButton.getAttribute('data-id'), 10);
        handleDeleteTransaction(id);
    }
  });
};

document.addEventListener('DOMContentLoaded', init);
