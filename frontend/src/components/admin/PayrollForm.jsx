import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { CalendarDays, ClipboardList, X } from 'lucide-react'

import '../../styles/AdminForm.css'

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function PayrollForm({ isOpen, toggle, employees, onSubmit }) {
  const [employeeId, setEmployeeId] = useState('')
  const [period, setPeriod] = useState(getCurrentMonth)
  const [fortnight, setFortnight] = useState('1')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setEmployeeId('')
      setPeriod(getCurrentMonth())
      setFortnight('1')
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await onSubmit({
        employeeId: Number(employeeId),
        period: `${period}-01`,
        fortnight: Number(fortnight)
      })
    } catch (submitError) {
      setError(
        submitError.data?.message ||
        submitError.message ||
        'No se pudo generar la planilla.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) toggle()
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      centered
      scrollable
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon blue">
            <ClipboardList size={28} />
          </span>
          <div>
            <span className="admin-eyebrow">PERSONAL Y PLANILLA</span>
            <h2>Generar planilla</h2>
          </div>
          <button
            type="button"
            className="admin-form-close"
            onClick={handleClose}
            aria-label="Cerrar"
            disabled={submitting}
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          La planilla se calcula para un empleado y una quincena. Los descuentos
          se determinan automáticamente según el salario registrado.
        </p>

        {error && <p className="team-page-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="admin-form-field">
            <span>Empleado</span>
            <select
              value={employeeId}
              onChange={event => setEmployeeId(event.target.value)}
              required
              disabled={employees.length === 0 || submitting}
            >
              <option value="">
                {employees.length ? 'Seleccionar empleado' : 'No hay empleados registrados'}
              </option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.full_name} · {employee.branch_name}
                </option>
              ))}
            </select>
          </label>

          <div className="admin-form-grid payroll-form-grid">
            <label className="admin-form-field">
              <span>Mes de planilla</span>
              <input
                type="month"
                value={period}
                onChange={event => setPeriod(event.target.value)}
                required
                disabled={submitting}
              />
            </label>

            <label className="admin-form-field">
              <span>Quincena</span>
              <select
                value={fortnight}
                onChange={event => setFortnight(event.target.value)}
                required
                disabled={submitting}
              >
                <option value="1">Primera quincena</option>
                <option value="2">Segunda quincena</option>
              </select>
            </label>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-form-submit"
              disabled={submitting || !employees.length}
            >
              <CalendarDays size={18} />
              {submitting ? 'Generando...' : 'Generar planilla'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default PayrollForm
