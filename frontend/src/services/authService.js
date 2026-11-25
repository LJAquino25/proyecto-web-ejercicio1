import { apiRequest } from './api'

export async function loginUser({ email, password }) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  if (data?.customer?.token) {
    localStorage.setItem('token', data.customer.token)
    localStorage.setItem('accountType', data.customer.accountType)
  }

  return data
}

export async function registerCustomer({ full_name, email, phone, address, password }) {
  return apiRequest('/customer', {
    method: 'POST',
    body: JSON.stringify({ full_name, email, phone, address, password }),
  })
}

export function logoutUser() {
  localStorage.removeItem('token')
  localStorage.removeItem('accountType')
}

export function getSession() {
  const token = localStorage.getItem('token')
  const accountType = localStorage.getItem('accountType')
  return token ? { token, accountType } : null
}
export function getCustomerIdFromToken() {
  const token = localStorage.getItem('token')
  const accountType = localStorage.getItem('accountType')
  if (!token || accountType !== 'customer') return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return Number.isInteger(payload.id) ? payload.id : null
  } catch {
    return null
  }
}