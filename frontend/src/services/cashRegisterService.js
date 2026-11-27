import { apiRequest } from './api'

export async function getCashRegisterHistory({ status, branch } = {}) {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (branch) params.set('branch', branch)

  const query = params.toString()
  const response = await apiRequest(`/cash/history${query ? `?${query}` : ''}`)
  if (!Array.isArray(response?.data)) {
    throw new Error('La respuesta del historial de caja no es válida.')
  }
  return response.data
}

export async function openCashShift({ openingAmount, branch }) {
  const response = await apiRequest('/cash/open', {
    method: 'POST',
    body: JSON.stringify({ openingAmount, branch }),
  })

  if (!response?.ok || !response?.data) {
    throw new Error(response?.message || 'No se pudo abrir la caja.')
  }
  return response.data
}

export async function closeCashShift({ countedCash, branch, notes = '' }) {
  const response = await apiRequest('/cash/close', {
    method: 'POST',
    body: JSON.stringify({ countedCash, branch, notes }),
  })

  if (!response?.ok || !response?.data?.shift) {
    throw new Error(response?.message || 'No se pudo cerrar la caja.')
  }
  return response.data
}
