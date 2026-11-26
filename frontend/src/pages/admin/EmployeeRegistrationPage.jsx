import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, UserRoundPlus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getBranches } from '../../services/catalogService'
import { registerEmployee } from '../../services/employeeService'

const ROLES = ['GERENTE', 'CAJERO', 'COCINERO', 'BARISTA', 'PUPUSERA']

const INITIAL_FORM = {
  branch_id: '',
  role: '',
  full_name: '',
  email: '',
  password: '',
  monthly_salary: '',
  is_active: 'true',
}

function EmployeeRegistrationPage() {
  const [branches, setBranches] = useState([])
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [branchError, setBranchError] = useState('')
  const [formData, setFormData] = useState(INITIAL_FORM)
  const [errorMsg, setErrorMsg] = useState('')
  const [registeredEmployee, setRegisteredEmployee] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getBranches()
      .then(setBranches)
      .catch((error) => {
        setBranchError(error.message || 'No se pudieron cargar las sucursales.')
      })
      .finally(() => setBranchesLoading(false))
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((previous) => ({ ...previous, [name]: value }))
    setErrorMsg('')
    setRegisteredEmployee(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrorMsg('')
    setRegisteredEmployee(null)
    setSubmitting(true)

    try {
      const response = await registerEmployee({
        ...formData,
        branch_id: Number(formData.branch_id),
        monthly_salary: Number(formData.monthly_salary),
        is_active: formData.is_active === 'true',
      })

      setRegisteredEmployee(response.employee)
      setFormData(INITIAL_FORM)
    } catch (error) {
      setErrorMsg(
        error.data?.error ||
        error.data?.message ||
        error.message ||
        'No se pudo registrar al empleado.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="employee-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="employee-page-heading">
        <span className="admin-eyebrow">PERSONAL Y PLANILLA</span>
        <h1>Registrar empleado</h1>
        <p>Completa los datos para crear una cuenta de acceso al equipo.</p>
      </div>

      {errorMsg && <div className="employee-alert error" role="alert">{errorMsg}</div>}
      {branchError && <div className="employee-alert error" role="alert">{branchError}</div>}

      {registeredEmployee && (
        <div className="employee-alert success" role="status">
          <CheckCircle2 size={20} />
          <span>
            Empleado registrado: <strong>{registeredEmployee.full_name}</strong>
            {' '} (ID {registeredEmployee.id}).
          </span>
        </div>
      )}

      <form className="employee-form" onSubmit={handleSubmit}>
        <div className="employee-form-intro">
          <span className="employee-form-icon"><UserRoundPlus size={22} /></span>
          <div>
            <h2>Información del empleado</h2>
            <p>Los campos marcados con * son obligatorios.</p>
          </div>
        </div>

        <div className="employee-form-grid">
          <label className="employee-field employee-field-wide">
            <span>Nombre completo *</span>
            <input
              name="full_name"
              type="text"
              autoComplete="name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Ej. Sofía Hernández"
              required
              maxLength={100}
            />
          </label>

          <label className="employee-field">
            <span>Correo electrónico *</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nombre@origenes.com"
              required
              maxLength={150}
            />
          </label>

          <label className="employee-field">
            <span>Contraseña inicial *</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              minLength={6}
            />
          </label>

          <label className="employee-field">
            <span>Sucursal *</span>
            <select
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              disabled={branchesLoading || branches.length === 0}
              required
            >
              <option value="">
                {branchesLoading ? 'Cargando sucursales...' : 'Selecciona una sucursal'}
              </option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </label>

          <label className="employee-field">
            <span>Rol *</span>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un rol</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </label>

          <label className="employee-field">
            <span>Salario mensual (USD) *</span>
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

          <label className="employee-field">
            <span>Estado *</span>
            <select
              name="is_active"
              value={formData.is_active}
              onChange={handleChange}
              required
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </label>
        </div>

        <div className="employee-form-footer">
          <span>El registro requiere permisos de gerente.</span>
          <button
            type="submit"
            className="employee-submit"
            disabled={submitting || branchesLoading || branches.length === 0}
          >
            {submitting ? 'Registrando...' : 'Registrar empleado'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default EmployeeRegistrationPage
