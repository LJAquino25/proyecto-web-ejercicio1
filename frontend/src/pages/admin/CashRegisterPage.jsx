import { useCallback, useEffect, useMemo, useState } from 'react'
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
  Clock,
  X
} from 'lucide-react'

import { getBranches } from '../../services/catalogService'
import {
  closeCashShift,
  getCashRegisterHistory,
  openCashShift
} from '../../services/cashRegisterService'
import { getSession } from '../../services/authService'
import '../../styles/InventoryPage.css'
import '../../styles/CashRegisterPage.css'
import CashRegisterForm from '../../components/admin/CashRegisterForm'

const formatDate = value => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('es-SV', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date)
}

const formatMoney = value => Number(value || 0).toFixed(2)

function CashRegisterPage() {
  const session = getSession()
  const isEmployee = session?.accountType === 'employee'
  const assignedBranchId = session?.branchId
  const isCashier = isEmployee && String(session?.role || '').toUpperCase() === 'CAJERO'
  const canOperateCash = isEmployee && isCashier && Boolean(assignedBranchId)
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState('')
  const [registers, setRegisters] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState('open')
  const [selectedRegister, setSelectedRegister] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  const loadData = useCallback(async () => {
    setLoadError('')
    try {
      const [branchData, registerData] = await Promise.all([
        getBranches(),
        getCashRegisterHistory()
      ])
      const availableBranches = isEmployee
        ? branchData.filter(branch => Number(branch.id) === Number(assignedBranchId))
        : branchData
      setBranches(availableBranches)
      setRegisters(registerData)
      setBranchId(currentBranchId => {
        if (availableBranches.some(branch => Number(branch.id) === Number(currentBranchId))) {
          return currentBranchId
        }
        return availableBranches.length ? String(availableBranches[0].id) : ''
      })
    } catch (error) {
      setLoadError(error.message || 'No se pudo cargar la información de caja.')
    } finally {
      setLoading(false)
    }
  }, [assignedBranchId, isEmployee])

  useEffect(() => {
    loadData()
  }, [loadData])

  const selectedBranch = branches.find(
    branch => Number(branch.id) === Number(branchId)
  )

  const branchRegisters = useMemo(
    () => registers.filter(register => Number(register.branchId) === Number(branchId)),
    [registers, branchId]
  )

  const currentRegister = branchRegisters.find(register => register.status === 'OPEN')
  const isOpen = Boolean(currentRegister)
  const openingAmount = Number(currentRegister?.openingAmount || 0)
  const cashIncome = Number(currentRegister?.salesByMethod?.cash || 0)
  const cardIncome = Number(currentRegister?.salesByMethod?.card || 0)
  const bitcoinIncome = Number(currentRegister?.salesByMethod?.bitcoinChivo || 0)
  const expectedCash = Number(currentRegister?.expectedCash || 0)
  const totalIncome = Number(currentRegister?.totalSales || 0)

  const statistics = [
    { label: 'Efectivo', value: cashIncome, icon: Banknote, color: 'yellow' },
    { label: 'Tarjeta', value: cardIncome, icon: CreditCard, color: 'pink' },
    { label: 'Pagos digitales / transferencia', value: bitcoinIncome, icon: Bitcoin, color: 'blue' }
  ]

  const filteredRegisters = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return branchRegisters.filter(register => {
      const matchesSearch =
        String(register.cashier || '').toLowerCase().includes(search) ||
        formatDate(register.openedAt).toLowerCase().includes(search)
      const matchesStatus =
        statusFilter === 'ALL' || register.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [branchRegisters, searchTerm, statusFilter])

  const openForm = mode => {
    setFormMode(mode)
    setIsFormOpen(true)
  }

  const handleCashSubmit = async payload => {
    if (!canOperateCash) {
      throw new Error('Solo los empleados con cargo de cajero pueden operar la caja.')
    }

    if (!selectedBranch) {
      throw new Error('Seleccioná una sucursal válida.')
    }

    if (formMode === 'close') {
      await closeCashShift({
        countedCash: payload.countedCash,
        branch: selectedBranch.name,
        notes: payload.notes
      })
    } else {
      await openCashShift({
        openingAmount: payload.openingAmount,
        branch: selectedBranch.name
      })
    }

    setSelectedRegister(null)
    await loadData()
    setIsFormOpen(false)
  }

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
          <p>Administrá las aperturas, cierres e ingresos de caja.</p>
        </div>
      </div>

      {loadError && <p className="cash-page-error" role="alert">{loadError}</p>}
      {!canOperateCash && (
        <p className="cash-page-notice" role="status">
          {isCashier
            ? 'No se encontró la sucursal asignada a tu cuenta. Volvé a iniciar sesión.'
            : 'Solo los empleados con cargo de cajero pueden abrir o cerrar caja.'}
        </p>
      )}

      <div className="cash-branch-selector">
        <label className="inventory-field">
          <span>Sucursal</span>
          <select
            value={branchId}
            onChange={event => {
              setBranchId(event.target.value)
              setSelectedRegister(null)
            }}
            disabled={loading || branches.length === 0}
          >
            <option value="">Seleccionar sucursal</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        </label>
      </div>

      <section className={`cash-current-card ${isOpen ? 'open' : 'closed'}`}>
        <div className="cash-current-heading">
          <div className="cash-current-title">
            <span className="cash-current-icon"><Wallet size={28} /></span>
            <h2>Caja actual</h2>
          </div>
          <span className={`cash-status ${isOpen ? 'open' : 'closed'}`}>
            {isOpen ? <LockOpen size={15} /> : <Lock size={15} />}
            {loading ? 'Cargando' : isOpen ? 'Abierta' : 'Cerrada'}
          </span>
        </div>

        {isOpen ? (
          <>
            <div className="cash-current-balance">
              <span>Saldo esperado en efectivo</span>
              <strong>${formatMoney(expectedCash)}</strong>
            </div>

            <div className="cash-current-details">
              <div>
                <span>Monto de apertura</span>
                <strong>${formatMoney(openingAmount)}</strong>
              </div>
              <div>
                <span>Ventas en efectivo</span>
                <strong>${formatMoney(cashIncome)}</strong>
              </div>
              <div>
                <span>Total de ventas</span>
                <strong>${formatMoney(totalIncome)}</strong>
              </div>
            </div>

            <div className="cash-current-footer">
              <span className="cash-current-employee">
                <Clock size={17} />
                Responsable: {currentRegister.cashier}
              </span>
              <button
                type="button"
                className="inventory-primary-button"
                onClick={() => openForm('close')}
                disabled={!canOperateCash}
              >
                <Lock size={19} />
                Cerrar caja
              </button>
            </div>
          </>
        ) : (
          <div className="cash-closed-content">
            <h3>{loading ? 'Cargando turnos...' : 'No hay una caja abierta'}</h3>
            <p>
              {selectedBranch
                ? `Realizá una apertura para iniciar las operaciones de ${selectedBranch.name}.`
                : 'Seleccioná una sucursal para consultar o abrir su caja.'}
            </p>
            <button
              type="button"
              className="inventory-primary-button"
              onClick={() => openForm('open')}
              disabled={loading || !selectedBranch || !canOperateCash}
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
            <article className="inventory-stat-card" key={stat.label}>
              <span className={`inventory-stat-icon ${stat.color}`}>
                <StatIcon size={24} />
              </span>
              <div>
                <strong>${formatMoney(stat.value)}</strong>
                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>Historial de caja</h2>
          <p>Consultá las aperturas y cierres registrados en esta sucursal.</p>
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
                <th>Fecha de apertura</th>
                <th>Responsable</th>
                <th>Apertura</th>
                <th>Efectivo contado</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegisters.map(register => (
                <tr key={register.id}>
                  <td>{formatDate(register.openedAt)}</td>
                  <td><strong>{register.cashier || '—'}</strong></td>
                  <td>${formatMoney(register.openingAmount)}</td>
                  <td>
                    {register.countedCash === null
                      ? '—'
                      : `$${formatMoney(register.countedCash)}`}
                  </td>
                  <td>
                    <span className={`cash-status ${String(register.status).toLowerCase()}`}>
                      {register.status === 'OPEN' ? 'Abierta' : 'Cerrada'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="cash-detail-button"
                      title="Ver detalle del turno"
                      aria-label={`Ver detalle del turno ${register.id}`}
                      onClick={() => setSelectedRegister(register)}
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredRegisters.length === 0 && (
                <tr>
                  <td colSpan={6} className="inventory-empty">
                    No se encontraron registros de caja.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={6} className="inventory-empty">
                    Cargando historial...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedRegister && (
          <section className="cash-detail-panel" aria-live="polite">
            <div className="cash-detail-heading">
              <h3>Detalle del turno #{selectedRegister.id}</h3>
              <button
                type="button"
                className="cash-detail-close"
                onClick={() => setSelectedRegister(null)}
                aria-label="Cerrar detalle"
              >
                <X size={18} />
              </button>
            </div>
            <div className="cash-detail-values">
              <span>Efectivo vendido: <strong>${formatMoney(selectedRegister.salesByMethod.cash)}</strong></span>
              <span>Tarjeta: <strong>${formatMoney(selectedRegister.salesByMethod.card)}</strong></span>
              <span>Pagos digitales / transferencia: <strong>${formatMoney(selectedRegister.salesByMethod.bitcoinChivo)}</strong></span>
              <span>Efectivo esperado: <strong>${formatMoney(selectedRegister.expectedCash)}</strong></span>
              <span>Efectivo contado: <strong>{selectedRegister.countedCash === null ? '—' : `$${formatMoney(selectedRegister.countedCash)}`}</strong></span>
              {selectedRegister.difference !== null && (
                <span>Diferencia: <strong>${formatMoney(selectedRegister.difference)}</strong></span>
              )}
              {selectedRegister.notes && <span>Observaciones: {selectedRegister.notes}</span>}
            </div>
          </section>
        )}

        <div className="inventory-panel-footer">
          Mostrando {filteredRegisters.length} registros de caja
        </div>
      </section>

      <CashRegisterForm
        isOpen={isFormOpen}
        toggle={() => setIsFormOpen(false)}
        mode={formMode}
        branchName={selectedBranch?.name}
        currentRegister={currentRegister}
        onSubmit={handleCashSubmit}
      />
    </section>
  )
}

export default CashRegisterPage
