import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Wallet,
  Banknote,
  CreditCard,
  Bitcoin,
  Lock,
  LockOpen,
  Search,
  Eye,
  Clock
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/CashRegisterPage.css'
import CashRegisterForm from '../../components/admin/CashRegisterForm'

const BRANCHES = [
  { id: 1, name: 'Centro Histórico' },
  { id: 2, name: 'Escalón' },
  { id: 3, name: 'Santa Elena' }
]

const CASH_REGISTERS = [
  {
    id: 1,
    branch_id: 1,
    date: '2026-11-25',
    employee: 'Ana Martínez',
    opening_amount: 50,
    closing_amount: null,
    cash: 125.50,
    card: 85,
    bitcoin: 15,
    status: 'OPEN'
  },
  {
    id: 2,
    branch_id: 1,
    date: '2026-11-24',
    employee: 'Ana Martínez',
    opening_amount: 50,
    closing_amount: 210.50,
    status: 'CLOSED'
  },
  {
    id: 3,
    branch_id: 1,
    date: '2026-11-23',
    employee: 'Carlos López',
    opening_amount: 50,
    closing_amount: 195,
    status: 'CLOSED'
  },
  {
    id: 4,
    branch_id: 2,
    date: '2026-11-24',
    employee: 'María Pérez',
    opening_amount: 40,
    closing_amount: 180,
    status: 'CLOSED'
  }
]

function CashRegisterPage() {
  const [branchId, setBranchId] = useState('1')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [isFormOpen, setIsFormOpen] = useState(false)
const [formMode, setFormMode] = useState('open')

const openForm = mode => {
  setFormMode(mode)
  setIsFormOpen(true)
}

const toggleForm = () => {
  setIsFormOpen(previous => !previous)
}

const selectedBranch = BRANCHES.find(
  branch => branch.id === Number(branchId)
)

  const currentRegister = CASH_REGISTERS.find(
    register =>
      register.branch_id === Number(branchId) &&
      register.status === 'OPEN'
  )

  const isOpen = Boolean(currentRegister)

  const openingAmount = currentRegister?.opening_amount || 0
  const cashIncome = currentRegister?.cash || 0
  const cardIncome = currentRegister?.card || 0
  const bitcoinIncome = currentRegister?.bitcoin || 0

  const expectedCash = openingAmount + cashIncome
  const totalIncome = cashIncome + cardIncome + bitcoinIncome

  const statistics = [
    {
      label: 'Efectivo',
      value: cashIncome,
      icon: Banknote,
      color: 'yellow'
    },
    {
      label: 'Tarjeta',
      value: cardIncome,
      icon: CreditCard,
      color: 'pink'
    },
    {
      label: 'Bitcoin',
      value: bitcoinIncome,
      icon: Bitcoin,
      color: 'blue'
    }
  ]

  const filteredRegisters = CASH_REGISTERS.filter(register => {
    const matchesBranch =
      register.branch_id === Number(branchId)

    const matchesSearch =
      register.employee.toLowerCase().includes(
        searchTerm.toLowerCase()
      ) || register.date.includes(searchTerm)

    const matchesStatus =
      statusFilter === 'ALL' ||
      register.status === statusFilter

    return matchesBranch && matchesSearch && matchesStatus
  })

  return (
    <section className="cash-register-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">OPERACIONES</span>
          <h1>Control de caja</h1>
          <p>
            Administrá las aperturas, cierres e ingresos de caja.
          </p>
        </div>
      </div>

      <div className="cash-branch-selector">
        <label className="inventory-field">
          <span>Sucursal</span>

          <select
            value={branchId}
            onChange={event => setBranchId(event.target.value)}
          >
            {BRANCHES.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className={`cash-current-card ${isOpen ? 'open' : 'closed'}`}>
        <div className="cash-current-heading">
          <div className="cash-current-title">
            <span className="cash-current-icon">
              <Wallet size={28} />
            </span>

            <h2>Caja actual</h2>
          </div>

          <span className={`cash-status ${isOpen ? 'open' : 'closed'}`}>
            {isOpen ? <LockOpen size={15} /> : <Lock size={15} />}
            {isOpen ? 'Abierta' : 'Cerrada'}
          </span>
        </div>

        {isOpen ? (
          <>
            <div className="cash-current-balance">
              <span>Saldo esperado en efectivo</span>
              <strong>${expectedCash.toFixed(2)}</strong>
            </div>

            <div className="cash-current-details">
              <div>
                <span>Monto de apertura</span>
                <strong>${openingAmount.toFixed(2)}</strong>
              </div>

              <div>
                <span>Ventas en efectivo</span>
                <strong>${cashIncome.toFixed(2)}</strong>
              </div>

              <div>
                <span>Total de ventas</span>
                <strong>${totalIncome.toFixed(2)}</strong>
              </div>
            </div>

            <div className="cash-current-footer">
              <span className="cash-current-employee">
                <Clock size={17} />
                Responsable: {currentRegister.employee}
              </span>

            <button
  type="button"
  className="inventory-primary-button"
  onClick={() => openForm('close')}
>
  <Lock size={19} />
  Cerrar caja
</button>
            </div>
          </>
        ) : (
          <div className="cash-closed-content">
            <h3>No hay una caja abierta</h3>

            <p>
              Realizá una apertura de caja para iniciar las operaciones
              de esta sucursal.
            </p>

            <button
  type="button"
  className="inventory-primary-button"
  onClick={() => openForm('open')}
>
  <LockOpen size={19} />
  Abrir caja
</button>
          </div>
        )}
      </section>

      <div className="cash-section-heading">
        <h2>Ingresos por método de pago</h2>
        <p>Resumen de ventas de la caja actual.</p>
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
                <strong>${stat.value.toFixed(2)}</strong>
                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>Historial de caja</h2>
          <p>Consultá las aperturas y cierres registrados.</p>
        </div>

        <div className="inventory-filters cash-filters">
          <label className="inventory-field">
            <span>Buscar registro</span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Buscar por responsable o fecha..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          <label className="inventory-field">
            <span>Estado</span>

            <select
              value={statusFilter}
              onChange={event => setStatusFilter(event.target.value)}
            >
              <option value="ALL">Todos los estados</option>
              <option value="OPEN">Abierta</option>
              <option value="CLOSED">Cerrada</option>
            </select>
          </label>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table cash-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Responsable</th>
                <th>Apertura</th>
                <th>Cierre</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredRegisters.map(register => (
                <tr key={register.id}>
                  <td>{register.date}</td>

                  <td>
                    <strong>{register.employee}</strong>
                  </td>

                  <td>${register.opening_amount.toFixed(2)}</td>

                  <td>
                    {register.closing_amount === null
                      ? '—'
                      : `$${register.closing_amount.toFixed(2)}`}
                  </td>

                  <td>
                    <span className={`cash-status ${register.status.toLowerCase()}`}>
                      {register.status === 'OPEN'
                        ? 'Abierta'
                        : 'Cerrada'}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="cash-detail-button"
                      title="Ver detalle"
                      aria-label="Ver detalle"
                      disabled
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredRegisters.length === 0 && (
                <tr>
                  <td colSpan={6} className="inventory-empty">
                    No se encontraron registros de caja.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

                <div className="inventory-panel-footer">
          Mostrando {filteredRegisters.length} registros de caja
        </div>
      </section>

      <CashRegisterForm
        isOpen={isFormOpen}
        toggle={toggleForm}
        mode={formMode}
        branchId={branchId}
        branchName={selectedBranch?.name}
        currentRegister={currentRegister}
      />
    </section>
  )
}

export default CashRegisterPage