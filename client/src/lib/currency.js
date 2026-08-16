const KEY = 'pfm-currency-v2'

export const DEFAULT_CURRENCY = { country: 'Pakistan', code: 'PKR', locale: 'ur-PK' }

export function loadCurrency() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY))
    if (saved?.code && saved?.country) return saved
  } catch {
    /* ignore */
  }
  return DEFAULT_CURRENCY
}

export function saveCurrency(value) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

export function formatMoney(amount, currency) {
  const value = Number(amount) || 0
  try {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code
    }).format(value)
  } catch {
    return `${currency.code} ${value.toFixed(2)}`
  }
}

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
  'Bills & Utilities', 'Healthcare', 'Education', 'Housing',
  'Personal Care', 'Travel', 'Gifts & Donations', 'Other'
]

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'
]
