import { apiRequest } from './api'

export async function loginUser({ email, password }) {
  const data = await apiRequest('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })

  const accountType =
    typeof data?.customer === 'string'
      ? data.customer
      : data?.accountType || data?.customer?.accountType || null

  const role = data?.role || data?.employee?.role || null

  if (accountType) {
    localStorage.setItem('accountType', accountType)
  }
  if (role) {
    localStorage.setItem('role', role)
  }

  return {
    ...data,
    accountType,
    role,
  }
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
  localStorage.removeItem('role')
}

export function getSession() {

  const accountType = localStorage.getItem('accountType')
  const role = localStorage.getItem('role')
  return accountType ? { accountType, role } : null
}