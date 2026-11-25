import { useState } from 'react'
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

const BRANCHES = [
  { id: 1, name: 'Centro Histórico' },
  { id: 2, name: 'Escalón' },
  { id: 3, name: 'Santa Elena' }
]

const ROLES = {
  GERENTE: 'Gerente',
  CAJERO: 'Cajero',
  COCINERO: 'Cocina',
  BARISTA: 'Barista',
  PUPUSERA: 'Pupusería'
}

const EMPLOYEES = [
  {
    id: 1,
    full_name: 'Ana Martínez',
    email: 'ana@example.com',
    role: 'GERENTE',
    branch_id: 1,
    monthly_salary: 900,
    is_active: true
  },
  {
    id: 2,
    full_name: 'Carlos López',
    email: 'carlos@example.com',
    role: 'CAJERO',
    branch_id: 1,
    monthly_salary: 450,
    is_active: true
  },
  {
    id: 3,
    full_name: 'María Pérez',
    email: 'maria@example.com',
    role: 'COCINERO',
    branch_id: 2,
    monthly_salary: 550,
    is_active: true
  },
  {
    id: 4,
    full_name: 'José García',
    email: 'jose@example.com',
    role: 'BARISTA',
    branch_id: 3,
    monthly_salary: 450,
    is_active: true
  },
  {
    id: 5,
    full_name: 'Lucía Hernández',
    email: 'lucia@example.com',
    role: 'PUPUSERA',
    branch_id: 2,
    monthly_salary: 450,
    is_active: false
  }
]

const PAYROLLS = [
  {
    id: 1,
    employee_id: 2,
    period_start: '2026-11-01',
    period_end: '2026-11-15',
    gross_salary: 225,
    isss: 6.75,
    afp: 16.31,
    income_tax: 0,
    status: 'PAID'
  },
  {
    id: 2,
    employee_id: 3,
    period_start: '2026-11-01',
    period_end: '2026-11-15',
    gross_salary: 275,
    isss: 8.25,
    afp: 19.94,
    income_tax: 0,
    status: 'PAID'
  },
  {
    id: 3,
    employee_id: 4,
    period_start: '2026-11-01',
    period_end: '2026-11-15',
    gross_salary: 225,
    isss: 6.75,
    afp: 16.31,
    income_tax: 0,
    status: 'PENDING'
  }
]

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

const getBranchName = id =>
  BRANCHES.find(branch => branch.id === id)?.name || 'Sin sucursal'

const getEmployee = id =>
  EMPLOYEES.find(employee => employee.id === id)

function TeamPage() {
  const [activeTab, setActiveTab] = useState('employees')
  const [searchTerm, setSearchTerm] = useState('')
  const [branchFilter, setBranchFilter] = useState('ALL')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const activeEmployees = EMPLOYEES.filter(
    employee => employee.is_active
  )

  const activeBranches = new Set(
    activeEmployees.map(employee => employee.branch_id)
  ).size

  const monthlyPayroll = activeEmployees.reduce(
    (total, employee) => total + employee.monthly_salary,
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
    setSearchTerm('')
    setBranchFilter('ALL')
    setRoleFilter('ALL')
    setStatusFilter('ALL')
  }

  const filteredEmployees = EMPLOYEES.filter(employee => {
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

  const filteredPayrolls = PAYROLLS.filter(payroll => {
    const employee = getEmployee(payroll.employee_id)
    const search = searchTerm.trim().toLowerCase()

    const matchesSearch =
      employee?.full_name.toLowerCase().includes(search) ||
      payroll.period_start.includes(search) ||
      payroll.period_end.includes(search)

    const matchesBranch =
      branchFilter === 'ALL' ||
      employee?.branch_id === Number(branchFilter)

    const matchesStatus =
      statusFilter === 'ALL' ||
      payroll.status === statusFilter

    return matchesSearch && matchesBranch && matchesStatus
  })

  const totalRecords = activeTab === 'employees'
    ? filteredEmployees.length
    : filteredPayrolls.length

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
          <Link
            to="/staff/team/register"
            className="inventory-primary-button"
          >
            <Plus size={20} />
            Nuevo empleado
          </Link>
        ) : (
          <button
            type="button"
            className="inventory-primary-button"
            disabled
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
            <span>Buscar empleado</span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Buscar empleado..."
                value={searchTerm}
                onChange={event =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </label>

          <label className="inventory-field">
            <span>Sucursal</span>

            <select
              value={branchFilter}
              onChange={event =>
                setBranchFilter(event.target.value)
              }
            >
              <option value="ALL">Todas las sucursales</option>

              {BRANCHES.map(branch => (
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
                onChange={event =>
                  setRoleFilter(event.target.value)
                }
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

          <label className="inventory-field">
            <span>Estado</span>

            <select
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">Todos los estados</option>

              {activeTab === 'employees' ? (
                <>
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </>
              ) : (
                <>
                  <option value="PAID">Pagada</option>
                  <option value="PENDING">Pendiente</option>
                </>
              )}
            </select>
          </label>
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
                {filteredEmployees.map(employee => (
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
                        {ROLES[employee.role]}
                      </span>
                    </td>

                    <td>{getBranchName(employee.branch_id)}</td>

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
                          aria-label="Ver empleado"
                          disabled
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          className="team-action edit"
                          title="Editar empleado"
                          aria-label="Editar empleado"
                          disabled
                        >
                          <Pencil size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={6} className="inventory-empty">
                      No se encontraron empleados.
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
                  <th>Salario bruto</th>
                  <th>ISSS</th>
                  <th>AFP</th>
                  <th>Renta</th>
                  <th>Salario neto</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredPayrolls.map(payroll => {
                  const employee = getEmployee(payroll.employee_id)

                  const deductions =
                    payroll.isss +
                    payroll.afp +
                    payroll.income_tax

                  const netSalary =
                    payroll.gross_salary - deductions

                  return (
                    <tr key={payroll.id}>
                      <td>
                        <strong>{employee?.full_name}</strong>
                      </td>

                      <td>
                        <div className="payroll-period">
                          <span>{payroll.period_start}</span>
                          <small>al {payroll.period_end}</small>
                        </div>
                      </td>

                      <td className="team-money">
                        {formatMoney(payroll.gross_salary)}
                      </td>

                      <td>{formatMoney(payroll.isss)}</td>
                      <td>{formatMoney(payroll.afp)}</td>
                      <td>{formatMoney(payroll.income_tax)}</td>

                      <td className="payroll-net">
                        {formatMoney(netSalary)}
                      </td>

                      <td>
                        <span className={`team-status ${
                          payroll.status.toLowerCase()
                        }`}>
                          {payroll.status === 'PAID'
                            ? 'Pagada'
                            : 'Pendiente'}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="team-action view"
                          title="Ver planilla"
                          aria-label="Ver planilla"
                          disabled
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {filteredPayrolls.length === 0 && (
                  <tr>
                    <td colSpan={9} className="inventory-empty">
                      No se encontraron planillas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="inventory-panel-footer">
          Mostrando {totalRecords}{' '}
          {activeTab === 'employees' ? 'empleados' : 'registros de planilla'}
        </div>
      </section>
    </section>
  )
}

export default TeamPage