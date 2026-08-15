import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Default to localhost - users can change this in settings
const DEFAULT_API_URL = 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.apiUrl = DEFAULT_API_URL;
    this.loadApiUrl();
  }

  async loadApiUrl() {
    try {
      const savedUrl = await AsyncStorage.getItem('apiUrl');
      if (savedUrl) {
        this.apiUrl = savedUrl;
      }
    } catch (error) {
      console.error('Error loading API URL:', error);
    }
  }

  async setApiUrl(url) {
    this.apiUrl = url;
    await AsyncStorage.setItem('apiUrl', url);
  }

  getApiUrl() {
    return this.apiUrl;
  }

  // Transactions
  async getTransactions() {
    try {
      const response = await axios.get(`${this.apiUrl}/transactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  async addTransaction(transaction) {
    try {
      const response = await axios.post(`${this.apiUrl}/transactions`, transaction);
      return response.data;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  async deleteTransaction(id) {
    try {
      const response = await axios.delete(`${this.apiUrl}/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Summary
  async getSummary() {
    try {
      const response = await axios.get(`${this.apiUrl}/summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching summary:', error);
      throw error;
    }
  }

  // Goals
  async getGoals() {
    try {
      const response = await axios.get(`${this.apiUrl}/goals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching goals:', error);
      throw error;
    }
  }

  async addGoal(goal) {
    try {
      const response = await axios.post(`${this.apiUrl}/goals`, goal);
      return response.data;
    } catch (error) {
      console.error('Error adding goal:', error);
      throw error;
    }
  }

  async updateGoal(id, currentAmount) {
    try {
      const response = await axios.put(`${this.apiUrl}/goals/${id}`, {
        current_amount: currentAmount,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  async deleteGoal(id) {
    try {
      const response = await axios.delete(`${this.apiUrl}/goals/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }

  // Budget
  async getBudgets() {
    try {
      const response = await axios.get(`${this.apiUrl}/budget`);
      return response.data;
    } catch (error) {
      console.error('Error fetching budgets:', error);
      throw error;
    }
  }

  async setBudget(budget) {
    try {
      const response = await axios.post(`${this.apiUrl}/budget`, budget);
      return response.data;
    } catch (error) {
      console.error('Error setting budget:', error);
      throw error;
    }
  }

  // Analytics
  async getSpendingByCategory() {
    try {
      const response = await axios.get(`${this.apiUrl}/analytics/spending-by-category`);
      return response.data;
    } catch (error) {
      console.error('Error fetching spending by category:', error);
      throw error;
    }
  }

  async getMonthlyTrend(months = 6) {
    try {
      const response = await axios.get(`${this.apiUrl}/analytics/monthly-trend?months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly trend:', error);
      throw error;
    }
  }

  async getInsights() {
    try {
      const response = await axios.get(`${this.apiUrl}/analytics/insights`);
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }
}

export default new ApiService();
