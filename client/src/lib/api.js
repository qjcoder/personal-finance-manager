import axios from 'axios'
import { apiBase } from './native.js'

const api = axios.create({ baseURL: apiBase() })

export const getSummary = () => api.get('/summary').then(r => r.data)
export const getInsights = (currency) =>
  api.get('/analytics/insights', { params: { currency } }).then(r => r.data)
export const getTransactions = () => api.get('/transactions').then(r => r.data)
export const addTransaction = (payload) => api.post('/transactions', payload).then(r => r.data)
export const updateTransaction = (id, payload) => api.put(`/transactions/${id}`, payload).then(r => r.data)
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then(r => r.data)
export const getGoals = () => api.get('/goals').then(r => r.data)
export const addGoal = (payload) => api.post('/goals', payload).then(r => r.data)
export const updateGoal = (id, current_amount) =>
  api.put(`/goals/${id}`, { current_amount }).then(r => r.data)
export const deleteGoal = (id) => api.delete(`/goals/${id}`).then(r => r.data)
export const getBudgets = () => api.get('/budget').then(r => r.data)
export const setBudget = (payload) => api.post('/budget', payload).then(r => r.data)
export const getSpendingByCategory = () =>
  api.get('/analytics/spending-by-category').then(r => r.data)
export const getMonthlyTrend = () =>
  api.get('/analytics/monthly-trend').then(r => r.data)
export const getProfile = () => api.get('/profile').then(r => r.data)
export const saveProfile = (payload) => api.put('/profile', payload).then(r => r.data)
export const exportBackup = () => api.get('/backup').then(r => r.data)
export const restoreBackup = (payload) => api.put('/backup', payload).then(r => r.data)
