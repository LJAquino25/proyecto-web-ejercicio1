import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Wallet,
  Receipt,
  TrendingUp,
  Search,
  Eye
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/ExpensesPage.css'
import ExpenseForm from '../../components/admin/ExpenseForm'
import ExpenseDetail from '../../components/admin/ExpenseDetail'

const BRANCHES = [
  { id: 1, name: 'Centro Histórico' },
  { id: 2, name: 'Escalón' },
  { id: 3, name: 'Santa Elena' }
]

const CATEGORIES = [
  { id: 'RENT', name: 'Alquiler', color: 'blue' },
  { id: 'UTILITIES', name: 'Servicios básicos', color: 'yellow' },
  { id: 'MAINTENANCE', name: 'Mantenimiento', color: 'fuchsia' },
  { id: 'TRANSPORT', name: 'Transporte', color: 'pink' },
  { id: 'OTHER', name: 'Otros', color: 'brown' }
]

const EXPENSES = [
  {
    id: 1,
    description: 'Pago de alquiler',
    category: 'RENT',
    branch_id: 1,
    date: '2026-11-25',
    amount: 500
  },
  {
    id: 2,
    description: 'Servicio de energía',
    category: 'UTILITIES',
    branch_id: 1,
    date: '2026-11-24',
    amount: 180
  },
  {
    id: 3,
    description: 'Reparación de equipo',
    category: 'MAINTENANCE',
    branch_id: 2,
    date: '2026-11-23',
    amount: 150
  },
  {
    id: 4,
    description: 'Servicio de agua',
    category: 'UTILITIES',
    branch_id: 3,
    date: '2026-11-22',
    amount: 55
  },
  {
    id: 5,
    description: 'Traslado de insumos',
    category: 'TRANSPORT',
    branch_id: 1,
    date: '2026-11-21',
    amount: 40
  }
]

const formatMoney = value => `$${value.toFixed(2)}`

function ExpensesPage() {
  const [branchFilter, setBranchFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  const [selectedExpense, setSelectedExpense] =
  useState(null)

  const [isFormOpen, setIsFormOpen] = useState(false)

const toggleForm = () => {
  setIsFormOpen(previous => !previous)
}

  const getBranchName = id =>
    BRANCHES.find(branch => branch.id === id)?.name || 'Sin sucursal'

  const getCategory = id =>
    CATEGORIES.find(category => category.id === id)

  const filteredExpenses = EXPENSES.filter(expense => {
    const matchesBranch =
      branchFilter === 'ALL' ||
      expense.branch_id === Number(branchFilter)

    const matchesCategory =
      categoryFilter === 'ALL' ||
      expense.category === categoryFilter

    const search = searchTerm.trim().toLowerCase()

    const matchesSearch =
      expense.description.toLowerCase().includes(search) ||
      expense.date.includes(search) ||
      getBranchName(expense.branch_id).toLowerCase().includes(search)

    return matchesBranch && matchesCategory && matchesSearch
  })

  const totalExpenses = filteredExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  )

  const highestExpense = Math.max(
    0,
    ...filteredExpenses.map(expense => expense.amount)
  )

  const statistics = [
    {
      label: 'Total de gastos',
      value: formatMoney(totalExpenses),
      icon: Wallet,
      color: 'blue'
    },
    {
      label: 'Gastos registrados',
      value: filteredExpenses.length,
      icon: Receipt,
      color: 'yellow'
    },
    {
      label: 'Mayor gasto',
      value: formatMoney(highestExpense),
      icon: TrendingUp,
      color: 'pink'
    }
  ]

  const categoryTotals = CATEGORIES.map(category => {
    const amount = filteredExpenses
      .filter(expense => expense.category === category.id)
      .reduce((total, expense) => total + expense.amount, 0)

    return {
      ...category,
      amount,
      percentage: totalExpenses > 0
        ? amount / totalExpenses * 100
        : 0
    }
  }).filter(category => category.amount > 0)

  return (
    <section className="expenses-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">
            ADMINISTRACIÓN
          </span>

          <h1>Control de gastos</h1>

          <p>
            Administrá los gastos operativos del restaurante.
          </p>
        </div>

        <button
          type="button"
          className="inventory-primary-button"
          onClick={toggleForm}
        >
          <Plus size={20} />
          Nuevo gasto
        </button>
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

      <section className="expense-distribution">
        <div className="expense-distribution-heading">
          <div>
            <h2>Distribución de gastos</h2>
            <p>Resumen de gastos por categoría.</p>
          </div>

          <span className="expense-distribution-icon">
            <TrendingUp size={24} />
          </span>
        </div>

        <div className="expense-chart">
          {categoryTotals.map(category => (
            <div className="expense-chart-item" key={category.id}>
              <div className="expense-chart-label">
                <span>{category.name}</span>

                <div>
                  <strong>{formatMoney(category.amount)}</strong>
                  <small>{category.percentage.toFixed(1)}%</small>
                </div>
              </div>

              <div className="expense-chart-track">
                <div
                  className={`expense-chart-bar ${category.color}`}
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
            </div>
          ))}

          {categoryTotals.length === 0 && (
            <p className="inventory-empty">
              No hay gastos para mostrar.
            </p>
          )}
        </div>
      </section>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>Registro de gastos</h2>

          <p>
            Consultá los gastos realizados en cada sucursal.
          </p>
        </div>

        <div className="inventory-filters expenses-filters">
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

          <label className="inventory-field">
            <span>Categoría</span>

            <select
              value={categoryFilter}
              onChange={event =>
                setCategoryFilter(event.target.value)
              }
            >
              <option value="ALL">Todas las categorías</option>

              {CATEGORIES.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="inventory-field">
            <span>Buscar gasto</span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Buscar gasto..."
                value={searchTerm}
                onChange={event =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </label>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table expenses-table">
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Categoría</th>
                <th>Sucursal</th>
                <th>Fecha</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredExpenses.map(expense => {
                const category = getCategory(expense.category)

                return (
                  <tr key={expense.id}>
                    <td>
                      <strong>{expense.description}</strong>
                    </td>

                    <td>
                      <span className={`expense-category ${category?.color}`}>
                        {category?.name}
                      </span>
                    </td>

                    <td>{getBranchName(expense.branch_id)}</td>

                    <td>{expense.date}</td>

                    <td className="expense-amount">
                      {formatMoney(expense.amount)}
                    </td>

                    <td>
                      <button
                        type="button"
                        className="expense-detail-button"
                        title="Ver detalle"
                        aria-label="Ver detalle"
                        onClick={() => setSelectedExpense(expense)}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="inventory-empty">
                    No se encontraron gastos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inventory-panel-footer">
          Mostrando {filteredExpenses.length} de{' '}
          {EXPENSES.length} registros
        </div>

      </section>

      <ExpenseForm
  isOpen={isFormOpen}
  toggle={toggleForm}
/>

<ExpenseDetail
  expense={selectedExpense}
  branchName={
    selectedExpense
      ? getBranchName(selectedExpense.branch_id)
      : ''
  }
  categoryName={
    selectedExpense
      ? getCategory(selectedExpense.category)?.name
      : ''
  }
  onClose={() => setSelectedExpense(null)}
/>
    </section>
  )
}

export default ExpensesPage