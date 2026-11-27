import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { CalendarDays, ClipboardList, X } from 'lucide-react'

import '../../styles/AdminForm.css'

const getCurrentMonth = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function PayrollForm({ isOpen, toggle, branches, employees, onSubmit }) {
  const [branchId, setBranchId] = useState('')
  const [period, setPeriod] = useState(getCurrentMonth)
  const [fortnight, setFortnight] = useState('1')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const activeEmployeeCount = employees.filter(
    employee =>
      employee.is_active &&
      String(employee.branch_id) === branchId
  ).length

  useEffect(() => {
    if (isOpen) {
      setBranchId('')
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
        branchId: Number(branchId),
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
          La planilla se calcula para todos los empleados activos de la sucursal
          seleccionada. Los descuentos se determinan automáticamente según el
          salario registrado.
        </p>

        {error && <p className="team-page-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label className="admin-form-field">
            <span>Sucursal</span>
            <select
              value={branchId}
              onChange={event => setBranchId(event.target.value)}
              required
              disabled={branches.length === 0 || submitting}
            >
              <option value="">
                {branches.length ? 'Seleccionar sucursal' : 'No hay sucursales disponibles'}
              </option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            <small>
              {branchId
                ? `${activeEmployeeCount} empleados activos incluidos`
                : 'Se incluirá al personal activo de la sucursal'}
            </small>
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
              disabled={submitting || !branchId || activeEmployeeCount === 0}
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
