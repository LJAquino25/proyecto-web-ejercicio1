import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Truck,
  ClipboardList,
  Receipt,
  Wallet,
  Search,
  Eye,
  Pencil
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'
import '../../styles/PurchasesPage.css'

const SUPPLIERS = [
  {
    id: 1,
    name: 'Distribuidora La Central',
    contact: 'Ana López',
    phone: '2222-0101',
    email: 'central@example.com',
    status: 'ACTIVE'
  },
  {
    id: 2,
    name: 'Lácteos del Valle',
    contact: 'Carlos Pérez',
    phone: '2222-0102',
    email: 'lacteos@example.com',
    status: 'ACTIVE'
  },
  {
    id: 3,
    name: 'Café de Occidente',
    contact: 'María García',
    phone: '2222-0103',
    email: 'cafe@example.com',
    status: 'ACTIVE'
  }
]

const PURCHASE_ORDERS = [
  {
    id: 1,
    supplier: 'Lácteos del Valle',
    branch: 'Centro Histórico',
    date: '2026-11-25',
    total: 120,
    status: 'PENDING'
  },
  {
    id: 2,
    supplier: 'Café de Occidente',
    branch: 'Escalón',
    date: '2026-11-24',
    total: 85,
    status: 'RECEIVED'
  },
  {
    id: 3,
    supplier: 'Distribuidora La Central',
    branch: 'Centro Histórico',
    date: '2026-11-23',
    total: 300,
    status: 'RECEIVED'
  }
]

const PURCHASE_INVOICES = [
  {
    id: 1,
    number: 'FAC-001',
    supplier: 'Lácteos del Valle',
    date: '2026-11-25',
    total: 120,
    status: 'PENDING'
  },
  {
    id: 2,
    number: 'FAC-002',
    supplier: 'Café de Occidente',
    date: '2026-11-24',
    total: 85,
    status: 'PAID'
  },
  {
    id: 3,
    number: 'FAC-003',
    supplier: 'Distribuidora La Central',
    date: '2026-11-23',
    total: 300,
    status: 'PARTIAL'
  }
]

const PAYABLES = [
  {
    id: 1,
    number: 'FAC-001',
    supplier: 'Lácteos del Valle',
    total: 120,
    paid: 0,
    balance: 120,
    due_date: '2026-12-10',
    status: 'PENDING'
  },
  {
    id: 2,
    number: 'FAC-003',
    supplier: 'Distribuidora La Central',
    total: 300,
    paid: 50,
    balance: 250,
    due_date: '2026-12-15',
    status: 'PARTIAL'
  }
]

const STATUS_LABELS = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  PENDING: 'Pendiente',
  RECEIVED: 'Recibida',
  CANCELLED: 'Cancelada',
  PAID: 'Pagada',
  PARTIAL: 'Pago parcial',
  OVERDUE: 'Vencida'
}

const formatMoney = value => `$${Number(value).toFixed(2)}`

const TABS = [
  {
    id: 'suppliers',
    label: 'Proveedores',
    icon: Truck,
    button: 'Nuevo proveedor',
    title: 'Registro de proveedores',
    description: 'Consultá la información de los proveedores.',
    data: SUPPLIERS,
    columns: [
      { key: 'name', label: 'Proveedor' },
      { key: 'contact', label: 'Contacto' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'email', label: 'Correo electrónico' },
      { key: 'status', label: 'Estado' }
    ]
  },
  {
    id: 'orders',
    label: 'Órdenes de compra',
    icon: ClipboardList,
    button: 'Nueva orden',
    title: 'Órdenes de compra',
    description: 'Consultá las solicitudes de compra realizadas.',
    data: PURCHASE_ORDERS,
    columns: [
      {
        key: 'id',
        label: 'Orden',
        format: value => `#${String(value).padStart(3, '0')}`
      },
      { key: 'supplier', label: 'Proveedor' },
      { key: 'branch', label: 'Sucursal' },
      { key: 'date', label: 'Fecha' },
      { key: 'total', label: 'Total', format: formatMoney },
      { key: 'status', label: 'Estado' }
    ]
  },
  {
    id: 'invoices',
    label: 'Facturas de compra',
    icon: Receipt,
    button: 'Nueva factura',
    title: 'Facturas de compra',
    description: 'Consultá los comprobantes de las compras.',
    data: PURCHASE_INVOICES,
    columns: [
      { key: 'number', label: 'Factura' },
      { key: 'supplier', label: 'Proveedor' },
      { key: 'date', label: 'Fecha' },
      { key: 'total', label: 'Total', format: formatMoney },
      { key: 'status', label: 'Estado' }
    ]
  },
  {
    id: 'payables',
    label: 'Cuentas por pagar',
    icon: Wallet,
    button: 'Registrar pago',
    title: 'Cuentas por pagar',
    description: 'Consultá los saldos pendientes con proveedores.',
    data: PAYABLES,
    columns: [
      { key: 'number', label: 'Factura' },
      { key: 'supplier', label: 'Proveedor' },
      { key: 'total', label: 'Monto total', format: formatMoney },
      { key: 'paid', label: 'Pagado', format: formatMoney },
      { key: 'balance', label: 'Saldo pendiente', format: formatMoney },
      { key: 'due_date', label: 'Vencimiento' },
      { key: 'status', label: 'Estado' }
    ]
  }
]

function PurchasesPage() {
  const [activeTab, setActiveTab] = useState('suppliers')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const currentTab = TABS.find(tab => tab.id === activeTab)

  const activeSuppliers = SUPPLIERS.filter(
    supplier => supplier.status === 'ACTIVE'
  ).length

  const pendingOrders = PURCHASE_ORDERS.filter(
    order => order.status === 'PENDING'
  ).length

  const totalPayables = PAYABLES.reduce(
    (total, payable) => total + payable.balance,
    0
  )

  const statistics = [
    {
      label: 'Proveedores activos',
      value: activeSuppliers,
      icon: Truck,
      color: 'blue'
    },
    {
      label: 'Órdenes pendientes',
      value: pendingOrders,
      icon: ClipboardList,
      color: 'yellow'
    },
    {
      label: 'Cuentas por pagar',
      value: formatMoney(totalPayables),
      icon: Wallet,
      color: 'pink'
    }
  ]

  const availableStatuses = [
    ...new Set(currentTab.data.map(record => record.status))
  ]

  const changeTab = tab => {
    setActiveTab(tab)
    setSearchTerm('')
    setStatusFilter('ALL')
  }

  const filteredRecords = currentTab.data.filter(record => {
    const search = searchTerm.trim().toLowerCase()

    const matchesSearch = currentTab.columns.some(column => {
      const value = column.format
        ? column.format(record[column.key])
        : record[column.key]

      return String(value).toLowerCase().includes(search)
    })

    const matchesStatus =
      statusFilter === 'ALL' ||
      record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const renderCell = (record, column) => {
    const value = record[column.key]

    if (column.key === 'status') {
      return (
        <span className={`purchase-status ${value.toLowerCase()}`}>
          {STATUS_LABELS[value]}
        </span>
      )
    }

    return column.format ? column.format(value) : value
  }

  return (
    <section className="purchases-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">
            ADMINISTRACIÓN
          </span>

          <h1>Compras y proveedores</h1>

          <p>
            Gestioná las compras y el abastecimiento del restaurante.
          </p>
        </div>

        <button
          type="button"
          className="inventory-primary-button"
          disabled
        >
          <Plus size={20} />
          {currentTab.button}
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

      <div className="sales-tabs purchases-tabs">
        {TABS.map(tab => {
          const TabIcon = tab.icon

          return (
            <button
              key={tab.id}
              type="button"
              className={`sales-tab ${
                activeTab === tab.id ? 'active' : ''
              }`}
              onClick={() => changeTab(tab.id)}
            >
              <TabIcon size={19} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>{currentTab.title}</h2>
          <p>{currentTab.description}</p>
        </div>

        <div className="inventory-filters purchases-filters">
          <label className="inventory-field">
            <span>Buscar registro</span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Buscar registro..."
                value={searchTerm}
                onChange={event =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </label>

          <label className="inventory-field">
            <span>Estado</span>

            <select
              value={statusFilter}
              onChange={event =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="ALL">Todos los estados</option>

              {availableStatuses.map(status => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table purchases-table">
            <thead>
              <tr>
                {currentTab.columns.map(column => (
                  <th key={column.key}>{column.label}</th>
                ))}

                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  {currentTab.columns.map(column => (
                    <td
                      key={column.key}
                      className={
                        ['total', 'balance', 'paid'].includes(column.key)
                          ? 'purchase-money'
                          : ''
                      }
                    >
                      {renderCell(record, column)}
                    </td>
                  ))}

                  <td>
                    <div className="purchase-actions">
                      <button
                        type="button"
                        className="purchase-action view"
                        title="Ver detalle"
                        aria-label="Ver detalle"
                        disabled
                      >
                        <Eye size={18} />
                      </button>

                      {activeTab === 'suppliers' && (
                        <button
                          type="button"
                          className="purchase-action edit"
                          title="Editar proveedor"
                          aria-label="Editar proveedor"
                          disabled
                        >
                          <Pencil size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={currentTab.columns.length + 1}
                    className="inventory-empty"
                  >
                    No se encontraron registros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inventory-panel-footer">
          Mostrando {filteredRecords.length} de{' '}
          {currentTab.data.length} registros
        </div>
      </section>
    </section>
  )
}

export default PurchasesPage