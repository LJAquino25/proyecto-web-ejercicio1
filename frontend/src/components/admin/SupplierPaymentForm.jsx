import { useState, useEffect } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  Wallet,
  X,
  Check,
  Banknote,
  Landmark,
  CreditCard
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/OrderForm.css'
import '../../styles/SupplierPaymentForm.css'

const PAYMENT_METHODS = [
  {
    id: 'CASH',
    label: 'Efectivo',
    icon: Banknote
  },
  {
    id: 'TRANSFER',
    label: 'Transferencia',
    icon: Landmark
  },
  {
    id: 'CARD',
    label: 'Tarjeta',
    icon: CreditCard
  }
]

const createInitialForm = () => ({
  account_payable_id: '',
  amount: '',
  method: 'CASH',
  reference: ''
})

const formatMoney = value =>
  `$${Number(value).toFixed(2)}`

function SupplierPaymentForm({
  isOpen,
  toggle,
  onSubmit,
  payables = []
}) {
  const [form, setForm] = useState(createInitialForm)

  useEffect(() => {
    if (isOpen) {
      setForm(createInitialForm())
    }
  }, [isOpen])

  const availablePayables = payables.filter(
    payable =>
      Number(payable.pending_balance) > 0 &&
      payable.status !== 'PAID'
  )

  const selectedPayable = availablePayables.find(
    payable =>
      Number(payable.id) ===
      Number(form.account_payable_id)
  )

  const balance = Number(
    selectedPayable?.pending_balance || 0
  )

  const paidAmount = selectedPayable
    ? Number(selectedPayable.total_amount) - balance
    : 0

  const paymentAmount = Number(form.amount)

  const remainingBalance =
    Math.round((balance - paymentAmount) * 100) / 100

  const isValidAmount =
    Number.isFinite(paymentAmount) &&
    paymentAmount > 0 &&
    paymentAmount <= balance &&
    Math.abs(
      paymentAmount * 100 -
      Math.round(paymentAmount * 100)
    ) < 0.000001

  const isValid =
    Boolean(selectedPayable) &&
    isValidAmount

  const isFullPayment =
    isValidAmount && remainingBalance === 0

  const updateField = (field, value) => {
    setForm(previous => ({
      ...previous,
      [field]: value
    }))
  }

  const handlePayableChange = event => {
    setForm(previous => ({
      ...previous,
      account_payable_id: event.target.value,
      amount: ''
    }))
  }

  const handleFullPayment = () => {
    if (!selectedPayable) return

    updateField('amount', balance.toFixed(2))
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!onSubmit || !isValid) return

    onSubmit({
      account_payable_id: Number(
        form.account_payable_id
      ),
      amount: paymentAmount,
      method: form.method,
      reference: form.reference.trim() || null
    })
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
          <span className="admin-form-icon blue">
            <Wallet size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              COMPRAS Y PROVEEDORES
            </span>

            <h2>Registrar pago a proveedor</h2>
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
          Registrá un abono o cancelá el saldo
          pendiente de una compra.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Cuenta por pagar</span>

              <select
                value={form.account_payable_id}
                onChange={handlePayableChange}
                required
              >
                <option value="">
                  Seleccioná una cuenta pendiente
                </option>

                {availablePayables.map(payable => (
                  <option
                    key={payable.id}
                    value={payable.id}
                  >
                    {payable.document_num ||
                      `Compra #${payable.purchase_id}`}
                    {' - '}
                    {payable.supplier}
                  </option>
                ))}
              </select>
            </label>

            {availablePayables.length === 0 && (
              <div className="purchase-form-notice wide">
                No hay cuentas pendientes de pago.
              </div>
            )}

            {selectedPayable && (
              <div className="supplier-payment-information">
                <div className="supplier-payment-provider">
                  <strong>
                    {selectedPayable.supplier}
                  </strong>

                  <small>
                    Vencimiento:{' '}
                    {selectedPayable.due_date ||
                      'No registrado'}
                  </small>
                </div>

                <div className="supplier-payment-values">
                  <div>
                    <span>Monto original</span>

                    <strong>
                      {formatMoney(
                        selectedPayable.total_amount
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Pagos realizados</span>

                    <strong>
                      {formatMoney(paidAmount)}
                    </strong>
                  </div>
                </div>

                <div className="supplier-payment-balance">
                  <span>Saldo pendiente actual</span>

                  <strong>
                    {formatMoney(balance)}
                  </strong>
                </div>
              </div>
            )}

            <label className="admin-form-field">
              <span>Monto del pago ($)</span>

              <input
                type="number"
                min="0.01"
                max={balance}
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={event =>
                  updateField(
                    'amount',
                    event.target.value
                  )
                }
                disabled={!selectedPayable}
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Fecha de registro</span>

              <input
                type="text"
                value={new Date().toLocaleDateString(
                  'es-SV',
                  {
                    timeZone: 'America/El_Salvador'
                  }
                )}
                readOnly
              />
            </label>

            <button
              type="button"
              className="supplier-payment-full"
              onClick={handleFullPayment}
              disabled={!selectedPayable}
            >
              <Wallet size={18} />
              Pagar saldo completo
            </button>
          </div>

          <section className="supplier-payment-section">
            <h3>Método de pago</h3>

            <div className="supplier-payment-methods">
              {PAYMENT_METHODS.map(method => {
                const MethodIcon = method.icon

                const isSelected =
                  form.method === method.id

                return (
                  <button
                    key={method.id}
                    type="button"
                    className={`supplier-payment-method ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() =>
                      updateField('method', method.id)
                    }
                    aria-pressed={isSelected}
                  >
                    <MethodIcon size={26} />

                    <strong>{method.label}</strong>

                    {isSelected && (
                      <span className="supplier-payment-check">
                        <Check size={13} />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <label className="admin-form-field supplier-payment-notes">
            <span>Referencia del pago (opcional)</span>

            <input
              type="text"
              maxLength={100}
              placeholder="Número de comprobante o referencia"
              value={form.reference}
              onChange={event =>
                updateField(
                  'reference',
                  event.target.value
                )
              }
            />
          </label>

          {selectedPayable &&
            form.amount !== '' &&
            !isValidAmount && (
              <p className="supplier-payment-error">
                Ingresá un monto válido, mayor a cero,
                con un máximo de dos decimales y que
                no supere el saldo pendiente.
              </p>
            )}

          {selectedPayable && isValidAmount && (
            <div className="order-summary">
              <div className="order-summary-row">
                <span>Saldo actual</span>

                <strong>
                  {formatMoney(balance)}
                </strong>
              </div>

              <div className="order-summary-row">
                <span>Monto del pago</span>

                <strong>
                  -{formatMoney(paymentAmount)}
                </strong>
              </div>

              <div className="order-summary-total">
                <span>Nuevo saldo pendiente</span>

                <strong>
                  {formatMoney(remainingBalance)}
                </strong>
              </div>

              <div
                className={`supplier-payment-result ${
                  isFullPayment ? 'complete' : 'partial'
                }`}
              >
                {isFullPayment ? (
                  <>
                    <Check size={18} />
                    La deuda quedaría pagada completamente.
                  </>
                ) : (
                  'La deuda quedaría parcialmente pagada.'
                )}
              </div>
            </div>
          )}

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
              disabled={!onSubmit || !isValid}
              title={
                !onSubmit
                  ? 'Pendiente de conexión'
                  : undefined
              }
            >
              <Check size={18} />
              Registrar pago
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default SupplierPaymentForm