import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  Receipt,
  X,
  Check,
  Banknote,
  CalendarClock
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/OrderForm.css'
import '../../styles/PurchaseInvoiceForm.css'

const PURCHASE_ORDERS = [
  {
    id: 4,
    supplier: 'Lácteos del Valle',
    branch: 'Centro Histórico',
    total: 120
  },
  {
    id: 5,
    supplier: 'Café de Occidente',
    branch: 'Escalón',
    total: 85
  },
  {
    id: 6,
    supplier: 'Distribuidora La Central',
    branch: 'Centro Histórico',
    total: 300
  }
]

const PAYMENT_CONDITIONS = [
  {
    id: 'CASH',
    label: 'Al contado',
    description: 'Pago inmediato',
    icon: Banknote
  },
  {
    id: 'CREDIT',
    label: 'Al crédito',
    description: 'Pago posterior',
    icon: CalendarClock
  }
]

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const createInitialForm = () => ({
  purchase_order_id: '',
  invoice_number: '',
  issue_date: getToday(),
  payment_condition: 'CASH',
  due_date: ''
})

function PurchaseInvoiceForm({ isOpen, toggle, onSubmit }) {
  const [form, setForm] = useState(createInitialForm)

  const updateField = (field, value) => {
    setForm(previous => ({
      ...previous,
      [field]: value
    }))
  }

  const selectedOrder = PURCHASE_ORDERS.find(
    order => order.id === Number(form.purchase_order_id)
  )

  const total = selectedOrder?.total || 0

  const isCredit = form.payment_condition === 'CREDIT'

  const isValid =
    Boolean(selectedOrder) &&
    form.invoice_number.trim() !== '' &&
    form.issue_date !== '' &&
    (
      !isCredit ||
      (
        form.due_date !== '' &&
        form.due_date >= form.issue_date
      )
    )

  const handleClose = () => {
    setForm(createInitialForm())
    toggle()
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!onSubmit || !isValid) return

    onSubmit({
      purchase_order_id: Number(form.purchase_order_id),
      invoice_number: form.invoice_number.trim(),
      issue_date: form.issue_date,
      payment_condition: form.payment_condition,
      due_date: isCredit ? form.due_date : null
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
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
            <span className="admin-eyebrow">
              COMPRAS Y PROVEEDORES
            </span>

            <h2>Nueva factura de compra</h2>
          </div>

          <button
            type="button"
            className="admin-form-close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          Registrá la factura recibida y las condiciones
          de pago de la compra.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Orden de compra</span>

              <select
                value={form.purchase_order_id}
                onChange={event =>
                  updateField(
                    'purchase_order_id',
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Seleccioná una orden de compra
                </option>

                {PURCHASE_ORDERS.map(order => (
                  <option
                    key={order.id}
                    value={order.id}
                  >
                    #{String(order.id).padStart(3, '0')}
                    {' - '}
                    {order.supplier}
                  </option>
                ))}
              </select>
            </label>

            {selectedOrder && (
              <div className="purchase-invoice-information">
                <div>
                  <span>Proveedor</span>
                  <strong>{selectedOrder.supplier}</strong>
                </div>

                <div>
                  <span>Sucursal</span>
                  <strong>{selectedOrder.branch}</strong>
                </div>
              </div>
            )}

            <label className="admin-form-field">
              <span>Número de factura</span>

              <input
                type="text"
                placeholder="FAC-004"
                value={form.invoice_number}
                onChange={event =>
                  updateField(
                    'invoice_number',
                    event.target.value
                  )
                }
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Fecha de emisión</span>

              <input
                type="date"
                value={form.issue_date}
                onChange={event =>
                  updateField(
                    'issue_date',
                    event.target.value
                  )
                }
                required
              />
            </label>
          </div>

          <section className="purchase-invoice-section">
            <h3>Condición de pago</h3>

            <div className="purchase-payment-options">
              {PAYMENT_CONDITIONS.map(condition => {
                const PaymentIcon = condition.icon

                const isSelected =
                  form.payment_condition === condition.id

                return (
                  <button
                    key={condition.id}
                    type="button"
                    className={`purchase-payment-option ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() =>
                      updateField(
                        'payment_condition',
                        condition.id
                      )
                    }
                    aria-pressed={isSelected}
                  >
                    <PaymentIcon size={28} />

                    <strong>{condition.label}</strong>

                    <small>{condition.description}</small>

                    <span className="purchase-payment-indicator">
                      {isSelected && <Check size={14} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {isCredit && (
            <div className="purchase-credit-section">
              <label className="admin-form-field">
                <span>Fecha límite de pago</span>

                <input
                  type="date"
                  min={form.issue_date}
                  value={form.due_date}
                  onChange={event =>
                    updateField(
                      'due_date',
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <p>
                Esta compra generará una cuenta por pagar
                cuando se registre correctamente.
              </p>
            </div>
          )}

          <div className="order-summary">
            <div className="order-summary-total">
              <span>Total de la factura</span>
              <strong>${total.toFixed(2)}</strong>
            </div>

            <div className="order-summary-row">
              <span>
                {isCredit
                  ? 'Saldo pendiente'
                  : 'Pago inmediato'}
              </span>

              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={handleClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={!onSubmit || !isValid}
              title={!onSubmit ? 'Pendiente de conexión' : undefined}
            >
              <Check size={18} />
              Registrar factura
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default PurchaseInvoiceForm