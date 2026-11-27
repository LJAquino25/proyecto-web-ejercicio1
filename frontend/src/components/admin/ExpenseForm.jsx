import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Receipt, Wallet, X, Check } from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/ExpenseForm.css'

const createInitialForm = () => ({
  description: '',
  category: '',
  branch_id: '',
  amount: '',
  reference: ''
})

function ExpenseForm({
  isOpen,
  toggle,
  onSubmit,
  branches = [],
  categories = [],
  isSubmitting = false
}) {
  const [form, setForm] = useState(createInitialForm)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setForm(createInitialForm())
      setSubmitError('')
    }
  }, [isOpen])

  const handleChange = event => {
    const { name, value } = event.target

    if (name === 'reference' && value.length > 40) return

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const amount = Number(form.amount)

const isValidAmount =
  Number.isFinite(amount) &&
  amount > 0 &&
  Math.abs(
    amount * 100 - Math.round(amount * 100)
  ) < 0.000001

  const isValid =
    form.description.trim() !== '' &&
    form.category !== '' &&
    form.branch_id !== '' &&
    isValidAmount

  const handleClose = () => {
    if (isSubmitting) return
    setForm(createInitialForm())
    setSubmitError('')
    toggle()
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!onSubmit || !isValid || isSubmitting) return

    setSubmitError('')

    try {
      await onSubmit({
        description: form.description.trim(),
        category: form.category,
        branch_id: Number(form.branch_id),
        amount,
        reference: form.reference.trim()
      })
      setForm(createInitialForm())
      toggle()
    } catch (error) {
      setSubmitError(error.message || 'No se pudo registrar el gasto.')
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
          <span className="admin-form-icon">
            <Receipt size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              ADMINISTRACIÓN
            </span>

            <h2>Nuevo gasto</h2>
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
          Registrá los gastos operativos y administrativos
          de cada sucursal.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Concepto del gasto</span>

              <input
                type="text"
                name="description"
                placeholder="Ej. Pago de energía eléctrica"
                value={form.description}
                onChange={handleChange}
                maxLength={120}
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Categoría</span>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">
                  Seleccioná una categoría
                </option>

                {categories.map(category => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form-field">
              <span>Sucursal</span>

              <select
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                required
              >
                <option value="">
                  Seleccioná una sucursal
                </option>

                {branches.map(branch => (
  <option
    key={branch.id}
    value={branch.id}
  >
    {branch.name}
  </option>
))}
              </select>
            </label>

            <label className="admin-form-field">
              <span>Monto ($)</span>

              <input
                type="number"
                name="amount"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={handleChange}
                required
              />
            </label>

            <label className="admin-form-field wide">
              <span>Referencia (opcional)</span>

              <input
                type="text"
                name="reference"
                placeholder="Ej. Número de recibo"
                value={form.reference}
                onChange={handleChange}
              />
            </label>
          </div>

          <p className="expense-form-note">
            La fecha del gasto será la fecha en que se registre.
          </p>

          {form.amount !== '' && !isValidAmount && (
            <p className="expense-form-error">
              Ingresá un monto mayor a cero y con un máximo
              de dos decimales.
            </p>
          )}

          {submitError && (
            <p className="expense-form-error" role="alert">
              {submitError}
            </p>
          )}

          <div className="expense-form-summary">
            <div className="expense-form-total">
              <div className="expense-form-total-label">
                <Wallet size={25} />
                <span>Total del gasto</span>
              </div>

              <strong>
                ${isValidAmount ? amount.toFixed(2) : '0.00'}
              </strong>
            </div>

            <p>
              Este monto se incorporará al registro de
              gastos de la sucursal.
            </p>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={!onSubmit || !isValid || isSubmitting}
              title={
                !onSubmit
                  ? 'Pendiente de conexión'
                  : undefined
              }
            >
              <Check size={18} />
              {isSubmitting ? 'Registrando...' : 'Registrar gasto'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ExpenseForm