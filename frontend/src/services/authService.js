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
  const branchId = data?.branchId || data?.employee?.branchId || null

  if (accountType) {
    localStorage.setItem('accountType', accountType)
  }
  if (role) {
    localStorage.setItem('role', role)
  } else {
    localStorage.removeItem('role')
  }
  if (accountType === 'employee' && branchId) {
    localStorage.setItem('branchId', String(branchId))
  } else {
    localStorage.removeItem('branchId')
  }

  return {
    ...data,
    accountType,
    role,
    branchId,
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
  localStorage.removeItem('branchId')
}

export function getSession() {
  const accountType = localStorage.getItem('accountType')
  const role = localStorage.getItem('role')
  const branchId = localStorage.getItem('branchId')
  return accountType ? { accountType, role, branchId } : null
}