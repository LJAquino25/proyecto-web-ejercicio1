import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  DollarSign,
  Clock,
  Receipt,
  Search,
  Eye,
  X
} from 'lucide-react'

import {
  createInvoice,
  createOrder,
  getSalesInvoices,
  getSalesOrders
} from '../../services/catalogService'
import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'
import OrderForm from '../../components/admin/OrderForm'
import InvoiceForm from '../../components/admin/InvoiceForm'
import SalesDetail from '../../components/admin/SalesDetail'

const STATUS_LABELS = {
  CART: 'Pendiente',
  PAID: 'Pagado',
  IN_PREPARATION: 'En preparación',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
}

const INVOICE_LABELS = {
  NORMAL: 'Consumidor final',
  TAX_CREDIT: 'Crédito fiscal'
}

const formatDate = value => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('es-SV', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/El_Salvador'
      }).format(date)
}

const formatId = id => `#${String(id).padStart(3, '0')}`

const formatCustomer = customerId =>
  customerId ? `Cliente #${customerId}` : 'Consumidor final'

function SalesPage() {
  const [activeTab, setActiveTab] = useState('orders')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [orders, setOrders] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  const loadData = useCallback(async () => {
    setLoadError('')
    try {
      const [orderData, invoiceData] = await Promise.all([
        getSalesOrders(),
        getSalesInvoices()
      ])
      setOrders(orderData)
      setInvoices(invoiceData)
    } catch (error) {
      setLoadError(error.message || 'No se pudieron cargar las ventas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalSales = invoices.reduce(
    (total, invoice) => total + Number(invoice.total || 0),
    0
  )

  const pendingOrders = orders.filter(order => order.status === 'CART').length

  const statistics = [
    {
      label: 'Pedidos registrados',
      value: orders.length,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      label: 'Total facturado',
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: 'yellow'
    },
    {
      label: 'Pedidos pendientes',
      value: pendingOrders,
      icon: Clock,
      color: 'pink'
    }
  ]

  const changeTab = tab => {
    setActiveTab(tab)
    setSearchTerm('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
    setSelectedRecord(null)
  }

  const filteredOrders = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return orders.filter(order => {
      const matchesSearch =
        formatCustomer(order.customerId).toLowerCase().includes(search) ||
        formatId(order.id).toLowerCase().includes(search)
      const matchesStatus =
        statusFilter === 'ALL' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  const filteredInvoices = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()
    return invoices.filter(invoice => {
      const matchesSearch =
        formatCustomer(invoice.customerId).toLowerCase().includes(search) ||
        formatId(invoice.documentNumber).toLowerCase().includes(search) ||
        formatId(invoice.orderId).toLowerCase().includes(search)
      const matchesType =
        typeFilter === 'ALL' || invoice.documentType === typeFilter
      return matchesSearch && matchesType
    })
  }, [invoices, searchTerm, typeFilter])

  const invoicedOrderIds = useMemo(
    () => new Set(invoices.map(invoice => Number(invoice.orderId))),
    [invoices]
  )

  const availableOrders = useMemo(
    () =>
      orders.filter(
        order =>
          order.status !== 'CANCELLED' &&
          !invoicedOrderIds.has(Number(order.id))
      ),
    [orders, invoicedOrderIds]
  )

  const handleCreateOrder = async payload => {
    await createOrder(payload)
    await loadData()
    setIsOrderFormOpen(false)
  }

  const handleCreateInvoice = async payload => {
    await createInvoice(payload)
    await loadData()
    setIsInvoiceFormOpen(false)
  }

  return (
    <section className="sales-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">OPERACIONES</span>
          <h1>Ventas y facturación</h1>
          <p>Administrá los pedidos y comprobantes del restaurante.</p>
        </div>

        <button
          type="button"
          className="inventory-primary-button"
          onClick={() =>
            activeTab === 'orders'
              ? setIsOrderFormOpen(true)
              : setIsInvoiceFormOpen(true)
          }
        >
          <Plus size={20} />
          {activeTab === 'orders' ? 'Nuevo pedido' : 'Nueva factura'}
        </button>
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
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="sales-tabs">
        <button
          type="button"
          className={`sales-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => changeTab('orders')}
        >
          <ShoppingCart size={20} />
          Pedidos
        </button>
        <button
          type="button"
          className={`sales-tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => changeTab('invoices')}
        >
          <Receipt size={20} />
          Facturas
        </button>
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>
            {activeTab === 'orders'
              ? 'Registro de pedidos'
              : 'Registro de facturas'}
          </h2>
          <p>
            {activeTab === 'orders'
              ? 'Consultá los pedidos y su estado actual.'
              : 'Consultá los comprobantes emitidos.'}
          </p>
        </div>

        {loadError && <p className="sales-page-feedback" role="alert">{loadError}</p>}

        <div className="inventory-filters sales-filters">
          <label className="inventory-field">
            <span>Buscar registro</span>
            <div className="inventory-search">
              <Search size={19} />
              <input
                type="search"
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          {activeTab === 'orders' ? (
            <label className="inventory-field">
              <span>Estado del pedido</span>
              <select
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value)}
              >
                <option value="ALL">Todos los estados</option>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          ) : (
            <label className="inventory-field">
              <span>Tipo de comprobante</span>
              <select
                value={typeFilter}
                onChange={event => setTypeFilter(event.target.value)}
              >
                <option value="ALL">Todos los tipos</option>
                <option value="NORMAL">Consumidor final</option>
                <option value="TAX_CREDIT">Crédito fiscal</option>
              </select>
            </label>
          )}
        </div>

        <div className="inventory-table-wrapper">
          {loading ? (
            <p className="inventory-empty">Cargando ventas y facturas...</p>
          ) : activeTab === 'orders' ? (
            <table className="inventory-table sales-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td><strong>{formatId(order.id)}</strong></td>
                    <td>{formatCustomer(order.customerId)}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td className="sales-total">${Number(order.total).toFixed(2)}</td>
                    <td>
                      <span className={`sales-status ${String(order.status).toLowerCase()}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sales-detail-button"
                        title="Ver productos del pedido"
                        aria-label={`Ver pedido ${order.id}`}
                        onClick={() => setSelectedRecord({ type: 'order', data: order })}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="inventory-empty">
                      No se encontraron pedidos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="inventory-table sales-table">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={`${invoice.documentType}-${invoice.orderId}`}>
                    <td><strong>{formatId(invoice.documentNumber)}</strong></td>
                    <td>{formatCustomer(invoice.customerId)}</td>
                    <td>
                      <span className={`sales-invoice-type ${invoice.documentType === 'NORMAL' ? 'cf' : 'ccf'}`}>
                        {INVOICE_LABELS[invoice.documentType] || invoice.documentType}
                      </span>
                    </td>
                    <td>{formatDate(invoice.issuedAt)}</td>
                    <td className="sales-total">${Number(invoice.total).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="sales-detail-button"
                        title="Ver datos del comprobante"
                        aria-label={`Ver factura ${invoice.documentNumber}`}
                        onClick={() => setSelectedRecord({ type: 'invoice', data: invoice })}
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="inventory-empty">
                      No se encontraron facturas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="inventory-panel-footer">
          {activeTab === 'orders'
            ? `Mostrando ${filteredOrders.length} de ${orders.length} pedidos`
            : `Mostrando ${filteredInvoices.length} de ${invoices.length} facturas`}
        </div>
      </section>

           <OrderForm
        isOpen={isOrderFormOpen}
        toggle={() => setIsOrderFormOpen(false)}
        onSubmit={handleCreateOrder}
      />

      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        toggle={() => setIsInvoiceFormOpen(false)}
        onSubmit={handleCreateInvoice}
        orders={availableOrders}
      />

      <SalesDetail
        selection={selectedRecord}
        orders={orders}
        onClose={() => setSelectedRecord(null)}
      />
    </section>
  )
}

export default SalesPage
