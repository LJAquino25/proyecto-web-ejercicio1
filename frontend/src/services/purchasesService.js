import { apiRequest } from './api'

export { getSuppliers } from './inventoryService'

export async function createSupplier({ name, phone }) {
  return apiRequest('/purchases/supplier', {
    method: 'POST',
    body: JSON.stringify({ name, phone })
  })
}

export async function getPurchaseOrders(status) {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : ''

  const data = await apiRequest(
    `/purchases/purchase-orders${query}`
  )

  if (!Array.isArray(data?.purchaseOrders)) {
    throw new Error('La respuesta de compras no es válida.')
  }

  return data.purchaseOrders
}

export async function createPurchaseOrder(form) {
  return apiRequest('/purchases/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(form)
  })
}

export async function createPurchaseInvoice(form) {
  return apiRequest('/purchases/purchase-invoices', {
    method: 'POST',
    body: JSON.stringify(form)
  })
}

export async function updateSupplier(id, { name, phone }) {
  return apiRequest(`/purchases/supplier/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name, phone })
  })
}

export async function getAccountPayables() {
  const data = await apiRequest('/purchases/account-payables')

  if (!Array.isArray(data?.accountPayables)) {
    throw new Error('La respuesta de cuentas por pagar no es válida.')
  }

  return data.accountPayables
}

export async function createSupplierPayment(form) {
  return apiRequest('/purchases/supplier-payments', {
    method: 'POST',
    body: JSON.stringify(form)
  })
}