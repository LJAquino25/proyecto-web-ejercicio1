import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Truck,
  ShoppingCart,
  Wallet,
  Search,
  Eye,
  Pencil
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'
import '../../styles/PurchasesPage.css'

import SupplierForm from '../../components/admin/SupplierForm'
import SupplierPaymentForm from '../../components/admin/SupplierPaymentForm'
import PurchaseDetail from '../../components/admin/PurchaseDetail'
import PurchaseForm from '../../components/admin/PurchaseForm'

const MOCK_SUPPLIERS = [
  {
    id: 1,
    name: 'Especias y Condimentos El Comal',
    phone: '2231-8090'
  },
  {
    id: 2,
    name: 'Lácteos del Valle',
    phone: '2222-0102'
  },
  {
    id: 3,
    name: 'Café de Occidente',
    phone: '2222-0103'
  },
  {
    id: 4,
    name: 'Distribuidora La Central',
    phone: '2222-0101'
  }
]

const MOCK_PURCHASES = [
  {
    id: 1,
    supplier_id: 2,
    supplier: 'Lácteos del Valle',
    branch_id: 1,
    branch: 'Centro Histórico',
    document_num: 'FAC-001',
    payment_terms: 'CREDIT',
    issue_date: '2026-11-25',
    due_date: '2026-12-10',
    subtotal: 106.19,
    tax: 13.81,
    total: 120,
    status: 'RECORDED',
    items: [
      {
        supply_id: 2,
        packaged_product_id: null,
        name: 'Queso',
        quantity: 20000,
        unit: 'G',
        unit_cost: 0.0053095,
        line_subtotal: 106.19
      }
    ]
  },
  {
    id: 2,
    supplier_id: 3,
    supplier: 'Café de Occidente',
    branch_id: 2,
    branch: 'Escalón',
    document_num: 'FAC-002',
    payment_terms: 'CASH',
    issue_date: '2026-11-24',
    due_date: null,
    subtotal: 75.22,
    tax: 9.78,
    total: 85,
    status: 'RECORDED',
    items: [
      {
        supply_id: 3,
        packaged_product_id: null,
        name: 'Café molido',
        quantity: 10000,
        unit: 'G',
        unit_cost: 0.007522,
        line_subtotal: 75.22
      }
    ]
  },
  {
    id: 3,
    supplier_id: 4,
    supplier: 'Distribuidora La Central',
    branch_id: 1,
    branch: 'Centro Histórico',
    document_num: 'FAC-003',
    payment_terms: 'CREDIT',
    issue_date: '2026-11-23',
    due_date: '2026-12-15',
    subtotal: 265.49,
    tax: 34.51,
    total: 300,
    status: 'RECORDED',
    items: [
      {
        supply_id: 1,
        packaged_product_id: null,
        name: 'Harina de maíz',
        quantity: 50000,
        unit: 'G',
        unit_cost: 0.003,
        line_subtotal: 150
      },
      {
        supply_id: null,
        packaged_product_id: 5,
        name: 'Agua embotellada',
        quantity: 100,
        unit: 'UNIT',
        unit_cost: 0.35,
        line_subtotal: 35
      },
      {
        supply_id: null,
        packaged_product_id: 6,
        name: 'Gaseosa',
        quantity: 100,
        unit: 'UNIT',
        unit_cost: 0.8049,
        line_subtotal: 80.49
      }
    ]
  }
]
const MOCK_PAYABLES = [
  {
    id: 1,
    purchase_id: 1,
    supplier_id: 2,
    document_num: 'FAC-001',
    supplier: 'Lácteos del Valle',
    total_amount: 120,
    pending_balance: 120,
    due_date: '2026-12-10',
    status: 'PENDING',
    payments: []
  },
  {
    id: 2,
    purchase_id: 3,
    supplier_id: 4,
    document_num: 'FAC-003',
    supplier: 'Distribuidora La Central',
    total_amount: 300,
    pending_balance: 250,
    due_date: '2026-12-15',
    status: 'PARTIAL',
    payments: [
      {
        id: 1,
        amount: 50,
        method: 'TRANSFER',
        reference: 'TRF-001',
        paid_at: '2026-11-24T10:30:00-06:00'
      }
    ]
  }
].map(payable => ({
  ...payable,
  paid:
    payable.total_amount -
    payable.pending_balance
}))

const STATUS_LABELS = {
  RECORDED: 'Registrada',
  VOID: 'Anulada',
  PENDING: 'Pendiente',
  PARTIAL: 'Pago parcial',
  PAID: 'Pagada'
}

const PAYMENT_LABELS = {
  CASH: 'Contado',
  CREDIT: 'Crédito'
}

const formatMoney = value =>
  `$${Number(value).toFixed(2)}`

const TABS = [
  {
    id: 'suppliers',
    label: 'Proveedores',
    icon: Truck,
    button: 'Nuevo proveedor',
    title: 'Registro de proveedores',
    description: 'Consultá los proveedores del restaurante.',
    data: MOCK_SUPPLIERS,
    columns: [
      { key: 'name', label: 'Proveedor' },
      { key: 'phone', label: 'Teléfono' }
    ]
  },
  {
    id: 'purchases',
    label: 'Compras',
    icon: ShoppingCart,
    button: 'Nueva compra',
    title: 'Registro de compras',
    description: 'Consultá las adquisiciones realizadas.',
    data: MOCK_PURCHASES,
    columns: [
      { key: 'document_num', label: 'Documento' },
      { key: 'supplier', label: 'Proveedor' },
      { key: 'branch', label: 'Sucursal' },
      { key: 'issue_date', label: 'Fecha' },
      { key: 'payment_terms', label: 'Condición de pago' },
      {
        key: 'total',
        label: 'Total',
        format: formatMoney
      },
      { key: 'status', label: 'Estado' }
    ]
  },
  {
    id: 'payables',
    label: 'Cuentas por pagar',
    icon: Wallet,
    button: 'Registrar pago',
    title: 'Cuentas por pagar',
    description: 'Consultá las obligaciones con proveedores.',
    data: MOCK_PAYABLES,
    columns: [
      { key: 'document_num', label: 'Documento' },
      { key: 'supplier', label: 'Proveedor' },
      {
        key: 'total_amount',
        label: 'Monto total',
        format: formatMoney
      },
      {
        key: 'paid',
        label: 'Pagado',
        format: formatMoney
      },
      {
        key: 'pending_balance',
        label: 'Saldo pendiente',
        format: formatMoney
      },
      { key: 'due_date', label: 'Vencimiento' },
      { key: 'status', label: 'Estado' }
    ]
  }
]

function PurchasesPage() {
  const [activeTab, setActiveTab] = useState('suppliers')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedDetail, setSelectedDetail] = useState(null)

  const [isPurchaseFormOpen, setIsPurchaseFormOpen] =
  useState(false)

  const togglePurchaseForm = () => {
  setIsPurchaseFormOpen(previous => !previous)
}

  const [isSupplierFormOpen, setIsSupplierFormOpen] =
    useState(false)

  const [isPaymentFormOpen, setIsPaymentFormOpen] =
    useState(false)

  const toggleSupplierForm = () => {
    setIsSupplierFormOpen(previous => !previous)
  }

  const togglePaymentForm = () => {
    setIsPaymentFormOpen(previous => !previous)
  }

  const currentTab = TABS.find(tab => tab.id === activeTab)

  const isSuppliers = activeTab === 'suppliers'

 const openCurrentForm = () => {
  if (activeTab === 'suppliers') {
    toggleSupplierForm()
  }

  if (activeTab === 'purchases') {
    togglePurchaseForm()
  }

  if (activeTab === 'payables') {
    togglePaymentForm()
  }
}

  const openDetail = record => {
    setSelectedDetail({
      type: activeTab,
      record
    })
  }

  const closeDetail = () => {
    setSelectedDetail(null)
  }

  const totalPayables = MOCK_PAYABLES.reduce(
    (total, payable) => total + payable.pending_balance,
    0
  )

  const statistics = [
    {
      label: 'Proveedores registrados',
      value: MOCK_SUPPLIERS.length,
      icon: Truck,
      color: 'blue'
    },
    {
      label: 'Compras registradas',
      value: MOCK_PURCHASES.filter(
        purchase => purchase.status === 'RECORDED'
      ).length,
      icon: ShoppingCart,
      color: 'yellow'
    },
    {
      label: 'Saldo pendiente',
      value: formatMoney(totalPayables),
      icon: Wallet,
      color: 'pink'
    }
  ]

  const availableStatuses = [
    ...new Set(
      currentTab.data
        .map(record => record.status)
        .filter(Boolean)
    )
  ]

  const changeTab = tab => {
    setActiveTab(tab)
    setSearchTerm('')
    setStatusFilter('ALL')
    setSelectedDetail(null)
  }

  const getCellValue = (record, column) => {
    const value = record[column.key]

    if (column.key === 'status') {
      return STATUS_LABELS[value] || value
    }

    if (column.key === 'payment_terms') {
      return PAYMENT_LABELS[value] || value
    }

    if (value == null || value === '') {
      return 'No registrado'
    }

    return column.format ? column.format(value) : value
  }

  const filteredRecords = currentTab.data.filter(record => {
    const search = searchTerm.trim().toLowerCase()

    const matchesSearch = currentTab.columns.some(column =>
      String(getCellValue(record, column))
        .toLowerCase()
        .includes(search)
    )

    const matchesStatus =
      isSuppliers ||
      statusFilter === 'ALL' ||
      record.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const renderCell = (record, column) => {
    const value = record[column.key]

    if (column.key === 'status') {
      return (
        <span
          className={`purchase-status ${value.toLowerCase()}`}
        >
          {STATUS_LABELS[value] || value}
        </span>
      )
    }

    if (column.key === 'payment_terms') {
      return (
        <span
          className={`purchase-payment-type ${value.toLowerCase()}`}
        >
          {PAYMENT_LABELS[value] || value}
        </span>
      )
    }

    return getCellValue(record, column)
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
            Gestioná las compras y el abastecimiento
            del restaurante.
          </p>
        </div>

        <button
  type="button"
  className="inventory-primary-button"
  onClick={openCurrentForm}
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

        <div
          className={`inventory-filters purchases-filters ${
            isSuppliers ? 'suppliers-filters' : ''
          }`}
        >
          <label className="inventory-field">
            <span>
              {isSuppliers
                ? 'Buscar proveedor'
                : 'Buscar registro'}
            </span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder={
                  isSuppliers
                    ? 'Buscar por nombre o teléfono...'
                    : 'Buscar registro...'
                }
                value={searchTerm}
                onChange={event =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </label>

          {!isSuppliers && (
            <label className="inventory-field">
              <span>Estado</span>

              <select
                value={statusFilter}
                onChange={event =>
                  setStatusFilter(event.target.value)
                }
              >
                <option value="ALL">
                  Todos los estados
                </option>

                {availableStatuses.map(status => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="inventory-table-wrapper">
          <table
            className={`inventory-table purchases-table ${
              isSuppliers ? 'suppliers-table' : ''
            }`}
          >
            <thead>
              <tr>
                {currentTab.columns.map(column => (
                  <th key={column.key}>
                    {column.label}
                  </th>
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
                        [
                          'total',
                          'total_amount',
                          'pending_balance',
                          'paid'
                        ].includes(column.key)
                          ? 'purchase-money'
                          : ''
                      }
                    >
                      {renderCell(record, column)}
                    </td>
                  ))}

                  <td>
                    <div className="purchase-actions">
                      {isSuppliers ? (
                        <button
                          type="button"
                          className="purchase-action edit"
                          title="Editar proveedor"
                          aria-label="Editar proveedor"
                          disabled
                        >
                          <Pencil size={17} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="purchase-action view"
                          title="Ver detalle"
                          aria-label="Ver detalle"
                          onClick={() => openDetail(record)}
                        >
                          <Eye size={18} />
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

           <SupplierForm
        isOpen={isSupplierFormOpen}
        toggle={toggleSupplierForm}
      />

            <SupplierForm
        isOpen={isSupplierFormOpen}
        toggle={toggleSupplierForm}
      />

      <PurchaseForm
        isOpen={isPurchaseFormOpen}
        toggle={togglePurchaseForm}
        suppliers={MOCK_SUPPLIERS}
      />

      <SupplierPaymentForm
        isOpen={isPaymentFormOpen}
        toggle={togglePaymentForm}
        payables={MOCK_PAYABLES}
      />

      <PurchaseDetail
        selection={selectedDetail}
        onClose={closeDetail}
      />
    </section>
  )
}

export default PurchasesPage