import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Users,
  Store,
  Wallet,
  ClipboardList,
  Search,
  Eye,
  Pencil
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'
import '../../styles/TeamPage.css'
import { getBranches } from '../../services/catalogService'
import { getSession } from '../../services/authService'
import {
  createPayroll,
  getEmployees,
  getPayrolls,
  updateEmployee
} from '../../services/employeeService'
import PayrollForm from '../../components/admin/PayrollForm'
import EmployeeActionModal from '../../components/admin/EmployeeActionModal'
import PayrollDetailModal from '../../components/admin/PayrollDetailModal'
import EmployeeForm from '../../components/admin/EmployeeForm'

const EMPLOYEE_PAGE_SIZE = 10

const ROLES = {
  GERENTE: 'Gerente',
  CAJERO: 'Cajero',
  COCINERO: 'Cocina',
  BARISTA: 'Barista',
  PUPUSERA: 'Pupusería'
}

const AVATAR_COLORS = ['pink', 'yellow', 'blue']

const formatMoney = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)

const getInitials = name =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase()

const getPeriodLabel = value => {
  const dateValue = String(value || '').slice(0, 10)
  const date = new Date(`${dateValue}T00:00:00Z`)

  return Number.isNaN(date.getTime())
    ? dateValue || '—'
    : new Intl.DateTimeFormat('es-SV', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(date)
}

function TeamPage() {
  const canViewPayroll = String(getSession()?.role || '').toUpperCase() === 'GERENTE'
  const [branches, setBranches] = useState([])
  const [employees, setEmployees] = useState([])
  const [payrolls, setPayrolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [activeTab, setActiveTab] = useState('employees')
  const [searchTerm, setSearchTerm] = useState('')
  const [branchFilter, setBranchFilter] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [employeePage, setEmployeePage] = useState(1)
  const [isPayrollFormOpen, setIsPayrollFormOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [employeeAction, setEmployeeAction] = useState(null)
  const [selectedPayroll, setSelectedPayroll] = useState(null)

  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false)
  const toggleEmployeeForm = () => {
  setIsEmployeeFormOpen(previous => !previous)
}

const togglePayrollForm = () => {
  setIsPayrollFormOpen(previous => !previous)
}

  const loadData = useCallback(async () => {
    if (!canViewPayroll) {
      setLoading(false)
      return
    }

    setLoadError('')
    try {
      const [branchData, employeeData, payrollData] = await Promise.all([
        getBranches(),
        getEmployees(),
        canViewPayroll ? getPayrolls() : Promise.resolve([])
      ])
      setBranches(branchData)
      setEmployees(employeeData)
      setPayrolls(payrollData)
      setEmployeePage(1)
    } catch (error) {
      setLoadError(error.message || 'No se pudieron cargar los datos de personal y planilla.')
    } finally {
      setLoading(false)
    }
  }, [canViewPayroll])

  useEffect(() => {
    loadData()
  }, [loadData])

  if (!canViewPayroll) {
    return (
      <section className="team-page">
        <p className="team-page-error" role="alert">
          Solo gerencia puede consultar la información de personal y planilla.
        </p>
      </section>
    )
  }

  const activeEmployees = employees.filter(
    employee => employee.is_active
  )

  const activeBranches = new Set(
    activeEmployees.map(employee => employee.branch_id)
  ).size

  const monthlyPayroll = activeEmployees.reduce(
    (total, employee) => total + Number(employee.monthly_salary || 0),
    0
  )

  const statistics = [
    {
      label: 'Empleados activos',
      value: activeEmployees.length,
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Sucursales con personal activo',
      value: activeBranches,
      icon: Store,
      color: 'yellow'
    },
    {
      label: 'Salarios mensuales',
      value: formatMoney(monthlyPayroll),
      icon: Wallet,
      color: 'pink'
    }
  ]

  const changeTab = tab => {
    setActiveTab(tab)
    setSelectedPayroll(null)
    setSuccessMessage('')
    setSearchTerm('')
    setBranchFilter('ALL')
    setRoleFilter('ALL')
    setStatusFilter('ALL')
    setEmployeePage(1)
  }

  const handlePayrollSubmit = async payroll => {
    await createPayroll(payroll)
    setIsPayrollFormOpen(false)
    setSuccessMessage('La planilla se generó correctamente.')
    await loadData()
  }

  const handleEmployeeUpdate = async employee => {
    await updateEmployee(employee)
    setEmployeeAction(null)
    setSelectedEmployee(null)
    setSuccessMessage('Los datos del empleado se actualizaron correctamente.')
    await loadData()
  }

  const filteredEmployees = employees.filter(employee => {
    const search = searchTerm.trim().toLowerCase()

    const matchesSearch =
      employee.full_name.toLowerCase().includes(search) ||
      employee.email.toLowerCase().includes(search)

    const matchesBranch =
      branchFilter === 'ALL' ||
      employee.branch_id === Number(branchFilter)

    const matchesRole =
      roleFilter === 'ALL' ||
      employee.role === roleFilter

    const matchesStatus =
      statusFilter === 'ALL' ||
      employee.is_active === (statusFilter === 'ACTIVE')

    return (
      matchesSearch &&
      matchesBranch &&
      matchesRole &&
      matchesStatus
    )
  })

  const filteredPayrolls = payrolls.filter(payroll => {
    const search = searchTerm.trim().toLowerCase()
    const period = String(payroll.period || '').slice(0, 10)

    const matchesSearch =
      String(payroll.employee_name || '').toLowerCase().includes(search) ||
      period.includes(search)

    const matchesBranch =
      branchFilter === 'ALL' ||
      Number(payroll.branch_id) === Number(branchFilter)

    return matchesSearch && matchesBranch
  })

  const totalEmployeePages = Math.max(
    1,
    Math.ceil(filteredEmployees.length / EMPLOYEE_PAGE_SIZE)
  )
  const currentEmployeePage = Math.min(employeePage, totalEmployeePages)
  const visibleEmployees = filteredEmployees.slice(
    (currentEmployeePage - 1) * EMPLOYEE_PAGE_SIZE,
    currentEmployeePage * EMPLOYEE_PAGE_SIZE
  )

  return (
    <section className="team-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">
            ADMINISTRACIÓN
          </span>

          <h1>Personal y planilla</h1>

          <p>
            Administrá el personal y los pagos salariales del restaurante.
          </p>
        </div>

        {activeTab === 'employees' ? (
  <button
    type="button"
    className="inventory-primary-button"
    onClick={toggleEmployeeForm}
  >
    <Plus size={20} />
    Nuevo empleado
  </button>
) : (
  <button
    type="button"
    className="inventory-primary-button"
    onClick={togglePayrollForm}
  >
    <Plus size={20} />
    Generar planilla
  </button>
)}
      </div>

      <div className="inventory-stats">
        {statistics.map(stat => {
          const StatIcon = stat.icon

          return (
            <article
              className="inventory-stat-card"
              key={stat.label}
            >
              <span className={`inventory-stat-icon ${stat.color}`}>
                <StatIcon size={24} />
              </span>

              <div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      {loadError && <p className="team-page-error" role="alert">{loadError}</p>}
      {successMessage && (
        <p className="team-page-success" role="status">{successMessage}</p>
      )}

      <div className="sales-tabs team-tabs">
        <button
          type="button"
          className={`sales-tab ${
            activeTab === 'employees' ? 'active' : ''
          }`}
          onClick={() => changeTab('employees')}
        >
          <Users size={19} />
          Empleados
        </button>

        {canViewPayroll && (
          <button
            type="button"
            className={`sales-tab ${
              activeTab === 'payroll' ? 'active' : ''
            }`}
            onClick={() => changeTab('payroll')}
          >
            <ClipboardList size={19} />
            Planillas
          </button>
        )}
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>
            {activeTab === 'employees'
              ? 'Registro de empleados'
              : 'Historial de planillas'}
          </h2>

          <p>
            {activeTab === 'employees'
              ? 'Consultá la información del personal de cada sucursal.'
              : 'Consultá los salarios y descuentos de cada quincena.'}
          </p>
        </div>

        <div className={`inventory-filters team-filters ${activeTab}`}>
          <label className="inventory-field">
            <span>{activeTab === 'employees' ? 'Buscar empleado' : 'Buscar empleado o período'}</span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder={activeTab === 'employees' ? 'Buscar empleado...' : 'Nombre o fecha...'}
                value={searchTerm}
                onChange={event => {
                  setSearchTerm(event.target.value)
                  setEmployeePage(1)
                }}
              />
            </div>
          </label>

          <label className="inventory-field">
            <span>Sucursal</span>

            <select
              value={branchFilter}
              onChange={event => {
                setBranchFilter(event.target.value)
                setEmployeePage(1)
              }}
              disabled={loading}
            >
              <option value="ALL">Todas las sucursales</option>

              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          {activeTab === 'employees' && (
            <label className="inventory-field">
              <span>Cargo</span>

              <select
                value={roleFilter}
                onChange={event => {
                  setRoleFilter(event.target.value)
                  setEmployeePage(1)
                }}
              >
                <option value="ALL">Todos los cargos</option>

                {Object.entries(ROLES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {activeTab === 'employees' && (
            <label className="inventory-field">
              <span>Estado</span>
              <select
                value={statusFilter}
                onChange={event => {
                  setStatusFilter(event.target.value)
                  setEmployeePage(1)
                }}
              >
                <option value="ALL">Todos los estados</option>
                <option value="ACTIVE">Activo</option>
                <option value="INACTIVE">Inactivo</option>
              </select>
            </label>
          )}
        </div>

        <div className="inventory-table-wrapper">
          {activeTab === 'employees' ? (
            <table className="inventory-table team-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Cargo</th>
                  <th>Sucursal</th>
                  <th>Salario mensual</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {visibleEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>
                      <div className="team-employee">
                        <span
                          className={`team-avatar ${
                            AVATAR_COLORS[
                              (employee.id - 1) % AVATAR_COLORS.length
                            ]
                          }`}
                        >
                          {getInitials(employee.full_name)}
                        </span>

                        <div className="team-employee-info">
                          <strong>{employee.full_name}</strong>
                          <small>{employee.email}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="team-role">
                        {ROLES[employee.role] || employee.role}
                      </span>
                    </td>

                    <td>{employee.branch_name || 'Sin sucursal'}</td>

                    <td className="team-money">
                      {formatMoney(employee.monthly_salary)}
                    </td>

                    <td>
                      <span className={`team-status ${
                        employee.is_active ? 'active' : 'inactive'
                      }`}>
                        {employee.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>

                    <td>
                      <div className="team-actions">
                        <button
                          type="button"
                          className="team-action view"
                          title="Ver empleado"
                          aria-label={`Ver empleado ${employee.full_name}`}
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setEmployeeAction('view')
                          }}
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          className="team-action edit"
                          title="Editar empleado"
                          aria-label={`Editar empleado ${employee.full_name}`}
                          onClick={() => {
                            setSelectedEmployee(employee)
                            setEmployeeAction('edit')
                          }}
                        >
                          <Pencil size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="inventory-empty">
                      No se encontraron empleados.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="inventory-empty">
                      Cargando empleados...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="inventory-table payroll-table">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Período</th>
                  <th>Salario base</th>
                  <th>ISSS</th>
                  <th>AFP</th>
                  <th>Renta</th>
                  <th>Salario neto</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayrolls.map(payroll => (
                    <tr key={payroll.id}>
                      <td>
                        <strong>{payroll.employee_name}</strong>
                      </td>

                      <td>
                        <div className="payroll-period">
                          <span>{getPeriodLabel(payroll.period)}</span>
                          <small>
                            {Number(payroll.fortnight) === 1
                              ? 'Primera quincena'
                              : 'Segunda quincena'}
                          </small>
                        </div>
                      </td>

                      <td className="team-money">
                        {formatMoney(payroll.base_salary)}
                      </td>

                      <td>{formatMoney(payroll.isss)}</td>
                      <td>{formatMoney(payroll.afp)}</td>
                      <td>{formatMoney(payroll.isr)}</td>

                      <td className="payroll-net">
                        {formatMoney(payroll.net_salary)}
                      </td>

                      <td>
                        <span className="team-status generated">Generada</span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="team-action view"
                          title="Ver planilla"
                          aria-label={`Ver planilla de ${payroll.employee_name}`}
                          onClick={() => setSelectedPayroll(payroll)}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                ))}

                {!loading && filteredPayrolls.length === 0 && (
                  <tr>
                    <td colSpan={9} className="inventory-empty">
                      No se encontraron planillas.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={9} className="inventory-empty">
                      Cargando planillas...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {activeTab === 'employees' && (
          <nav className="team-pagination" aria-label="Paginación de empleados">
            <span>
              {filteredEmployees.length === 0
                ? 'Sin resultados'
                : `Mostrando ${(currentEmployeePage - 1) * EMPLOYEE_PAGE_SIZE + 1}–${Math.min(
                    currentEmployeePage * EMPLOYEE_PAGE_SIZE,
                    filteredEmployees.length
                  )} de ${filteredEmployees.length} empleados`}
            </span>
            <div className="team-pagination-controls">
              <button
                type="button"
                onClick={() => setEmployeePage(page => Math.max(1, page - 1))}
                disabled={loading || currentEmployeePage <= 1}
              >
                Anterior
              </button>
              <span>Página {currentEmployeePage} de {totalEmployeePages}</span>
              <button
                type="button"
                onClick={() => setEmployeePage(page => Math.min(totalEmployeePages, page + 1))}
                disabled={loading || currentEmployeePage >= totalEmployeePages}
              >
                Siguiente
              </button>
            </div>
          </nav>
        )}

        <div className="inventory-panel-footer">
          {activeTab === 'employees'
            ? `${filteredEmployees.length} empleados`
            : `${filteredPayrolls.length} registros de planilla`}
        </div>
      </section>

      <PayrollForm
        isOpen={isPayrollFormOpen}
        toggle={() => setIsPayrollFormOpen(false)}
        employees={employees}
        onSubmit={handlePayrollSubmit}
      />
      {selectedEmployee && (
        <EmployeeActionModal
          employee={selectedEmployee}
          branches={branches}
          mode={employeeAction}
          onClose={() => {
            setSelectedEmployee(null)
            setEmployeeAction(null)
          }}
          onSubmit={handleEmployeeUpdate}
        />
      )}
      <PayrollDetailModal
        payroll={selectedPayroll}
        onClose={() => setSelectedPayroll(null)}
      />

      <EmployeeForm
  isOpen={isEmployeeFormOpen}
  toggle={toggleEmployeeForm}
  onRegistered={loadData}
/>
    </section>
  )
}

export default TeamPage