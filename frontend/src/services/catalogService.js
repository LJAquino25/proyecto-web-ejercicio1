import { apiRequest } from './api'

export async function getCatalog() {
  return apiRequest('/inventory/catalog')
}

export async function createOrder({
  branchId = 1,
  customerId = null,
  invoiceType = 'NORMAL',
  status = 'CART',
  orderItems,
}) {
  return apiRequest('/sales/orders', {
    method: 'POST',
    body: JSON.stringify({
      branch_id: branchId,
      customer_id: customerId,
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
  return apiRequest('/invoices', {
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