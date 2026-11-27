import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  UserRoundPlus,
  UserRound,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Check,
  X
} from 'lucide-react'

import { getBranches } from '../../services/catalogService'
import { registerEmployee } from '../../services/employeeService'

import '../../styles/AdminForm.css'
import '../../styles/EmployeeForm.css'

const ROLES = [
  { id: 'GERENTE', name: 'Gerente' },
  { id: 'CAJERO', name: 'Cajero' },
  { id: 'COCINERO', name: 'Cocinero' },
  { id: 'BARISTA', name: 'Barista' },
  { id: 'PUPUSERA', name: 'Pupusera' }
]

const INITIAL_FORM = {
  branch_id: '',
  role: '',
  full_name: '',
  email: '',
  password: '',
  monthly_salary: '',
  is_active: 'true'
}

function EmployeeForm({ isOpen, toggle, onRegistered }) {
  const [branches, setBranches] = useState([])
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [branchError, setBranchError] = useState('')
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errorMsg, setErrorMsg] = useState('')
  const [registeredEmployee, setRegisteredEmployee] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    setBranchesLoading(true)
    setBranchError('')

    getBranches()
      .then(setBranches)
      .catch(error => {
        setBranchError(
          error.message ||
          'No se pudieron cargar las sucursales.'
        )
      })
      .finally(() => setBranchesLoading(false))
  }, [isOpen])

  const handleChange = event => {
    const { name, value } = event.target

    setFormData(previous => ({
      ...previous,
      [name]: value
    }))

    setErrorMsg('')
    setRegisteredEmployee(null)
  }

  const toggleActive = () => {
    setFormData(previous => ({
      ...previous,
      is_active:
        previous.is_active === 'true'
          ? 'false'
          : 'true'
    }))

    setErrorMsg('')
    setRegisteredEmployee(null)
  }

  const handleClose = () => {
    if (submitting) return

    setFormData(INITIAL_FORM)
    setErrorMsg('')
    setRegisteredEmployee(null)
    setShowPassword(false)

    toggle()
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (submitting || branchesLoading || branchError) return

    setErrorMsg('')
    setRegisteredEmployee(null)
    setSubmitting(true)

    try {
      const response = await registerEmployee({
        ...formData,
        branch_id: Number(formData.branch_id),
        monthly_salary: Number(formData.monthly_salary),
        is_active: formData.is_active === 'true'
      })

      setRegisteredEmployee(response.employee)
      setFormData(INITIAL_FORM)
      setShowPassword(false)
    } catch (error) {
      setErrorMsg(
        error.data?.error ||
        error.data?.message ||
        error.message ||
        'No se pudo registrar al empleado.'
      )

      setSubmitting(false)
      return
    }

    setSubmitting(false)

    if (onRegistered) {
      onRegistered()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      centered
      scrollable
      size="lg"
      backdrop={submitting ? 'static' : true}
      keyboard={!submitting}
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon pink">
            <UserRoundPlus size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              PERSONAL Y PLANILLA
            </span>

            <h2>Nuevo empleado</h2>
          </div>

          <button
            type="button"
            className="admin-form-close"
            onClick={handleClose}
            disabled={submitting}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          Registrá un nuevo integrante del equipo
          de Orígenes SV.
        </p>

        {errorMsg && (
          <div
            className="employee-form-message error"
            role="alert"
          >
            {errorMsg}
          </div>
        )}

        {branchError && (
          <div
            className="employee-form-message error"
            role="alert"
          >
            {branchError}
          </div>
        )}

        {registeredEmployee && (
          <div
            className="employee-form-message success"
            role="status"
          >
            <CheckCircle2 size={24} />

            <div>
              <strong>Empleado registrado correctamente</strong>

              <p>
                {registeredEmployee.full_name}
                {' '} (ID {registeredEmployee.id})
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="employee-registration-section">
            <div className="employee-section-heading">
              <span className="employee-section-icon blue">
                <UserRound size={20} />
              </span>

              <h3>Información personal</h3>
            </div>

            <div className="admin-form-grid">
              <label className="admin-form-field wide">
                <span>Nombre completo *</span>

                <input
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Ej. Sofía Hernández"
                  maxLength={100}
                  required
                />
              </label>

              <label className="admin-form-field wide">
                <span>Correo electrónico *</span>

                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nombre@origenes.com"
                  maxLength={150}
                  required
                />
              </label>

              <div className="admin-form-field wide">
                <label htmlFor="employee-password">
                  Contraseña inicial *
                </label>

                <div className="employee-password-field">
                  <input
                    id="employee-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />

                  <button
                    type="button"
                    className="employee-password-toggle"
                    onClick={() =>
                      setShowPassword(previous => !previous)
                    }
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} />
                    ) : (
                      <Eye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="employee-registration-section">
            <div className="employee-section-heading">
              <span className="employee-section-icon yellow">
                <BriefcaseBusiness size={20} />
              </span>

              <h3>Información laboral</h3>
            </div>

            <div className="admin-form-grid">
              <label className="admin-form-field">
                <span>Sucursal *</span>

                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  disabled={
                    branchesLoading ||
                    branches.length === 0
                  }
                  required
                >
                  <option value="">
                    {branchesLoading
                      ? 'Cargando sucursales...'
                      : 'Seleccioná una sucursal'}
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
                <span>Cargo *</span>

                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Seleccioná un cargo
                  </option>

                  {ROLES.map(role => (
                    <option
                      key={role.id}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-form-field wide">
                <span>Salario mensual ($) *</span>

                <input
                  name="monthly_salary"
                  type="number"
                  inputMode="decimal"
                  min="0.01"
                  step="0.01"
                  value={formData.monthly_salary}
                  onChange={handleChange}
                  placeholder="Ej. 450.00"
                  required
                />
              </label>

              <div className="employee-active-panel">
                <div>
                  <strong>Empleado activo</strong>

                  <p>
                    {formData.is_active === 'true'
                      ? 'El empleado se registrará como activo.'
                      : 'El empleado se registrará como inactivo.'}
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-label="Empleado activo"
                  aria-checked={formData.is_active === 'true'}
                  className={`employee-active-switch ${
                    formData.is_active === 'true'
                      ? 'active'
                      : ''
                  }`}
                  onClick={toggleActive}
                >
                  <span />
                </button>
              </div>
            </div>
          </section>

          <div className="employee-permission-notice">
            <ShieldCheck size={21} />

            <span>
              El registro requiere permisos de gerente.
            </span>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={handleClose}
              disabled={submitting}
            >
              {registeredEmployee ? 'Cerrar' : 'Cancelar'}
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={
                submitting ||
                branchesLoading ||
                branches.length === 0 ||
                Boolean(branchError)
              }
            >
              <Check size={18} />

              {submitting
                ? 'Registrando...'
                : 'Registrar empleado'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default EmployeeForm