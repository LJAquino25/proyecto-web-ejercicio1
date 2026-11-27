import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Wallet,
  Receipt,
  TrendingUp,
  Search,
  Eye,
  Calculator
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/ExpensesPage.css'
import ExpenseForm from '../../components/admin/ExpenseForm'
import ExpenseDetail from '../../components/admin/ExpenseDetail'
import { getBranches } from '../../services/catalogService'
import { createExpense, getExpenses } from '../../services/purchasesService'

const CATEGORIES = [
  { id: 'RENT', name: 'Alquiler', color: 'blue' },
  { id: 'BASIC_SERVICES', name: 'Servicios básicos', color: 'yellow' },
  { id: 'NET_SALARY', name: 'Salario neto', color: 'pink' }
]

const formatMoney = value => `$${Number(value).toFixed(2)}`

const toDateKey = value => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDate = value => {
  if (!value) return 'No registrada'
  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

const getCategory = id =>
  CATEGORIES.find(category => category.id === id) || {
    id,
    name: id || 'Sin categoría',
    color: 'brown'
  }

const createRecentMonths = () => {
  const now = new Date()

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    return {
      key,
      label: new Intl.DateTimeFormat('es-SV', { month: 'short' })
        .format(date)
        .replace('.', '')
    }
  })
}

function ExpensesPage() {
  const [branchFilter, setBranchFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [branches, setBranches] = useState([])
  const [expenses, setExpenses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [branchError, setBranchError] = useState('')
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const loadExpenses = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const records = await getExpenses()
      setExpenses(records.map(expense => ({
        ...expense,
        branch_id: Number(expense.branch_id),
        amount: Number(expense.amount),
        date: toDateKey(expense.created_at)
      })))
    } catch (error) {
      setExpenses([])
      setLoadError(error.message || 'No se pudieron cargar los gastos.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true

    getBranches()
      .then(data => {
        if (active) setBranches(data)
      })
      .catch(error => {
        if (active) {
          setBranchError(
            error.message || 'No se pudieron cargar las sucursales.'
          )
        }
      })
      .finally(() => {
        if (active) setIsLoadingBranches(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    loadExpenses()
  }, [loadExpenses])

  const filteredExpenses = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return expenses.filter(expense => {
      const branchName = (
        branches.find(branch =>
          String(branch.id) === String(expense.branch_id)
        )?.name || 'Sucursal no encontrada'
      ).toLowerCase()
      const categoryName = getCategory(expense.category).name.toLowerCase()
      const matchesBranch =
        branchFilter === 'ALL' ||
        String(expense.branch_id) === branchFilter
      const matchesCategory =
        categoryFilter === 'ALL' ||
        expense.category === categoryFilter
      const matchesSearch =
        expense.description.toLowerCase().includes(search) ||
        expense.date.includes(search) ||
        branchName.includes(search) ||
        categoryName.includes(search)
      const matchesFromDate =
        !fromDate || (expense.date && expense.date >= fromDate)
      const matchesToDate =
        !toDate || (expense.date && expense.date <= toDate)

      return (
        matchesBranch &&
        matchesCategory &&
        matchesSearch &&
        matchesFromDate &&
        matchesToDate
      )
    })
  }, [
    expenses,
    branches,
    branchFilter,
    categoryFilter,
    searchTerm,
    fromDate,
    toDate
  ])

  const totalExpenses = filteredExpenses.reduce(
    (total, expense) => total + expense.amount,
    0
  )
  const highestExpense = Math.max(
    0,
    ...filteredExpenses.map(expense => expense.amount)
  )
  const averageExpense = filteredExpenses.length
    ? totalExpenses / filteredExpenses.length
    : 0

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
      label: 'Promedio por gasto',
      value: formatMoney(averageExpense),
      icon: Calculator,
      color: 'fuchsia'
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
      percentage: totalExpenses > 0 ? amount / totalExpenses * 100 : 0
    }
  }).filter(category => category.amount > 0)

  const branchTotals = branches
    .map(branch => ({
      id: branch.id,
      name: branch.name,
      amount: filteredExpenses
        .filter(expense => String(expense.branch_id) === String(branch.id))
        .reduce((total, expense) => total + expense.amount, 0)
    }))
    .filter(branch => branch.amount > 0)
    .sort((left, right) => right.amount - left.amount)
  const highestBranchTotal = Math.max(
    0,
    ...branchTotals.map(branch => branch.amount)
  )

  const recentMonths = createRecentMonths()
  const monthlyTotals = recentMonths.map(month => {
    const amount = filteredExpenses
      .filter(expense => expense.date.startsWith(month.key))
      .reduce((total, expense) => total + expense.amount, 0)

    return {
      ...month,
      amount
    }
  })
  const highestMonthlyTotal = Math.max(
    0,
    ...monthlyTotals.map(month => month.amount)
  )

  const toggleForm = () => {
    setIsFormOpen(previous => !previous)
  }

  const getBranchName = id =>
    branches.find(branch => String(branch.id) === String(id))?.name ||
    'Sucursal no encontrada'

  const handleCreateExpense = async form => {
    await createExpense(form)
    await loadExpenses()
  }

  const renderEmptyChart = message => (
    <p className="inventory-empty">{message}</p>
  )

  return (
    <section className="expenses-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">ADMINISTRACIÓN</span>
          <h1>Control de gastos</h1>
          <p>Administrá los gastos operativos del restaurante.</p>
        </div>

        <button
          type="button"
          className="inventory-primary-button"
          onClick={toggleForm}
          disabled={isLoadingBranches || !branches.length}
          title={branchError || undefined}
        >
          <Plus size={20} />
          Nuevo gasto
        </button>
      </div>

      {loadError && (
        <p className="inventory-empty expenses-error" role="alert">
          {loadError}
        </p>
      )}
      {branchError && (
        <p className="inventory-empty expenses-error" role="alert">
          {branchError}
        </p>
      )}

      <div className="inventory-stats">
        {statistics.map(stat => {
          const StatIcon = stat.icon

          return (
            <article className="inventory-stat-card" key={stat.label}>
              <span className={`inventory-stat-icon ${stat.color}`}>
                <StatIcon size={24} />
              </span>
              <div>
                <strong>
                  {isLoading || loadError ? '—' : stat.value}
                </strong>
                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      <section className="expense-visual-grid">
        <section className="expense-distribution">
          <div className="expense-distribution-heading">
            <div>
              <h2>Distribución por categoría</h2>
              <p>Montos y proporción de los gastos filtrados.</p>
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
            {!isLoading && !categoryTotals.length &&
              renderEmptyChart('No hay gastos para mostrar por categoría.')}
          </div>
        </section>

        <section className="expense-distribution">
          <div className="expense-distribution-heading">
            <div>
              <h2>Gastos por sucursal</h2>
              <p>Comparación según los filtros seleccionados.</p>
            </div>
            <span className="expense-distribution-icon">
              <Wallet size={24} />
            </span>
          </div>

          <div className="expense-chart">
            {branchTotals.map(branch => (
              <div className="expense-chart-item" key={branch.id}>
                <div className="expense-chart-label">
                  <span>{branch.name}</span>
                  <strong>{formatMoney(branch.amount)}</strong>
                </div>
                <div className="expense-chart-track">
                  <div
                    className="expense-chart-bar blue"
                    style={{
                      width: `${highestBranchTotal
                        ? branch.amount / highestBranchTotal * 100
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            ))}
            {!isLoading && !branchTotals.length &&
              renderEmptyChart('No hay gastos por sucursal para mostrar.')}
          </div>
        </section>

        <section className="expense-distribution expense-monthly">
          <div className="expense-distribution-heading">
            <div>
              <h2>Tendencia mensual</h2>
              <p>Gastos registrados durante los últimos seis meses.</p>
            </div>
            <span className="expense-distribution-icon">
              <Receipt size={24} />
            </span>
          </div>

          <div className="expense-month-chart">
            {monthlyTotals.map(month => (
              <div className="expense-month-item" key={month.key}>
                <div className="expense-month-bar-track">
                  <div
                    className="expense-month-bar"
                    style={{
                      height: `${highestMonthlyTotal
                        ? month.amount / highestMonthlyTotal * 100
                        : 0}%`
                    }}
                    title={formatMoney(month.amount)}
                  />
                </div>
                <strong>{formatMoney(month.amount)}</strong>
                <span>{month.label}</span>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>Registro de gastos</h2>
          <p>Consultá los gastos realizados en cada sucursal.</p>
        </div>

        <div className="inventory-filters expenses-filters">
          <label className="inventory-field">
            <span>Sucursal</span>
            <select
              value={branchFilter}
              onChange={event => setBranchFilter(event.target.value)}
              disabled={isLoadingBranches}
            >
              <option value="ALL">Todas las sucursales</option>
              {branches.map(branch => (
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
              onChange={event => setCategoryFilter(event.target.value)}
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
            <span>Desde</span>
            <input
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={event => setFromDate(event.target.value)}
            />
          </label>

          <label className="inventory-field">
            <span>Hasta</span>
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={event => setToDate(event.target.value)}
            />
          </label>

          <label className="inventory-field">
            <span>Buscar gasto</span>
            <div className="inventory-search">
              <Search size={19} />
              <input
                type="search"
                placeholder="Buscar por concepto..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
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
                <th>Fecha de registro</th>
                <th>Monto</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && !loadError && filteredExpenses.map(expense => {
                const category = getCategory(expense.category)

                return (
                  <tr key={expense.id}>
                    <td><strong>{expense.description}</strong></td>
                    <td>
                      <span className={`expense-category ${category.color}`}>
                        {category.name}
                      </span>
                    </td>
                    <td>{getBranchName(expense.branch_id)}</td>
                    <td>{formatDate(expense.date)}</td>
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

              {isLoading && (
                <tr>
                  <td colSpan={6} className="inventory-empty">
                    Cargando gastos...
                  </td>
                </tr>
              )}
              {!isLoading && loadError && (
                <tr>
                  <td colSpan={6} className="inventory-empty">
                    No se pudo cargar el registro de gastos.
                  </td>
                </tr>
              )}
              {!isLoading && !loadError && !filteredExpenses.length && (
                <tr>
                  <td colSpan={6} className="inventory-empty">
                    No se encontraron gastos para los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inventory-panel-footer">
          {isLoading
            ? 'Cargando registro...'
            : `Mostrando ${filteredExpenses.length} de ${expenses.length} gastos`}
        </div>
      </section>

      <ExpenseForm
        isOpen={isFormOpen}
        toggle={toggleForm}
        onSubmit={handleCreateExpense}
        branches={branches}
        categories={CATEGORIES}
        isSubmitting={isLoading}
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
            ? getCategory(selectedExpense.category).name
            : ''
        }
        onClose={() => setSelectedExpense(null)}
      />
    </section>
  )
}

export default ExpensesPage
