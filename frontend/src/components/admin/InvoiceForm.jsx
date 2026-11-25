import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  Receipt,
  X,
  Check,
  UserRound,
  Building2,
  Banknote,
  CreditCard,
  Bitcoin
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/OrderForm.css'
import '../../styles/InvoiceForm.css'

const ORDERS = [
  { id: 1, total: 12.50, invoice_type: 'CF' },
  { id: 2, total: 8.75, invoice_type: 'CF' },
  { id: 3, total: 24.00, invoice_type: 'CCF' }
]

const INVOICE_TYPES = [
  {
    value: 'CF',
    label: 'Consumidor final',
    icon: UserRound
  },
  {
    value: 'CCF',
    label: 'Crédito fiscal',
    icon: Building2
  }
]

const PAYMENT_METHODS = [
  {
    value: 'CASH',
    label: 'Efectivo',
    icon: Banknote
  },
  {
    value: 'CARD',
    label: 'Tarjeta',
    icon: CreditCard
  },
  {
    value: 'BITCOIN',
    label: 'Bitcoin',
    icon: Bitcoin
  }
]

const INITIAL_FORM = {
  orderId: '',
  type: 'CF',
  paymentMethod: 'CASH',
  institution_name: '',
  nit: '',
  nrc: '',
  business_line: '',
  address: ''
}

function InvoiceForm({ isOpen, toggle, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM)

  const updateField = (name, value) => {
    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const selectedOrder = ORDERS.find(
    order => order.id === Number(form.orderId)
  )

  const total = selectedOrder?.total || 0
  const subtotal = total / 1.13
  const tax = total - subtotal

  const handleOrderChange = event => {
    const orderId = event.target.value

    const order = ORDERS.find(
      item => item.id === Number(orderId)
    )

    setForm(previous => ({
      ...previous,
      orderId,
      type: order?.invoice_type || 'CF'
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!onSubmit) return

    const invoice = {
      orderId: Number(form.orderId),
      type: form.type,
      paymentMethod: form.paymentMethod
    }

    if (form.type === 'CCF') {
      Object.assign(invoice, {
        institution_name: form.institution_name,
        nit: form.nit,
        nrc: form.nrc,
        business_line: form.business_line,
        address: form.address
      })
    }

    onSubmit(invoice)
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      scrollable
      size="lg"
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon pink">
            <Receipt size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">FACTURACIÓN</span>
            <h2>Nueva factura</h2>
          </div>

          <button
            type="button"
            className="admin-form-close"
            onClick={toggle}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          Generá un comprobante de venta a partir de un pedido.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="admin-form-field">
            <span>Pedido asociado</span>

            <select
              value={form.orderId}
              onChange={handleOrderChange}
              required
            >
              <option value="">Seleccionar pedido</option>

              {ORDERS.map(order => (
                <option key={order.id} value={order.id}>
                  Pedido #{String(order.id).padStart(3, '0')}
                  {' - $'}
                  {order.total.toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <div className="invoice-form-section">
            <h3>Tipo de comprobante</h3>

            <div className="invoice-type-options">
              {INVOICE_TYPES.map(type => {
                const TypeIcon = type.icon

                return (
                  <button
                    key={type.value}
                    type="button"
                    className={`invoice-type-option ${
                      form.type === type.value ? 'selected' : ''
                    }`}
                    onClick={() => updateField('type', type.value)}
                    aria-pressed={form.type === type.value}
                  >
                    <TypeIcon size={28} />
                    <span>{type.label}</span>

                    {form.type === type.value && (
                      <span className="invoice-option-check">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {form.type === 'CCF' && (
            <section className="invoice-fiscal-section">
              <div className="invoice-fiscal-heading">
                <Building2 size={23} />

                <div>
                  <h3>Información fiscal</h3>
                  <p>Completá los datos del contribuyente.</p>
                </div>
              </div>

              <div className="admin-form-grid">
                <label className="admin-form-field wide">
                  <span>Nombre o razón social</span>

                  <input
                    value={form.institution_name}
                    onChange={event =>
                      updateField('institution_name', event.target.value)
                    }
                    placeholder="Nombre de la empresa"
                    required
                  />
                </label>

                <label className="admin-form-field">
                  <span>NIT</span>

                  <input
                    value={form.nit}
                    onChange={event =>
                      updateField('nit', event.target.value)
                    }
                    placeholder="Número de NIT"
                    required
                  />
                </label>

                <label className="admin-form-field">
                  <span>NRC</span>

                  <input
                    value={form.nrc}
                    onChange={event =>
                      updateField('nrc', event.target.value)
                    }
                    placeholder="Número de registro"
                    required
                  />
                </label>

                <label className="admin-form-field wide">
                  <span>Giro comercial</span>

                  <input
                    value={form.business_line}
                    onChange={event =>
                      updateField('business_line', event.target.value)
                    }
                    placeholder="Actividad económica"
                    required
                  />
                </label>

                <label className="admin-form-field wide">
                  <span>Dirección</span>

                  <textarea
                    value={form.address}
                    onChange={event =>
                      updateField('address', event.target.value)
                    }
                    placeholder="Dirección de la empresa"
                    rows={3}
                    required
                  />
                </label>
              </div>
            </section>
          )}

          <div className="invoice-form-section">
            <h3>Método de pago</h3>

            <div className="invoice-payment-options">
              {PAYMENT_METHODS.map(method => {
                const PaymentIcon = method.icon

                return (
                  <button
                    key={method.value}
                    type="button"
                    className={`invoice-payment-option ${
                      form.paymentMethod === method.value
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() =>
                      updateField('paymentMethod', method.value)
                    }
                    aria-pressed={form.paymentMethod === method.value}
                  >
                    <PaymentIcon size={26} />
                    <span>{method.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="order-summary">
            <div className="order-summary-row">
              <span>Subtotal sin IVA</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>

            <div className="order-summary-row">
              <span>IVA (13%)</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>

            <div className="order-summary-total">
              <span>Total a pagar</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={toggle}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={!onSubmit || !selectedOrder}
              title={!onSubmit ? 'Pendiente de conexión' : undefined}
            >
              <Check size={18} />
              Emitir factura
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default InvoiceForm