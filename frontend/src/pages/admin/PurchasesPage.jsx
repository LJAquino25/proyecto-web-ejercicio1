import { useState, useEffect, useCallback } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Truck,
  ShoppingCart,
  Wallet,
  Search,
  Eye,
  ClipboardList,
  Receipt,
  Pencil,
  X
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'
import '../../styles/PurchasesPage.css'

import SupplierForm from '../../components/admin/SupplierForm'
import SupplierPaymentForm from '../../components/admin/SupplierPaymentForm'
import PurchaseDetail from '../../components/admin/PurchaseDetail'
import PurchaseForm from '../../components/admin/PurchaseForm'
import PurchaseOrderForm from '../../components/admin/PurchaseOrderForm'
import PurchaseInvoiceForm from '../../components/admin/PurchaseInvoiceForm'

import { getSuppliers, createSupplier, updateSupplier, getPurchaseOrders, createPurchaseOrder, createPurchaseInvoice, getAccountPayables, createSupplierPayment } from '../../services/purchasesService'

import { getBranches } from '../../services/catalogService'
import { getInventorySupplies } from '../../services/inventoryService'

const STATUS_LABELS = {
  RECORDED: 'Registrada',
  RECEIVED: 'Recibida',
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
    data: [],
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
    description: 'Consultá las órdenes pendientes y las compras recibidas.',
    data: [],
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
    description: 'Consultá las deudas y los saldos pendientes de los proveedores.',
    data: [],
    columns: [
      { key: 'document_num', label: 'Documento' },
      { key: 'supplier', label: 'Proveedor' },
      { key: 'branch', label: 'Sucursal' },
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

  const [purchaseModal, setPurchaseModal] = useState(null)
  const closePurchaseModal = () => setPurchaseModal(null)

  const [isSupplierFormOpen, setIsSupplierFormOpen] =
    useState(false)

  const [selectedSupplier, setSelectedSupplier] = useState(null)

  const [isPaymentFormOpen, setIsPaymentFormOpen] =
    useState(false)

  const openSupplierForm = () => {
    setSelectedSupplier(null)
    setIsSupplierFormOpen(true)
  }

  const closeSupplierForm = () => {
    setIsSupplierFormOpen(false)
    setSelectedSupplier(null)
  }

  const openEditSupplier = supplier => {
    setSelectedSupplier(supplier)
    setIsSupplierFormOpen(true)
  }

  const togglePaymentForm = () => {
    setIsPaymentFormOpen(previous => !previous)
  }

  const [suppliers, setSuppliers] = useState([])
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(true)
  const [suppliersError, setSuppliersError] = useState('')

  const loadSuppliers = useCallback(async () => {
    setIsLoadingSuppliers(true)
    setSuppliersError('')
    try {
      setSuppliers(await getSuppliers())
    } catch (error) {
      setSuppliers([])
      setSuppliersError(error.message || 'No se pudieron cargar los proveedores.')
    } finally {
      setIsLoadingSuppliers(false)
    }
  }, [])

  useEffect(() => {
    loadSuppliers()
  }, [loadSuppliers])

  const handleSaveSupplier = async form => {
    if (selectedSupplier) {
      await updateSupplier(selectedSupplier.id, form)
    } else {
      await createSupplier(form)
    }

    closeSupplierForm()

    await Promise.all([loadSuppliers(), loadPurchases(), loadPayables()])
  }

  const [purchases, setPurchases] = useState([])
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(true)
  const [purchasesError, setPurchasesError] = useState('')

  const loadPurchases = useCallback(async () => {
    setIsLoadingPurchases(true)
    setPurchasesError('')

    try {
      const [orders, branches, supplies] = await Promise.all([
        getPurchaseOrders(),
        getBranches(),
        getInventorySupplies()
      ])

      setPurchases(orders.map(order => ({
        ...order,
        supplier: order.supplier_name,
        branch: branches.find(branch => Number(branch.id) === Number(order.branch_id))?.name || `Sucursal ${order.branch_id}`,
        status: order.order_status,
        due_date: order.expected_date,
        issue_date: order.issue_date ? String(order.issue_date).slice(0, 10) : null,
        items: (order.items || []).map(item => ({
          ...item,
          name: item.item_name,
          unit: item.packaged_product_id ? 'UNIT' : supplies.find(supply => Number(supply.id) === Number(item.supply_id))?.unit
        }))
      })))
    } catch (error) {
      setPurchases([])
      setPurchasesError(error.message || 'No se pudieron cargar las compras.')
    } finally {
      setIsLoadingPurchases(false)
    }
  }, [])

  useEffect(() => {
    loadPurchases()
  }, [loadPurchases])

  const handleCreateOrder = async form => {
    await createPurchaseOrder(form)
    closePurchaseModal()
    await loadPurchases()
  }

  const handleCreateInvoice = async form => {
    await createPurchaseInvoice(form)
    closePurchaseModal()
    await Promise.all([loadPurchases(), loadPayables()])
  }

  const [payables, setPayables] = useState([])
  const [isLoadingPayables, setIsLoadingPayables] = useState(true)
  const [payablesError, setPayablesError] = useState('')

  const loadPayables = useCallback(async () => {
    setIsLoadingPayables(true)
    setPayablesError('')
    try {
      const records = await getAccountPayables()
      setPayables(records.map(record => ({
        ...record,
        supplier: record.supplier_name,
        branch: record.branch_name,
        total_amount: Number(record.total_amount),
        pending_balance: Number(record.pending_balance),
        paid: Math.round((Number(record.total_amount) - Number(record.pending_balance)) * 100) / 100,
        due_date: record.due_date ? String(record.due_date).slice(0, 10) : null
      })))
    } catch (error) {
      setPayables([])
      setPayablesError(error.message || 'No se pudieron cargar las cuentas por pagar.')
    } finally {
      setIsLoadingPayables(false)
    }
  }, [])

  useEffect(() => {
    loadPayables()
  }, [loadPayables])

  const handleSupplierPayment = async form => {
    await createSupplierPayment(form)
    setIsPaymentFormOpen(false)
    setSelectedDetail(null)
    await loadPayables()
  }

  const currentTab = {
    ...TABS.find(tab => tab.id === activeTab),
    ...(activeTab === 'suppliers' ? { data: suppliers } : {}),
    ...(activeTab === 'purchases' ? { data: purchases } : {}),
    ...(activeTab === 'payables' ? { data: payables } : {})
  }

  const isPurchases = activeTab === 'purchases'
  const isSuppliers = activeTab === 'suppliers'

 const openCurrentForm = () => {
  if (activeTab === 'suppliers') {
    openSupplierForm()
  }

  if (activeTab === 'purchases') {
    setPurchaseModal('selector')
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

  const statistics = [
    {
      label: 'Proveedores registrados',
      value: isLoadingSuppliers || suppliersError ? '—' : suppliers.length,
      icon: Truck,
      color: 'blue'
    },
    {
      label: 'Compras recibidas',
      value: isLoadingPurchases || purchasesError ? '—' : purchases.filter(
        purchase => purchase.status === 'RECEIVED'
      ).length,
      icon: ShoppingCart,
      color: 'yellow'
    },
    {
      label: 'Saldo pendiente',
      value: isLoadingPayables || payablesError ? '—' : formatMoney(payables.reduce((total, payable) => total + payable.pending_balance, 0)),
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
      return isPurchases && value === 'PENDING' ? 'Pendiente de recibir' : STATUS_LABELS[value] || value
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

    if (value == null || value === '') return 'No registrado'

    if (column.key === 'status') {
      return (
        <span
          className={`purchase-status ${value === 'RECEIVED' ? 'recorded' : value.toLowerCase()}`}
        >
          {getCellValue(record, column)}
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
  disabled={activeTab === 'payables' && (isLoadingPayables || Boolean(payablesError) || !payables.some(payable => payable.pending_balance > 0 && payable.status !== 'PAID'))}
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
                    {isPurchases && status === 'PENDING' ? 'Pendiente de recibir' : STATUS_LABELS[status] || status}
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
                          className="purchase-action view"
                          title="Editar proveedor"
                          aria-label="Editar proveedor"
                          onClick={() => openEditSupplier(record)}
                        >
                          <Pencil size={18} />
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
                    {isSuppliers && isLoadingSuppliers
                      ? 'Cargando proveedores...'
                      : isSuppliers && suppliersError
                        ? suppliersError
                        : isPurchases && isLoadingPurchases
                          ? 'Cargando compras...'
                          : isPurchases && purchasesError
                            ? purchasesError
                            : activeTab === 'payables' && isLoadingPayables
                               ? 'Cargando cuentas por pagar...'
                               : activeTab === 'payables' && payablesError
                                 ? payablesError
                                 : 'No se encontraron registros.'}
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
        toggle={closeSupplierForm}
        onSubmit={handleSaveSupplier}
        supplier={selectedSupplier}
      />

      <Modal isOpen={purchaseModal === 'selector'} toggle={closePurchaseModal} centered className="admin-form-modal">
        <ModalBody className="admin-form-body">
          <div className="admin-form-heading">
            <span className="admin-form-icon"><ShoppingCart size={28} /></span>
            <div>
              <span className="admin-eyebrow">COMPRAS Y PROVEEDORES</span>
              <h2>Nueva compra</h2>
            </div>
            <button type="button" className="admin-form-close" onClick={closePurchaseModal} aria-label="Cerrar"><X size={24} /></button>
          </div>
          <p className="admin-form-description">Seleccioná el tipo de operación que deseás realizar.</p>
          <div className="d-flex flex-column gap-3">
            {[
              { id: 'order', icon: ClipboardList, title: 'Orden de compra', description: 'Solicitar artículos a un proveedor.' },
              { id: 'invoice', icon: Receipt, title: 'Recepción de compra', description: 'Registrar la factura de una orden pendiente.' },
              { id: 'direct', icon: ShoppingCart, title: 'Compra directa', description: 'Registrar una compra sin orden previa.' }
            ].map(option => {
              const Icon = option.icon
              return (
                <button key={option.id} type="button" className="purchase-payment-option text-start w-100" onClick={() => setPurchaseModal(option.id)}>
                  <Icon size={28} />
                  <strong>{option.title}</strong>
                  <small>{option.description}</small>
                </button>
              )
            })}
          </div>
        </ModalBody>
      </Modal>

      <PurchaseOrderForm
  isOpen={purchaseModal === 'order'}
  toggle={closePurchaseModal}
  onSubmit={handleCreateOrder}
/>
      <PurchaseInvoiceForm
  isOpen={purchaseModal === 'invoice'}
  toggle={closePurchaseModal}
  onSubmit={handleCreateInvoice}
/>
      <PurchaseForm
  isOpen={purchaseModal === 'direct'}
  toggle={closePurchaseModal}
  onSubmit={handleCreateInvoice}
/>
      <SupplierPaymentForm
        isOpen={isPaymentFormOpen}
        toggle={togglePaymentForm}
        payables={payables}
        onSubmit={handleSupplierPayment}
      />

      <PurchaseDetail
        selection={selectedDetail}
        onClose={closeDetail}
      />
    </section>
  )
}

export default PurchasesPage