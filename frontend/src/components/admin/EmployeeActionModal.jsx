import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Eye, Pencil, X } from 'lucide-react'

import '../../styles/AdminForm.css'

const ROLES = ['GERENTE', 'CAJERO', 'COCINERO', 'BARISTA', 'PUPUSERA']

const ROLE_LABELS = {
  GERENTE: 'Gerente',
  CAJERO: 'Cajero',
  COCINERO: 'Cocina',
  BARISTA: 'Barista',
  PUPUSERA: 'Pupusería'
}

const formatMoney = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value) || 0)

function EmployeeActionModal({
  employee,
  branches,
  mode,
  onClose,
  onSubmit
}) {
  const [form, setForm] = useState(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (employee) {
      setForm({
        branch_id: String(employee.branch_id),
        role: employee.role,
        full_name: employee.full_name,
        email: employee.email,
        monthly_salary: String(employee.monthly_salary),
        is_active: String(employee.is_active)
      })
      setError('')
    }
  }, [employee])

  const updateField = (name, value) => {
    setForm(previous => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (!employee || !form) return

    setError('')
    setSubmitting(true)
    try {
      await onSubmit({
        id: Number(employee.id),
        branch_id: Number(form.branch_id),
        role: form.role,
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        monthly_salary: Number(form.monthly_salary),
        is_active: form.is_active === 'true'
      })
    } catch (submitError) {
      setError(
        submitError.data?.message ||
        submitError.message ||
        'No se pudo actualizar al empleado.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) onClose()
  }

  if (!employee) return null

  const isEditing = mode === 'edit'

  return (
    <Modal
      isOpen
      toggle={handleClose}
      centered
      scrollable
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon blue">
            {isEditing ? <Pencil size={26} /> : <Eye size={26} />}
          </span>
          <div>
            <span className="admin-eyebrow">PERSONAL</span>
            <h2>{isEditing ? 'Editar empleado' : 'Detalle del empleado'}</h2>
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

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            {error && <p className="team-page-error" role="alert">{error}</p>}

            {form && (
              <div className="admin-form-grid employee-edit-grid">
                <label className="admin-form-field wide">
                  <span>Nombre completo</span>
                  <input
                    value={form.full_name}
                    onChange={event => updateField('full_name', event.target.value)}
                    maxLength={100}
                    required
                    disabled={submitting}
                  />
                </label>

                <label className="admin-form-field wide">
                  <span>Correo electrónico</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={event => updateField('email', event.target.value)}
                    maxLength={150}
                    required
                    disabled={submitting}
                  />
                </label>

                <label className="admin-form-field">
                  <span>Sucursal</span>
                  <select
                    value={form.branch_id}
                    onChange={event => updateField('branch_id', event.target.value)}
                    required
                    disabled={submitting}
                  >
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </label>

                <label className="admin-form-field">
                  <span>Cargo</span>
                  <select
                    value={form.role}
                    onChange={event => updateField('role', event.target.value)}
                    required
                    disabled={submitting}
                  >
                    {ROLES.map(role => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-form-field">
                  <span>Salario mensual (USD)</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.monthly_salary}
                    onChange={event => updateField('monthly_salary', event.target.value)}
                    required
                    disabled={submitting}
                  />
                </label>

                <label className="admin-form-field">
                  <span>Estado</span>
                  <select
                    value={form.is_active}
                    onChange={event => updateField('is_active', event.target.value)}
                    required
                    disabled={submitting}
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </label>
              </div>
            )}

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
                disabled={submitting || !branches.length}
              >
                {submitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="team-detail-grid">
              <div><span>Nombre</span><strong>{employee.full_name}</strong></div>
              <div><span>Correo</span><strong>{employee.email}</strong></div>
              <div>
                <span>Cargo</span>
                <strong>{ROLE_LABELS[employee.role] || employee.role}</strong>
              </div>
              <div><span>Sucursal</span><strong>{employee.branch_name || 'Sin sucursal'}</strong></div>
              <div><span>Salario mensual</span><strong>{formatMoney(employee.monthly_salary)}</strong></div>
              <div>
                <span>Estado</span>
                <strong>{employee.is_active ? 'Activo' : 'Inactivo'}</strong>
              </div>
            </div>
            <div className="admin-form-footer">
              <button
                type="button"
                className="admin-form-cancel"
                onClick={handleClose}
              >
                Cerrar
              </button>
            </div>
          </>
        )}
      </ModalBody>
    </Modal>
  )
}

export default EmployeeActionModal
