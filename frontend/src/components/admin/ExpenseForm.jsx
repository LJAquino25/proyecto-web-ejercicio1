import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Receipt, Wallet, X, Check } from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/ExpenseForm.css'

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const createInitialForm = () => ({
  description: '',
  category: '',
  branch_id: '',
  date: getToday(),
  amount: '',
  notes: ''
})

function ExpenseForm({
  isOpen,
  toggle,
  onSubmit,
  branches = [],
  categories = []
}) {
  const [form, setForm] = useState(createInitialForm)

  const handleChange = event => {
    const { name, value } = event.target

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
    form.date !== '' &&
    form.date <= getToday() &&
    isValidAmount

  const handleClose = () => {
    setForm(createInitialForm())
    toggle()
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!onSubmit || !isValid) return

    onSubmit({
      description: form.description.trim(),
      category: form.category,
      branch_id: Number(form.branch_id),
      date: form.date,
      amount,
      notes: form.notes.trim()
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
              <span>Fecha del gasto</span>

              <input
                type="date"
                name="date"
                max={getToday()}
                value={form.date}
                onChange={handleChange}
                required
              />
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
              <span>Observaciones (opcional)</span>

              <textarea
                name="notes"
                rows={3}
                placeholder="Agregá información adicional sobre el gasto..."
                value={form.notes}
                onChange={handleChange}
              />
            </label>
          </div>

          {form.amount !== '' && !isValidAmount && (
  <p className="expense-form-error">
    Ingresá un monto mayor a cero y con un máximo
    de dos decimales.
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
              Registrar gasto
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ExpenseForm