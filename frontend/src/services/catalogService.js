import { apiRequest } from './api'

export async function getCatalog() {
  return apiRequest('/inventory/catalog')
}

export async function getCatalogDetails() {
  return apiRequest('/inventory/catalog/details')
}

export async function getBranches() {
  const data = await apiRequest('/branches')
  if (!Array.isArray(data?.branches)) {
    throw new Error('La respuesta de sucursales no es válida.')
  }
  return data.branches
}

export async function getSalesOrders() {
  const data = await apiRequest('/sales/orders')
  if (!Array.isArray(data?.orders)) {
    throw new Error('La respuesta de pedidos no es válida.')
  }
  return data.orders
}

export async function getSalesInvoices() {
  const data = await apiRequest('/sales/invoices')
  if (!Array.isArray(data?.invoices)) {
    throw new Error('La respuesta de facturas no es válida.')
  }
  return data.invoices
}

export async function createOrder({
  branchId = 1,
  invoiceType = 'NORMAL',
  status = 'CART',
  orderItems,
}) {
  return apiRequest('/sales/orders', {
    method: 'POST',
    body: JSON.stringify({
      branch_id: branchId,
      invoice_type: invoiceType,
      status,
      orderItems,
    }),
  })
}

export async function createInvoice({
  orderId,
  type,
  paymentMethod = null,
  nit = null,
  nrc = null,
  institution_name = null,
  business_line = null,
  address = null,
}) {
  return apiRequest('/sales/invoices', {
    method: 'POST',
    body: JSON.stringify({
      orderId,
      type,
      paymentMethod,
      nit,
      nrc,
      institution_name,
      business_line,
      address,
    }),
  })
}