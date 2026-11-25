import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  Lock,
  LockOpen,
  X,
  Check,
  Store,
  UserRound,
  CheckCircle2,
  TriangleAlert
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/CashRegisterForm.css'

function CashRegisterForm({
  isOpen,
  toggle,
  mode,
  branchId,
  branchName,
  currentRegister,
  onSubmit
}) {
  const [amount, setAmount] = useState('')
  const [notes, setNotes] = useState('')

  const isClosing = mode === 'close'

  const openingAmount = currentRegister?.opening_amount || 0
  const cashIncome = currentRegister?.cash || 0
  const expectedCash = openingAmount + cashIncome

  const difference = Math.round(
    (Number(amount) - expectedCash) * 100
  ) / 100

  const hasAmount = amount !== '' && Number(amount) >= 0

  const differenceStatus =
    difference === 0
      ? 'balanced'
      : difference < 0
        ? 'shortage'
        : 'surplus'

  const differenceMessage =
    difference === 0
      ? 'La caja está cuadrada.'
      : difference < 0
        ? 'Existe un faltante de efectivo.'
        : 'Existe un sobrante de efectivo.'

  const handleClose = () => {
    setAmount('')
    setNotes('')
    toggle()
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!onSubmit || !hasAmount) return

    if (isClosing) {
      onSubmit({
        cash_register_id: currentRegister.id,
        closing_amount: Number(amount),
        notes
      })
    } else {
      onSubmit({
        branch_id: Number(branchId),
        opening_amount: Number(amount)
      })
    }
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
          <span className={`admin-form-icon ${isClosing ? 'pink' : ''}`}>
            {isClosing
              ? <Lock size={28} />
              : <LockOpen size={28} />}
          </span>

          <div>
            <span className="admin-eyebrow">
              CONTROL DE CAJA
            </span>

            <h2>
              {isClosing ? 'Cerrar caja' : 'Abrir caja'}
            </h2>
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
          {isClosing
            ? 'Ingresá el dinero contado al finalizar las operaciones.'
            : 'Ingresá el monto inicial de efectivo para comenzar las operaciones.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="cash-form-information">
            <div className="cash-form-information-row">
              <Store size={20} />

              <span>Sucursal</span>

              <strong>{branchName}</strong>
            </div>

            <div className="cash-form-information-row">
              <UserRound size={20} />

              <span>Empleado</span>

              <strong>Usuario en sesión</strong>
            </div>
          </div>

          {isClosing && (
            <div className="cash-form-expected">
              <div className="cash-form-summary-row">
                <span>Monto de apertura</span>
                <strong>${openingAmount.toFixed(2)}</strong>
              </div>

              <div className="cash-form-summary-row">
                <span>Ventas en efectivo</span>
                <strong>${cashIncome.toFixed(2)}</strong>
              </div>

              <div className="cash-form-summary-total">
                <span>Efectivo esperado en caja</span>
                <strong>${expectedCash.toFixed(2)}</strong>
              </div>
            </div>
          )}

          <label className="admin-form-field cash-form-amount">
            <span>
              {isClosing
                ? 'Efectivo contado ($)'
                : 'Monto inicial de efectivo ($)'}
            </span>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={event => setAmount(event.target.value)}
              required
            />

            <small>
              {isClosing
                ? 'Ingresá la cantidad de dinero físico que hay en caja.'
                : 'Dinero disponible antes de iniciar las ventas.'}
            </small>
          </label>

          {!isClosing && (
            <div className="cash-form-opening">
              <span>Monto de apertura</span>

              <strong>
                ${Math.max(0, Number(amount) || 0).toFixed(2)}
              </strong>
            </div>
          )}

          {isClosing && (
            <>
              {hasAmount && (
                <div className={`cash-form-difference ${differenceStatus}`}>
                  <div className="cash-form-summary-row">
                    <span>Diferencia de caja</span>

                    <strong>
                      {difference < 0
                        ? '-'
                        : difference > 0
                          ? '+'
                          : ''}
                      ${Math.abs(difference).toFixed(2)}
                    </strong>
                  </div>

                  <div className="cash-form-difference-message">
                    {difference === 0
                      ? <CheckCircle2 size={20} />
                      : <TriangleAlert size={20} />}

                    <span>{differenceMessage}</span>
                  </div>
                </div>
              )}

              <label className="admin-form-field cash-form-notes">
                <span>Observaciones</span>

                <textarea
                  rows={3}
                  placeholder="Escribí alguna observación sobre el cierre..."
                  value={notes}
                  onChange={event => setNotes(event.target.value)}
                />
              </label>
            </>
          )}

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
              disabled={
                !onSubmit ||
                !hasAmount ||
                (isClosing && !currentRegister)
              }
              title={!onSubmit ? 'Pendiente de conexión' : undefined}
            >
              <Check size={18} />

              {isClosing
                ? 'Confirmar cierre'
                : 'Confirmar apertura'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default CashRegisterForm